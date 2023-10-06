import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Place } from '@prisma/client';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { CrawlerService } from 'src/crawler/crawler.service';
import { HostDto } from 'src/host-queue/dtos/host.dto';
import { MessageDto } from 'src/message/dtos/message.dto';
import { MessageService } from 'src/message/message.service';
import { SpaceDto } from '../crawler/dtos/space.dto';
import { CrawlDto } from '../message/dtos/crawl.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from '../crawler/dtos/user.dto';
import {
  OK_RESERVATION,
  UPDATE_CANCELED,
} from '../reservation/constants/reservation.constant';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly aligoService: AligoService,
    private readonly messageService: MessageService,
    private readonly configService: ConfigService,
    private readonly prismaService: PrismaService,
  ) {}

  async runScheduledTaskQueue(host: HostDto) {
    const NODE_ENV = this.configService.get<string>('NODE_ENV');
    // 여기에 주기적으로 실행할 로직을 작성합니다.
    // 예: 다른 API를 요청하는 코드
    try {
      const spaces: SpaceDto[] = await this.messageService.getSpacesByHostId(
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
      let crawlInfos: CrawlDto[] =
        (await this.crawlerService.startCrawlingByQueue(
          spaces,
          reservationMaxNumOfDb,
          host,
        )) || [];
      // console.log('이곳이다!', JSON.stringify(crawlInfos, null, 2));

      if (crawlInfos.length > 0) {
        // user들의 정보
        const users: UserDto[] = crawlInfos.reduce(
          (acc: UserDto[], curr: CrawlDto) => {
            const found: UserDto = acc.find((u) => u.id === curr.user.id);
            if (found) {
              found.usedCount += curr.reservationTag;
            } else {
              acc.push({ ...curr.user, usedCount: curr.reservationTag });
            }
            return acc;
          },
          [],
        );
        await this.crawlerService.upsertUsersInfo(users);

        await Promise.all(
          crawlInfos.map(async (crawlInfo) => {
            if (crawlInfo.reservationTag === OK_RESERVATION) {
              // 취소환불된 것에는 보내지 않게 하기 위함.
              console.log(
                `${JSON.stringify(host)}, ${new Date()} : , ${
                  crawlInfo.reservationNum
                }, ${crawlInfo.user.phoneNumber}`,
              );

              // await this.aligoService.sendSMS(
              //   '01024087489',
              //   `${crawlInfo.message}`,
              //   host,
              // );

              if (NODE_ENV == 'production') {
                // 배포단계
                await this.aligoService.sendSMS(
                  crawlInfo.user.phoneNumber,
                  `${crawlInfo.space.message}`,
                  host,
                );
              } else {
                // 개발 단계
                // 김기창에 대해서만 메시지 보낼 수 있도록 하는 것.
                if (crawlInfo.user.phoneNumber == '01024087489') {
                  await this.aligoService.sendSMS(
                    crawlInfo.user.phoneNumber,
                    `${crawlInfo.space.message}`,
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
          ...crawlInfos.map((v) => {
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
