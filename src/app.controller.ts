import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { MessageService } from './message/message.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly messageService: MessageService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('maxReservations')
  async getMaxReservationNumber() {
    return await this.messageService.createMaxReservationNum(23232);
  }
}
