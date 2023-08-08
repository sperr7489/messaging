import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Place } from '@prisma/client';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { MessageDto } from 'src/message/dtos/message.dto';
import { MessageService } from 'src/message/message.service';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';
import { ReservationService } from 'src/reservation/reservation.service';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly reservationService: ReservationService,
    private readonly messageService: MessageService,
  ) {}
  private SPACE_URL = this.configService.get<string>('SPACE_URL');
  private SPACE_EMAIL = this.configService.get<string>('SPACE_EMAIL');
  private SPACE_PASSWORD = this.configService.get<string>('SPACE_PASSWORD');

  async crawlingReservationInfos(
    places: Place[],
    reservationMaxNumOfDb: number,
  ): Promise<MessageDto[]> {
    // 크롤링하기 전에 우선 등록되어 있는 연습실들의 정보들을 먼저 가져온다 => 불필요한 디비 접근을 막기 위해
    // const places = await this.messageService.getPlaces();

    // // 기존 예약 정보중 가장 높은 예약 번호
    // let reservationMaxNumOfDb =
    //   (await this.messageService.getMaxReservationNum()) ?? 0;

    // console.log('reservationMaxNumOfDb : ', reservationMaxNumOfDb);

    let browser: Browser | undefined;
    let page: Page;
    try {
      const url: string = this.SPACE_URL;
      browser = await puppeteer.launch({
        headless: 'new',
        // headless: false,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      page = await browser.newPage();

      await page.goto(url, { waitUntil: 'domcontentloaded' });
      const userEmail = this.SPACE_EMAIL;
      const passWord = this.SPACE_PASSWORD;

      // 아이디와 비밀번호 입력
      await page.type('#email', userEmail); // 실제 웹사이트에 맞게 셀렉터 수정 필요
      await page.type('#pw', passWord); // 실제 웹사이트에 맞게 셀렉터 수정 필요

      // 로그인 버튼 클릭
      // await page.click('#loginButton'); // 실제 웹사이트에 맞게 셀렉터 수정 필요
      const buttons = await page.$x('//fieldset/button[last()]');
      if (buttons.length > 0) {
        const buttonElement = buttons[0] as ElementHandle<Element>;
        await buttonElement.click();
      } else {
        throw new Error(
          'Button with the text "호스트 이메일로 로그인" not found',
        );
      }

      await page.waitForNavigation({});
      const spanElements = await page.$x(
        '//span[contains(@class, "sp_icon") and contains(@class, "ico_menu")]',
      );
      if (spanElements.length > 0) {
        const spanElement = spanElements[0] as ElementHandle<Element>;

        await spanElement.click();
        // 원하는 작업 수행
      } else {
        throw new Error('Span with classes sp_icon and ico_menu not found');
      }

      // 사이드바가 렌더링 할 때까지 정리
      await page.waitForSelector('div.menu_top', { timeout: 20000 });
      const liElement: ElementHandle<HTMLAnchorElement> =
        await page.waitForSelector('.menu_top li:first-child a', {
          visible: true,
          timeout: 20000,
        });

      if (liElement) {
        await liElement.click();
        // await page.evaluate((el) => el.scrollIntoView(), liElement);
      } else {
        throw new Error(
          'First "li" inside element with class "menu_top" not found',
        );
      }

      await page.waitForNavigation();

      await page.waitForSelector(
        'div.reservation_list div.list_box_wrap article',
        { timeout: 10000 },
      ); // 10초 동안 최대 대기

      await page.waitForSelector('article.list_box', { timeout: 5000 }); // 5초 동안 기다림
      // "sub_detail" 클래스를 갖는 모든 dd 태그를 가져옴
      const details = await page.$$('article.list_box');

      // 각각의 promise.all로 돌면서 반환 준비를 한다.
      const result: MessageDto[] = await Promise.all(
        details.map(async (detail) => {
          let reservationNum = await this.getInfoAboutReservation(
            detail,
            'reservation_num',
          ); // 예약번호

          const reservationNumber =
            typeof reservationNum === 'string'
              ? Number(reservationNum.match(/예약번호(.+)$/)[1])
              : null;

          if (reservationNumber > reservationMaxNumOfDb) {
            // 최대 예약 번호 이하인 경우에는 이미 크롤링이 완료된 것이기에 크롤링 작업할 필요 없다.
            const tagReservation = await this.getInfoAboutReservation(
              detail,
              'tag',
            ); // 예약 확정 여부

            if (tagReservation == '예약확정') {
              // 작업이 시작될 때
              const placeReservation = await this.getInfoAboutReservation(
                detail,
                'place',
              ); // 예약 공간 정보
              const dateReservation = await this.getInfoAboutReservation(
                detail,
                'date',
              ); // 예약 날짜 시간
              const nameReservation = await this.getInfoAboutReservation(
                detail,
                'user',
              ); // 예약자명
              const telReservation = await this.getInfoAboutReservation(
                detail,
                'tel',
              ); // 예약자 전화번호
              const price = await this.getInfoAboutReservation(detail, 'price'); // 예약자 전화번호

              /**
               * 1. 데이터베이스에 저장되어 있는 reservation에 정보들을 가져온다.
               * 2. 유저를 구별할 수 있는것은 이름과 전화번호의 조합으로 식별 가능하다.
               * 3. 장소를 구별하기 위해선 description이 그 정보가 된다.
               */

              const reservation = new ReservationInfo(
                nameReservation,
                telReservation,
                tagReservation,
                dateReservation,
                placeReservation,
                reservationNumber,
                price,
              );

              const placeInfo = reservation.placeDescription.replace(
                /,| /g,
                '',
              );

              let place = places.find(
                (place) => place.description == placeInfo,
              );

              // 디비에 없는 장소면 추가 저장
              if (!place) {
                place = await this.reservationService.createPlace(placeInfo);
              }

              // 예약 정보 수정
              await this.reservationService.postReservation(
                reservation,
                place.id,
              );
              // sms 메시지 로직
              const phoneNumber = reservation.phoneNumber.replace(/-/g, '');

              return {
                phoneNumber: phoneNumber,
                message: place.message,
                description: place.description,
                reservationNum: reservation.reservationNum,
              };
            }
          }
        }),
      );

      // 페이지 닫기 전 확인
      // await page.close();
      return result.filter((v) => v !== undefined);
    } catch (error) {
      console.error(error);
    } finally {
      if (page) await page.close(); // 페이지를 닫습니다. 페이지 관련 리소스가 해제됩니다.
      if (browser) await browser.close(); // 브라우저를 닫습니다. 브라우저 관련 리소스가 해제됩니다.
    }
  }

  async startCrawling(places: Place[], reservationMaxNumOfDb: number) {
    try {
      return await this.crawlingReservationInfos(places, reservationMaxNumOfDb);
    } catch (error) {
      console.error('Error logging in:', error);
      setTimeout(this.startCrawling, 5000); // 5초 후에 다시 크롤링 시작
    }
  }

  async getInfoAboutReservation(
    node: ElementHandle<HTMLElement>,
    querySelector: string,
  ) {
    const element = await node.$(`.${querySelector}`);

    if (element) {
      const text = await element.evaluate((v) => v.textContent);
      return text;
    } else {
      console.log(`Element not found for selector ${querySelector}`);
    }
  }
  // try {
  //   return await node.$eval(`.${querySelector}`, (v) => v.textContent);
  // } catch (error) {
  //   console.log(`${error} no data in ${querySelector}`);
  // }
}
