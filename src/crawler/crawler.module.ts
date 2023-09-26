import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { AligoService } from 'src/aligo-sms/aligo-sms.service';
import { MessageService } from 'src/message/message.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationService } from 'src/reservation/reservation.service';
import { CrawlerController } from './crawler.controller';
import { CrawlerService } from './crawler.service';

@Module({
  imports: [HttpModule],
  controllers: [CrawlerController],
  providers: [
    CrawlerService,
    ReservationService,
    PrismaService,
    MessageService,
  ],
  exports: [CrawlerService],
})
export class CrawlerModule {}
