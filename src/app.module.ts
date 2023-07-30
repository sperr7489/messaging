import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { ReservationService } from './reservation/reservation.service';
import { PrismaModule } from './prisma/prisma.module';
import { MessageService } from './message/message.service';
import { AligoService } from './aligo-sms/aligo-sms.service';
import { ScheduleModule } from './schedule/schedule.module';
import { MessageController } from './message/message.controller';
import { MessageModule } from './message/message.module';

@Module({
  controllers: [AppController, MessageController],
  providers: [AppService, ReservationService, AligoService],
  imports: [
    CrawlerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScheduleModule,
    MessageModule,
  ],
})
export class AppModule {}
