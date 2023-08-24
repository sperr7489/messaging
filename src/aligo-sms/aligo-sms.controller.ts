import { Controller, Post } from '@nestjs/common';
import { AligoService } from './aligo-sms.service';

@Controller()
export class AligoController {
  constructor(private readonly aligoService: AligoService) {}

  @Post('test-sms')
  async testSms() {
    return this.aligoService.testSendSMS();
  }
}
