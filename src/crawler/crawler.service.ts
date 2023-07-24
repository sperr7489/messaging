import { Injectable } from '@nestjs/common';
import puppeteer, { Browser, ElementHandle, Page } from 'puppeteer';
import { User } from 'src/user/dtos/user.dto';

@Injectable()
export class CrawlerService {
  async crawlingUserInfos(): Promise<void> {
    let browser: Browser | undefined;
    try {
      const url: string = 'https://partner.spacecloud.kr/auth/login';
      browser = await puppeteer.launch({ headless: false });
      const page: Page = await browser.newPage();

      await page.goto(url);
      const userEmail = 'eunja6746@gmail.com';
      const passWord = 'park1610784!';

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
        console.error(
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
        console.error('Span with classes sp_icon and ico_menu not found');
      }

      // 사이드바가 렌더링 할 때까지 정리
      await page.waitForSelector('div.menu_top', { timeout: 15000 });

      const liElement = await page.$('.menu_top li:first-child');
      if (liElement) {
        await liElement.click();
      } else {
        console.error(
          'First "li" inside element with class "menu_top" not found',
        );
      }

      await page.waitForNavigation();

      await page.waitForSelector(
        'div.reservation_list div.list_box_wrap article',
        { timeout: 10000 },
      ); // 10초 동안 최대 대기

      // "sub_detail" 클래스를 갖는 모든 dd 태그를 가져옴
      const details = await page.$$('article.list_box');

      await Promise.all(
        details.map(async (detail) => {
          const tagReservation = await this.getInfoAboutReservation(
            detail,
            'tag',
          ); // 예약 확정 여부
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
          const reservationNum = await this.getInfoAboutReservation(
            detail,
            'reservation_num',
          ); // 예약자 전화번호
          const user = new User(
            nameReservation,
            telReservation,
            tagReservation,
            dateReservation,
            placeReservation,
            reservationNum,
          );

          user.displayInfo();
        }),
      );
    } catch (error) {
      console.error('Error logging in:', error);
      // 에러가 발생하면 다시 호출하도록 한다.
      this.crawlingUserInfos();
    }
  }

  async getInfoAboutReservation(
    node: ElementHandle<HTMLElement>,
    qeurySelector: string,
  ) {
    try {
      return await (
        await node.$(`.${qeurySelector}`)
      ).evaluate((v) => v.textContent);
    } catch (error) {
      console.log(` no data in ${qeurySelector}`);
    }
  }
}
