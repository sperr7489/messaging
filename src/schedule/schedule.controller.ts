import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ScheduleService } from './schedule.service';

@ApiTags('schedule')
@Controller('schedule')
export class ScheduleController {
  constructor(private scheduleService: ScheduleService) {}

  @Post()
  @ApiOperation({ summary: '크롤링부터 메시징까지' }) // 해당 API의 설명 추가
  async setAutoMessage() {
    return await this.scheduleService.runScheduledTask();
  }
}
