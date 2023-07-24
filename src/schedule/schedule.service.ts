import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as cron from 'node-cron';

@Injectable()
export class ScheduleService {
  constructor(private configService: ConfigService) {
    this.scheduleJobs();
  }

  scheduleJobs() {
    this.runScheduledTask();
    cron.schedule('*/5 * * * *', () => {
      this.runScheduledTask();
    });
  }

  async runScheduledTask() {
    // 여기에 주기적으로 실행할 로직을 작성합니다.

    // 예: 다른 API를 요청하는 코드
    const url = this.configService.get<string>('URL');
    console.log(url);

    // 처음 실행했을 때 스페이스클라우드의 데이터를 긁어온다.
    await axios.get(`${url}/api/crawler`);
  }
}
