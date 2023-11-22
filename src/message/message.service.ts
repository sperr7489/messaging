import { Injectable } from '@nestjs/common';
import { Place } from '@prisma/client';
import { PlaceStatus } from 'src/constants/host-status.constant';
import { PrismaService } from 'src/prisma/prisma.service';
import { SpaceDto } from '../crawler/dtos/space.dto';

@Injectable()
export class MessageService {
  constructor(private readonly prismaService: PrismaService) {}

  // 어디에 메시지에 보낼 지 판단해야할 필요가 있다.
  // 예약번호의 최댓값을 저장한다.
  async createMaxReservationNum(reservationNum: number, hostId: number) {
    return await this.prismaService.messageBase.create({
      data: { maxReservationNum: reservationNum, hostId: hostId },
    });
  }
  // messageBase 테이블에서 최대 예약번호 가져오기
  async getMaxReservationNum() {
    const reservationMaxNum = await this.prismaService.messageBase.aggregate({
      _max: {
        maxReservationNum: true,
      },
    });
    return reservationMaxNum._max.maxReservationNum;
  }

  async getMaxReservationNumByQueue(hostId: number) {
    const reservationMaxNum = await this.prismaService.messageBase.aggregate({
      _max: {
        maxReservationNum: true,
      },
      where: {
        hostId,
      },
    });
    return reservationMaxNum._max.maxReservationNum;
  }

  // 모든 장소 정보를 가져오기
  async getPlaces(): Promise<Place[]> {
    // [역도보3분]신촌 연습실 제이엔터, C홀 이 있으면 이는 [역도보3분]신촌연습실제이엔터C홀 로 변경된다.
    const places = await this.prismaService.place.findMany();

    return places.map((place) => ({
      ...place,
      description: place.description.replace(/\s|,/g, ''),
    }));
  }
  async getPlacesByQueue(hostId: number): Promise<Place[]> {
    // [역도보3분]신촌 연습실 제이엔터, C홀 이 있으면 이는 [역도보3분]신촌연습실제이엔터C홀 로 변경된다.
    const places = await this.prismaService.place.findMany({
      where: { hostId: hostId, status: PlaceStatus.USE },
    });

    return places.map((place) => ({
      ...place,
      description: place.description.replace(/\s|,/g, ''),
    }));
  }

  // 특정 호스트의 모든 장소 정보를 가져오기
  async getSpacesByHostId(hostId: number): Promise<SpaceDto[]> {
    // [역도보3분]신촌 연습실 제이엔터, C홀 이 있으면 이는 [역도보3분]신촌연습실제이엔터C홀 로 변경된다.
    const spaces: SpaceDto[] = await this.prismaService.space.findMany({
      where: {
        hostId: hostId,
      },
    });

    return spaces;
  }
}
