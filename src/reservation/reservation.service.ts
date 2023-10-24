import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { async } from 'rxjs';
import { HostDto } from 'src/host-queue/dtos/host.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';
import { CREATE_CANCELED } from './constants/reservation.constant';
import {
  ALEADY_CANCELED,
  UPDATE_CANCELED,
} from './constants/reservation.constant';

@Injectable()
export class ReservationService {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getReservations() {
    // 추후엔 findmany에 몇개를 가져올 것인지에 대한 내용도 담도록 한다.
    return await this.prismaService.reservation.findMany();
  }

  async postReservation(reservationInfo: ReservationInfo) {
    const userId = reservationInfo.user.id;
    const spaceId = reservationInfo.spaceDto.id;

    await this.prismaService.reservation.upsert({
      where: { reservationNum: Number(reservationInfo.reservationNum) },
      update: {
        spaceId,
        tagReservation: reservationInfo.tagReservation,
        dateReservation: reservationInfo.dateReservation,
      },
      create: {
        userId,
        spaceId,
        tagReservation: reservationInfo.tagReservation,
        dateReservation: reservationInfo.dateReservation,
        reservationNum: Number(reservationInfo.reservationNum),
        price: reservationInfo.price,
      },
    });
  }

  async createPlace(description: string, host: HostDto) {
    const place = await this.prismaService.place.findFirst({
      where: {
        description,
        hostId: host.id,
      },
    });
    if (place) {
      return place;
    }

    return await this.prismaService.place.create({
      data: {
        description,
        message: `${description}에 대한 정보 안내 문자가 아닌 경우 ${host.aligoSender} 로 연락 주세요`,
        hostId: host.id,
      },
    });
  }
  async cancelReservation(reservationNumber: number) {
    const reservation = await this.prismaService.reservation.findUnique({
      where: {
        reservationNum: reservationNumber,
      },
    });

    if (reservation) {
      if (reservation.tagReservation == '취소환불') {
        // '이미' 예약 정보가 존재한다면 취소환불이 되어 있는 경우이다. User 정보를 업데이트 할 필요 없다.
        return ALEADY_CANCELED; // 이미 취소환불이 처리됨
      }
      // 예약 확정으로 되어 있는 경우고 이를 취소해주어야 한다.
      await this.prismaService.reservation.update({
        where: {
          reservationNum: reservationNumber,
        },
        data: {
          tagReservation: '취소환불',
        },
      });
      return UPDATE_CANCELED;
    }
    // 취소 환불 된 것을 처음 발견한 경우.
    await this.prismaService.reservation.create({
      data: {
        reservationNum: reservationNumber,
        tagReservation: '취소환불',
      },
    });

    return CREATE_CANCELED; // 취소환불 되었는데 아직 처리가 안됨
  }
}
