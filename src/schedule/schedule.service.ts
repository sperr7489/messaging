import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Place } from '@prisma/client';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { HostDto } from 'src/host-queue/dtos/host.dto';
import { MessageDto } from 'src/message/dtos/message.dto';
import { MessageService } from 'src/message/message.service';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly aligoService: AligoService,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
  ) {}

  async runScheduledTaskQueue(host: HostDto) {
    const NODE_ENV = this.configService.get<string>('NODE_ENV');
    // 여기에 주기적으로 실행할 로직을 작성합니다.
    // 예: 다른 API를 요청하는 코드
    try {
      const places: Place[] = await this.messageService.getPlacesByQueue(
        host.id,
      );
      // 기존 예약 정보중 가장 높은 예약 번호
      let reservationMaxNumOfDb: number =
        (await this.messageService.getMaxReservationNumByQueue(host.id)) ?? 0;

      console.log(
        'spaceCloudEmail : ',
        host.spaceCloudEmail,
        ', reservationMaxNumOfDb : ' + reservationMaxNumOfDb,
      );

      // 처음 실행했을 때 스페이스클라우드의 데이터를 긁어온다.
      let messageInfos: MessageDto[] =
        (await this.crawlerService.startCrawlingByQueue(
          places,
          reservationMaxNumOfDb,
          host,
        )) || [];
      // console.log('이곳이다!', JSON.stringify(messageInfos, null, 2));

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
            if (messageInfo.message) {
              // 취소환불된 것에는 보내지 않게 하기 위함.
              console.log(
                `${JSON.stringify(host)}, ${new Date()} : , ${
                  messageInfo.reservationNum
                }, ${messageInfo.phoneNumber}`,
              );

              // await this.aligoService.sendSMS(
              //   '01024087489',
              //   `${messageInfo.message}`,
              //   host,
              // );

              if (NODE_ENV == 'production') {
                // 배포단계
                await this.aligoService.sendSMS(
                  messageInfo.phoneNumber,
                  `${messageInfo.message}`,
                  host,
                );
              } else {
                // 개발 단계
                // 김기창에 대해서만 메시지 보낼 수 있도록 하는 것.
                if (messageInfo.phoneNumber == '01024087489') {
                  await this.aligoService.sendSMS(
                    messageInfo.phoneNumber,
                    `${messageInfo.message}`,
                    host,
                  );
                }
                console.log('develop stage');
              }
            }
          }),
        );
        //2번
        const reservationMaxNumOfCrawl = Math.max(
          ...messageInfos.map((v) => {
            return v.reservationNum;
          }),
        );

        /**
         *  만약 취소환불이 가장 높은 값이라면?
         *  앞단에서 취소환불에 대해서는 reservationMaxNumOfDb와 비교하지 않기 때문에 계속해서 배열값으로 들어오게된다.
         *
         * */
        if (reservationMaxNumOfCrawl > reservationMaxNumOfDb)
          await this.messageService.createMaxReservationNum(
            reservationMaxNumOfCrawl,
            host.id,
          );
      }
    } catch (error) {
      console.error(error);
    }
  }
}
