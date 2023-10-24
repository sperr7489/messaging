import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { ReservationService } from './reservation/reservation.service';
import { PrismaModule } from './prisma/prisma.module';
import { AligoService } from './aligo-sms/aligo-sms.service';
import { ScheduleTaskModule } from './schedule/schedule.module';
import { MessageController } from './message/message.controller';
import { MessageModule } from './message/message.module';
import { BullModule } from '@nestjs/bull';
import { HostQueueService } from './host-queue/host-queue.service';
import { HostQueueConsumer } from './host-queue/host-queue.consumer';
import { ScheduleModule } from '@nestjs/schedule';
import { AligoSmsModule } from './aligo-sms/aligo-sms.module';

@Module({
  controllers: [AppController, MessageController],
  providers: [
    AppService,
    ReservationService,
    HostQueueService,
    HostQueueConsumer,
  ],
  imports: [
    CrawlerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScheduleTaskModule,
    MessageModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        redis: {
          host: configService.get('REDIS_HOST'),
          port: configService.get('REDIS_PORT'),
        },
      }),
      inject: [ConfigService],
    }),
    BullModule.registerQueue({
      name: 'host-queue',
      defaultJobOptions: {
        timeout: 30 * 1000, //60*1000 이 60초로 1분이다.
        removeOnFail: true,
        removeOnComplete: true,
      },
    }),
    ScheduleModule.forRoot(),
    AligoSmsModule,
  ],
})
export class AppModule {}
