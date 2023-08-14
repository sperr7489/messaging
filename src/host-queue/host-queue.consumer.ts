import { Processor, Process } from '@nestjs/bull';
import { Job } from 'bull';
import { ScheduleService } from 'src/schedule/schedule.service';
import { HostDto } from './dtos/host.dto';
@Processor('host-queue')
export class HostQueueConsumer {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Process('process-host')
  async transcode(job: Job<HostDto>) {
    const hostInfo: HostDto = job.data;

    await this.scheduleService.runScheduledTaskQueue(hostInfo);

    return;
  }
}
