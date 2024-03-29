import { Module } from '@nestjs/common';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { AligoController } from './aligo-sms.controller';

@Module({
  controllers: [AligoController],
  providers: [PrismaService, AligoService],
  exports: [AligoService],
})
export class AligoSmsModule {}
