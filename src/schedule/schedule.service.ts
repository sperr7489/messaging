import { Injectable, OnModuleInit } from '@nestjs/common';
import { Place } from '@prisma/client';
import * as cron from 'node-cron';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { MessageDto } from 'src/message/dtos/message.dto';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class ScheduleService implements OnModuleInit {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly aligoService: AligoService,
    private readonly messageService: MessageService,
  ) {}
  onModuleInit() {
    this.runScheduledTask();
    this.scheduleJobs();
  }
  scheduleJobs() {
    cron.schedule('*/15 * * * *', () => {
      this.runScheduledTask();
    });
  }
  async runScheduledTask() {
    // 여기에 주기적으로 실행할 로직을 작성합니다.
    // 예: 다른 API를 요청하는 코드
    try {
      const places: Place[] = await this.messageService.getPlaces();

      // 기존 예약 정보중 가장 높은 예약 번호
      let reservationMaxNumOfDb: number =
        (await this.messageService.getMaxReservationNum()) ?? 0;
      console.log('reservationMaxNumOfDb : ' + reservationMaxNumOfDb);

      // 처음 실행했을 때 스페이스클라우드의 데이터를 긁어온다.
      let messageInfos: MessageDto[] =
        (await this.crawlerService.startCrawling(
          places,
          reservationMaxNumOfDb,
        )) || [];

      console.log(`${new Date()} : , ${messageInfos}}`);
      if (messageInfos.length > 0) {
        // 메시지 보낼 사람이 추가적으로 존재한다면 다음과 같은 절차 진행
        /**
         * 1.해당 유저들에게 메시지를 보낸다.
         * 2.최신화된 reservation의 테이블의 reserVationNum의 최댓값으로
         * messageBase의 테이블을 업데이트한다.
         */
        // 1번 메시지 보내는 로직

        await Promise.all(
          messageInfos.map(async (messageInfo) => {
            console.log(
              'messageInfo.reservationNum : ' + messageInfo.reservationNum,
              'messageInfo.phoneNumber : ' + messageInfo.phoneNumber,
            );
            await this.aligoService.sendSMS('01024087489', messageInfo.message);
          }),
        );
        //2번
        const reservationMaxNumOfCrawl = Math.max(
          ...messageInfos.map((v) => {
            return v.reservationNum;
          }),
        );

        await this.messageService.createMaxReservationNum(
          reservationMaxNumOfCrawl,
        );
      }
    } catch (error) {
      console.log(error);
    }
  }
}
