import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';
import { PrismaService } from 'src/prisma/prisma.service';
import { HostDto } from './dtos/host.dto';
import { HostStatus } from 'src/constants/host-status.constant';

@Injectable()
export class HostQueueService {
  constructor(
    @InjectQueue('host-queue') private hostQueue: Queue,
    private readonly prismaService: PrismaService,
  ) {}

  // @Cron(CronExpression.EVERY_5_MINUTES)
  async startQueueMessage() {
    const jobOptions = {
      removeOnComplete: true,
      removeOnFail: true,
    };

    try {
      const hosts = await this.prismaService.host.findMany({
        where: {
          status: HostStatus.USE,
        },
      });

      for (const host of hosts) {
        const hostDto = new HostDto(host);
        await this.hostQueue.add('process-host', hostDto, {
          removeOnComplete: true,
          removeOnFail: true,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async getWaitingQueue() {
    const waitingJobs = await this.hostQueue.getWaiting();
    console.log('waitingJobs :  ', waitingJobs);

    return { count: waitingJobs.length, waitingJobs: waitingJobs };
  }

  async deleteAllBullQueues() {
    return await this.hostQueue.empty();
  }
}
