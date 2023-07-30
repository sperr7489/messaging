import { Module } from '@nestjs/common';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { MessageService } from './message.service';

@Module({
  providers: [MessageService, AligoService],
  exports: [MessageService],
})
export class MessageModule {}
