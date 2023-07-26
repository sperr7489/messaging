import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cron from 'node-cron';
import { CrawlerService } from 'src/crawler/crawler.service';
import { MessageService } from 'src/message/message.service';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly configService: ConfigService,
    private readonly crawlerService: CrawlerService,
    private readonly messageService: MessageService,
  ) {}

  async runScheduledTask() {
    // 여기에 주기적으로 실행할 로직을 작성합니다.
    // 예: 다른 API를 요청하는 코드
    const url = this.configService.get<string>('URL');
    console.log(url);

    // 처음 실행했을 때 스페이스클라우드의 데이터를 긁어온다.
    const toMessageUsers: ReservationInfo[] =
      await this.crawlerService.crawlingReservationInfos();
    console.log(toMessageUsers);
    if (toMessageUsers.length > 0) {
      // 메시지 보낼 사람이 추가적으로 존재한다면 다음과 같은 절차 진행
      /**
       * 1.해당 유저들에게 메시지를 보낸다.
       * 2.최신화된 reservation의 테이블의 reserVationNum의 최댓값으로
       * messageBase의 테이블을 업데이트한다.
       */
      //1번 메시지 보내는 로직

      //2번
      let max = 0;
      toMessageUsers.map((user: ReservationInfo) => {
        if (max < user.reservationNum) {
          max = user.reservationNum;
        }
      });
      await this.messageService.createMaxReservationNum(max);
    }
  }
}
