import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { ScheduleService } from './schedule.service';
import { MessageService } from 'src/message/message.service';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { AligoSmsModule } from 'src/aligo-sms/aligo-sms.module';

@Module({
  imports: [CrawlerModule, AligoSmsModule],
  providers: [ScheduleService, MessageService],
  exports: [ScheduleService],
})
export class ScheduleTaskModule {}
