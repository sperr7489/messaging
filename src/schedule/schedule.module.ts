import { Module } from '@nestjs/common';
import { CrawlerModule } from 'src/crawler/crawler.module';
import { ScheduleService } from './schedule.service';

@Module({
  providers: [ScheduleService],
  imports: [CrawlerModule],
})
export class ScheduleModule {}
