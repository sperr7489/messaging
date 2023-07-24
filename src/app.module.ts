import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { CrawlerModule } from './crawler/crawler.module';
import { ScheduleService } from './schedule/schedule.service';
import { ScheduleModule } from './schedule/schedule.module';

@Module({
  controllers: [AppController],
  providers: [AppService, ScheduleService],
  imports: [CrawlerModule, ConfigModule.forRoot({ isGlobal: true })],
})
export class AppModule {}
