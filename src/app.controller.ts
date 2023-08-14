import { Controller, Delete, Get, Post } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AppService } from './app.service';
import { HostQueueService } from './host-queue/host-queue.service';
import { MessageService } from './message/message.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly messageService: MessageService,
    private readonly hostQueueService: HostQueueService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('maxReservations')
  async getMaxReservationNumber(reservationNum: number, hostId: number) {
    return await this.messageService.createMaxReservationNum(
      reservationNum,
      hostId,
    );
  }
  @Get('redis')
  async getRedis() {
    const waitingJobs = await this.hostQueueService.getWaiting();
    return waitingJobs;
  }

  @Cron(CronExpression.EVERY_10_MINUTES)
  @Post('redis')
  async PostRedis() {
    return await this.hostQueueService.addJob();
  }

  @Delete('all-queue')
  async deleteAllBullQueues() {
    return await this.hostQueueService.deleteAllBullQueues();
  }
}
