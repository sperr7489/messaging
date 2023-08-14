import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { HostDto } from './dtos/host.dto';

@Injectable()
export class HostQueueService {
  constructor(
    @InjectQueue('host-queue') private hostQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async startQueueMessage() {
    try {
      const hosts = await this.prismaService.host.findMany();

      for (const host of hosts) {
        const hostDto = new HostDto(host);
        await this.hostQueue.add('process-host', hostDto);
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getWaitingQueue() {
    const waitingJobs = await this.hostQueue.getWaiting();
    console.log('waitingJobs :  ', waitingJobs);

    return waitingJobs;
  }

  async deleteAllBullQueues() {
    return await this.hostQueue.empty();
  }
}
