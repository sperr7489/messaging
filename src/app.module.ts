import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { ScheduleService } from './schedule/schedule.service';
import { PrismaService } from './prisma/prisma.service';
import { ReservationService } from './reservation/reservation.service';
import { PrismaModule } from './prisma/prisma.module';
import { MessageService } from './message/message.service';
import { AligoService } from './aligo-sms/aligo-sms.service';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  controllers: [AppController],
  providers: [
    AppService,
    ScheduleService,
    PrismaService,
    ReservationService,
    MessageService,
    AligoService,
  ],
  imports: [
    CrawlerModule,
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    ScheduleModule,
  ],
})
export class AppModule {}
