import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cron from 'node-cron';
import { async } from 'rxjs';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { MessageService } from 'src/message/message.service';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';

@Injectable()
export class ScheduleService implements OnModuleInit {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly messageService: MessageService,
    private readonly aligoService: AligoService,
  ) {}
  onModuleInit() {
    this.runScheduledTask();
    this.scheduleJobs();
  }
  scheduleJobs() {
    cron.schedule('*/10 * * * *', () => {
      this.runScheduledTask();
    });
  }
  async runScheduledTask() {
    // 여기에 주기적으로 실행할 로직을 작성합니다.
    // 예: 다른 API를 요청하는 코드

    // 처음 실행했을 때 스페이스클라우드의 데이터를 긁어온다.
    let toMessageUsers: ReservationInfo[] =
      await this.crawlerService.crawlingReservationInfos();

    if (!toMessageUsers) {
      toMessageUsers = [];
    }
    console.log(`${new Date()} : , ${toMessageUsers}}`);
    if (toMessageUsers.length > 0) {
      // 메시지 보낼 사람이 추가적으로 존재한다면 다음과 같은 절차 진행
      /**
       * 1.해당 유저들에게 메시지를 보낸다.
       * 2.최신화된 reservation의 테이블의 reserVationNum의 최댓값으로
       * messageBase의 테이블을 업데이트한다.
       */
      // 1번 메시지 보내는 로직
      // 우선은 테스트
      await Promise.all(
        toMessageUsers.map(async (user) => {
          const { message } = await this.messageService.getPlaceInfoOfSms(
            user.placeDescription,
          );
          const phoneNumber = user.phoneNumber.replace(/-/g, '');

          await this.aligoService.sendSMS(phoneNumber, message);
        }),
      );

      //2번
      let max = 0;
      toMessageUsers.map(async (user: ReservationInfo) => {
        if (max < user.reservationNum) {
          max = user.reservationNum;
          await this.messageService.createMaxReservationNum(max);
        }
      });
    }
  }
}
