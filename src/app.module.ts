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

@Module({
  controllers: [AppController, MessageController],
  providers: [
    AppService,
    ReservationService,
    AligoService,
    HostQueueService,
    HostQueueConsumer,
  ],
  imports: [
    CrawlerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScheduleTaskModule,
    MessageModule,
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'host-queue',
    }),
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
