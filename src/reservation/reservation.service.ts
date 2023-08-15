import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { async } from 'rxjs';
import { HostDto } from 'src/host-queue/dtos/host.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';
import {
  ALEADY_CANCELED,
  NOT_YET_CANCELED,
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

  async postReservation(reservationInfo: ReservationInfo, placeId: number) {
    const user = await this.prismaService.user.upsert({
      where: { phoneNumber: reservationInfo.phoneNumber },
      update: {},
      create: {
        userName: reservationInfo.userName,
        phoneNumber: reservationInfo.phoneNumber,
      },
    });

    let userId = user.id;
    const count = await this.prismaService.reservation.count({
      where: {
        userId,
        OR: [{ tagReservation: '예약확정' }, { tagReservation: '이용완료' }],
      },
    });
    // // 예약된 장소의 정보에 대한 upsert 과정.
    // const placeString = reservationInfo.placeDescription.replace(/,| /g, '');

    // let place = await this.prismaService.place.findUnique({
    //   where: { description: placeString },
    // });
    // if (!place) {
    //   place = await this.prismaService.place.create({
    //     data: {
    //       description: placeString,
    //       message: `장소에 대한 안내 문자가 아닌 경우 ${this.configService.get<string>(
    //         'ALIGO_SENDER',
    //       )}로 연락 주세요`,
    //     },
    //   });
    // }

    if (user.usedCount !== count) {
      await this.prismaService.user.update({
        where: { id: user.id },
        data: { usedCount: count },
      });
    }

    await this.prismaService.reservation.upsert({
      where: { reservationNum: Number(reservationInfo.reservationNum) },
      update: {
        placeId,
        tagReservation: reservationInfo.tagReservation,
        dateReservation: reservationInfo.dateReservation,
      },
      create: {
        userId: userId,
        placeId,
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
    // console.log(
    //   'reservationNumber  : ',
    //   reservationNumber,
    //   JSON.stringify('reservation : ' + JSON.stringify(reservation)),
    // );

    if (reservation?.tagReservation == '취소환불') {
      return ALEADY_CANCELED;
    }

    await this.prismaService.reservation.upsert({
      where: {
        reservationNum: reservationNumber,
      },
      update: {
        tagReservation: '취소환불',
      },
      create: {
        reservationNum: reservationNumber,
        tagReservation: '취소환불',
      },
    });
    return;
  }
}
