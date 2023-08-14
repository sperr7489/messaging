import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { MessageService } from 'src/message/message.service';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [CrawlerModule],
  providers: [ScheduleService, MessageService, AligoService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleTaskModule {}
