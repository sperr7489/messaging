import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Place } from '@prisma/client';
import { HostDto } from 'src/host-queue/dtos/host.dto';
import { MessageDto } from 'src/message/dtos/message.dto';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';
import { ReservationService } from 'src/reservation/reservation.service';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly reservationService: ReservationService,
    private readonly prismaService: PrismaService,
  ) {}
  private SPACE_URL = this.configService.get<string>('SPACE_URL');
  private SPACE_RESERVATIOM_URL = this.configService.get<string>(
    'SPACE_RESERVATIOM_URL',
  );
  async crawlingReservationInfosByQueue(
    places: Place[],
    reservationMaxNumOfDb: number,
    host: HostDto,
  ): Promise<MessageDto[]> {
    // let browser: Browser | undefined;
    // let page: Page;

    try {
      const hostDto = host;
      // browser = await puppeteer.launch({
      //   headless: 'new',
      //   // headless: false,
      //   args: ['--no-sandbox', '--disable-setuid-sandbox'],
      // });
      // page = await browser.newPage();

      // await page.goto(this.SPACE_URL, { waitUntil: 'domcontentloaded' });
      // const userEmail = SPACE_EMAIL;
      // const passWord = SPACE_PASSWORD;

      // // 아이디와 비밀번호 입력
      // await page.type('#email', userEmail); // 실제 웹사이트에 맞게 셀렉터 수정 필요
      // await page.type('#pw', passWord); // 실제 웹사이트에 맞게 셀렉터 수정 필요
      // await this.login(host, page);
      /**
       * 1. 로그인 로직에 대한 수정이 필요해보임.
       * 2. puppeteer를 계속해서 사용하다면 서버에 부하가 조금 많이 걸릴 수 있다.
       * 3. 이때문에 서버가 쉽게 죽을 수 있으니 response를 따서 데이터를 가져오는 식으로 작업하는 것이 좀 더 좋아보임.
       */

      // 로그인 버튼 클릭
      // await page.click('#loginButton'); // 실제 웹사이트에 맞게 셀렉터 수정 필요
      // const buttons = await page.$x('//fieldset/button[last()]');

      // if (buttons.length > 0) {
      //   const buttonElement = buttons[0] as ElementHandle<Element>;
      //   await buttonElement.click();
      // } else {
      //   throw new Error(
      //     'Button with the text "호스트 이메일로 로그인" not found',
      //   );
      // }

      // await page.waitForNavigation({});

      // await page.goto(this.SPACE_RESERVATIOM_URL, {
      //   waitUntil: 'domcontentloaded',
      // });

      const reservations = await this.getReservations(
        host,
        1,
        reservationMaxNumOfDb,
        [],
      );
      // console.log(`recursiveResult : ${recursiveResult.length}`);
      // console.log('이곳이다!', JSON.stringify(`${recursiveResult}`, null, 2));

      // let axiosResponse;
      // await axios
      //   .get('https://new-api.spacecloud.kr/partner/reservations?page=', {
      //     headers: {
      //       Authorization: host.accessToken,
      //     },
      //   })
      //   .then((response) => {
      //     axiosResponse = response;
      //   })
      //   .catch(async (e) => {
      //     const updatedHost: HostDto = await this.login(hostDto);
      //     // 해당 부분은 accessToken이 일치하지 않을때이다.
      //     this.startCrawlingByQueue(places, reservationMaxNumOfDb, updatedHost);
      //   });

      // let datas;

      // if (!axiosResponse) {
      //   console.log(`${host.spaceCloudEmail} login-started`);
      //   return;
      // } else {
      //   datas = axiosResponse.data;
      //   // console.log(JSON.stringify(datas, null, 2));
      // }

      // 가져온 데이터로 파싱 시작.
      /**
       * 필요한 정보
       * 1. 예약자 이름
       * 2. 핸드폰 번호
       * 3. 예약 태그 현황 PAY_STAT_CD가 "REFND"이면 취소환불이다. RSV_STAT_CD가 USEDC면 사용완료, RSCMP면 예약확정
       * 4. 날짜
       * 5. 장소 이름
       * 6. 예약 번호 => Id가 된다.
       * 7. 가격 정보
       */

      const result: MessageDto[] = await Promise.all(
        reservations.map(async (reservation) => {
          let tagReservation;
          if (reservation.PAY_STAT_CD == 'REFND') {
            tagReservation = '취소환불';
          } else if (reservation.RSV_STAT_CD == 'USEDC') {
            tagReservation = '이용완료';
          } else {
            tagReservation = '예약확정';
          }

          const telReservation = reservation.user_info.contact ?? '0'; // 전화번호

          const reservationNumber = reservation.id; // 예약번호
          const placeReservation = // 장소 이름
            (
              reservation.space.space_name + reservation.space.product_name
            ).replace(/\s|,/g, '');
          if (tagReservation == '취소환불' && reservationNumber) {
            await this.reservationService.cancelReservation(reservationNumber);
            return undefined;
          }

          if (tagReservation == '예약확정') {
            const dateReservation = // 이용 시간
              reservation.start_ymd +
              ' ' +
              reservation.start_hour +
              '시 ~ ' +
              reservation.end_ymd +
              ' ' +
              reservation.end_hour +
              '시';

            const price = reservation.total_price;
            const nameReservation = reservation.user_info.name;

            if (reservationNumber > reservationMaxNumOfDb) {
              const reservation = new ReservationInfo(
                nameReservation,
                telReservation,
                tagReservation,
                dateReservation,
                placeReservation,
                reservationNumber,
                price,
              );
              let place = places.find(
                (place) => place.description == placeReservation,
              );

              // promise.all 은 순차적으로 데이터를 넣는 것이 아니기 때문에 데이터를 긁어올 때 unique값을 정상적으로
              // 다루지 못할 수도 있다.

              // 디비에 없는 장소면 추가 저장
              if (!place) {
                place = await this.reservationService.createPlace(
                  placeReservation,
                  host,
                );
              }

              // 예약 정보 수정
              await this.reservationService.postReservation(
                reservation,
                place.id,
              );

              return {
                phoneNumber: telReservation,
                message: place.message,
                description: place.description,
                reservationNum: reservationNumber,
              };
            }
          }
        }),
      );

      // await page.waitForSelector(
      //   'div.reservation_list div.list_box_wrap article',
      //   { timeout: 10000 },
      // ); // 10초 동안 최대 대기

      // await page.waitForSelector('article.list_box', { timeout: 5000 }); // 5초 동안 기다림
      // // "sub_detail" 클래스를 갖는 모든 dd 태그를 가져옴
      // const details = await page.$$('article.list_box');

      // // 각각의 promise.all로 돌면서 반환 준비를 한다.
      // const result: MessageDto[] = await Promise.all(
      //   details.map(async (detail) => {
      //     const tagReservation = await this.getInfoAboutReservation(
      //       detail,
      //       'tag',
      //     ); // 예약 확정 여부

      //     let reservationNum = await this.getInfoAboutReservation(
      //       detail,
      //       'reservation_num',
      //     ); // 예약번호

      //     const reservationNumber =
      //       typeof reservationNum === 'string'
      //         ? Number(reservationNum.match(/예약번호(.+)$/)[1])
      //         : null;

      //     if (tagReservation == '취소환불' && reservationNumber) {
      //       const cancledFlag = await this.reservationService.cancelReservation(
      //         reservationNumber,
      //       );
      //       return cancledFlag == NOT_YET_CANCELED
      //         ? {
      //             phoneNumber: '0',
      //             message: '',
      //             reservationNum: reservationNumber,
      //             description: '',
      //           }
      //         : undefined;
      //     }

      //     if (tagReservation == '예약확정') {
      //       // 최대 예약 번호 이하인 경우에는 이미 크롤링이 완료된 것이기에 크롤링 작업할 필요 없다.

      //       if (reservationNumber > reservationMaxNumOfDb) {
      //         // 작업이 시작될 때
      //         const placeReservation = await this.getInfoAboutReservation(
      //           detail,
      //           'place',
      //         ); // 예약 공간 정보
      //         const dateReservation = await this.getInfoAboutReservation(
      //           detail,
      //           'date',
      //         ); // 예약 날짜 시간
      //         const nameReservation = await this.getInfoAboutReservation(
      //           detail,
      //           'user',
      //         ); // 예약자명
      //         const telReservation = await this.getInfoAboutReservation(
      //           detail,
      //           'tel',
      //         ); // 예약자 전화번호
      //         const price = await this.getInfoAboutReservation(detail, 'price'); // 예약자 전화번호

      //         /**
      //          * 1. 데이터베이스에 저장되어 있는 reservation에 정보들을 가져온다.
      //          * 2. 유저를 구별할 수 있는것은 이름과 전화번호의 조합으로 식별 가능하다.
      //          * 3. 장소를 구별하기 위해선 description이 그 정보가 된다.
      //          */

      //         const reservation = new ReservationInfo(
      //           nameReservation,
      //           telReservation,
      //           tagReservation,
      //           dateReservation,
      //           placeReservation,
      //           reservationNumber,
      //           price,
      //         );

      //         const placeInfo = reservation.placeDescription.replace(
      //           /\s|,/g,
      //           '',
      //         );

      //         let place = places.find(
      //           (place) => place.description == placeInfo,
      //         );

      //         // promise.all 은 순차적으로 데이터를 넣는 것이 아니기 때문에 데이터를 긁어올 때 unique값을 정상적으로
      //         // 다루지 못할 수도 있다.

      //         // 디비에 없는 장소면 추가 저장
      //         if (!place) {
      //           place = await this.reservationService.createPlace(
      //             placeInfo,
      //             host,
      //           );
      //         }

      //         // 예약 정보 수정
      //         await this.reservationService.postReservation(
      //           reservation,
      //           place.id,
      //         );
      //         // sms 메시지 로직
      //         const phoneNumber = reservation.phoneNumber.replace(/-/g, '');

      //         return {
      //           phoneNumber: phoneNumber,
      //           message: place.message,
      //           description: place.description,
      //           reservationNum: reservation.reservationNum,
      //         };
      //       }
      //     }
      //   }),
      // );

      // 페이지 닫기 전 확인
      // await page.close();
      return result.filter((v) => v !== undefined);
    } catch (error) {
      console.error(error);
    } finally {
      // if (page) await page.close(); // 페이지를 닫습니다. 페이지 관련 리소스가 해제됩니다.
      // if (browser) await browser.close(); // 브라우저를 닫습니다. 브라우저 관련 리소스가 해제됩니다.
    }
  }

  async startCrawlingByQueue(
    places: Place[],
    reservationMaxNumOfDb: number,
    host: HostDto,
  ) {
    return await this.crawlingReservationInfosByQueue(
      places,
      reservationMaxNumOfDb,
      host,
    );
  }

  async login(host: HostDto): Promise<HostDto> {
    // await page.goto(this.SPACE_URL, { waitUntil: 'domcontentloaded' });
    // await page.type('#email', SPACE_EMAIL); // 실제 웹사이트에 맞게 셀렉터 수정 필요
    // await page.type('#pw', SPACE_PASSWORD); // 실제 웹사이트에 맞게 셀렉터 수정 필요

    const SPACE_EMAIL = host.spaceCloudEmail;
    const SPACE_PASSWORD = host.spaceCloudPw;
    let accessToken: string;
    let updatedHost: HostDto;

    await axios
      .post('https://new-api.spacecloud.kr/partner/users/sign_in', {
        email: SPACE_EMAIL,
        password: SPACE_PASSWORD,
      })
      .then(async (v) => {
        accessToken = v.data.user.token;
        updatedHost = await this.prismaService.host.update({
          data: {
            accessToken,
          },
          where: { id: host.id },
        });
      })
      .catch((e) => console.log('not authenticated'));

    return updatedHost;
  }

  async getReservations(
    host: HostDto,
    page: number,
    reservationMaxNumOfDb: number,
    result: any[],
  ): Promise<any[]> {
    try {
      const {
        data: { reservations },
      } = await axios.get(
        `https://new-api.spacecloud.kr/partner/reservations?page=${page}`,
        {
          headers: {
            Authorization: host.accessToken,
          },
        },
      );
      const minReservation = reservations.reduce((prev, curr) => {
        return prev.id < curr.id ? prev : curr;
      });
      result.push(...reservations);
      if (minReservation.id > reservationMaxNumOfDb) {
        // 예약 정보중에 가장 예약번호가 작은 것보다 reservationMaxNumOfDb가 작다면 다음 페이지도 조회해바야한다.
        await this.getReservations(host, ++page, reservationMaxNumOfDb, result);
      }
      return result;
      // console.log('이곳이다!', JSON.stringify(minReservation, null, 2));
    } catch (error: any) {
      //로그인이 실패한 경우
      if (error.response && error.response.status === 401) {
        const updatedHost: HostDto = await this.login(host);
        // 해당 부분은 accessToken이 일치하지 않을때이다.
        return this.getReservations(
          updatedHost,
          page,
          reservationMaxNumOfDb,
          [],
        );
        // 새로운 accessToken을 가져와 host 객체를 업데이트합니다.

        // 같은 함수를 재호출합니다.
      }
      throw error; // 다른 오류를 다시 던집니다.
    }
  }
}
