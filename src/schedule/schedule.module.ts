import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { MessageService } from 'src/message/message.service';

@Module({
  imports: [CrawlerModule],
  providers: [ScheduleService, MessageService],
  controllers: [ScheduleController],
  exports: [ScheduleService],
})
export class ScheduleModule {}
