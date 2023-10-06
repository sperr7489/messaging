import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Place, Host } from '@prisma/client';
import { HostDto } from 'src/host-queue/dtos/host.dto';
import { MessageDto } from 'src/message/dtos/message.dto';
import { ReservationInfo } from 'src/reservation/dtos/reservation-info.dto';
import { ReservationService } from 'src/reservation/reservation.service';
import axios from 'axios';
import { PrismaService } from 'src/prisma/prisma.service';
import { GET_RESERVATIONS, SING_IN } from 'src/constants/api.requset';
import { async } from 'rxjs';
import { HostStatus } from 'src/constants/host-status.constant';
import { SpaceDto } from './dtos/space.dto';
import { ProductDto } from './dtos/product.dto';

@Injectable()
export class CrawlerService {
  constructor(
    private readonly configService: ConfigService,
    private readonly reservationService: ReservationService,
    private readonly prismaService: PrismaService,
  ) {}
  async crawlingReservationInfosByQueue(
    places: Place[],
    reservationMaxNumOfDb: number,
    host: HostDto,
  ): Promise<MessageDto[]> {
    try {
      const reservations = await this.getReservations(
        host,
        1,
        reservationMaxNumOfDb,
        [],
      );

      // 가져온 데이터로 파싱 시작.
      /**
       * 필요한 정보
       * 1. 예약자 이름
       * 2. 핸드폰 번호
       * 3. 예약 태그 현황 PAY_STAT_CD가 "REFND"이면 취소환불이다. RSV_STAT_CD가 USEDC면 사용완료, RSCMP면 예약확정
       * 4. 날짜
       * 5. 장소 이름
       * 6. 예약 번호 => Id가 된다.
       * 7. 가격 정보
       */

      const result: MessageDto[] = await Promise.all(
        reservations.map(async (reservation) => {
          let tagReservation;
          if (reservation.PAY_STAT_CD == 'REFND') {
            tagReservation = '취소환불';
          } else if (reservation.RSV_STAT_CD == 'USEDC') {
            tagReservation = '이용완료';
          } else {
            tagReservation = '예약확정';
          }

          const telReservation = reservation.user_info.contact ?? '0'; // 전화번호

          const reservationNumber = reservation.id; // 예약번호
          const placeReservation = // 장소 이름
            (
              reservation.space.space_name + reservation.space.product_name
            ).replace(/\s|,/g, '');
          if (tagReservation == '취소환불' && reservationNumber) {
            await this.reservationService.cancelReservation(reservationNumber);
            return undefined;
          }

          if (tagReservation == '예약확정') {
            const dateReservation = // 이용 시간
              reservation.start_ymd +
              ' ' +
              reservation.start_hour +
              '시 ~ ' +
              reservation.end_ymd +
              ' ' +
              reservation.end_hour +
              '시';

            const price = reservation.total_price;
            const nameReservation = reservation.user_info.name;

            if (reservationNumber > reservationMaxNumOfDb) {
              const reservation = new ReservationInfo(
                nameReservation,
                telReservation,
                tagReservation,
                dateReservation,
                placeReservation,
                reservationNumber,
                price,
              );
              let place = places.find(
                (place) => place.description == placeReservation,
              );

              // 디비에 없는 장소면 추가 저장
              if (!place) {
                place = await this.reservationService.createPlace(
                  placeReservation,
                  host,
                );
              }

              // 예약 정보 수정
              await this.reservationService.postReservation(
                reservation,
                place.id,
              );

              return {
                phoneNumber: telReservation,
                message: place.message,
                description: place.description,
                reservationNum: reservationNumber,
              };
            }
          }
        }),
      );

      return result.filter((v) => v !== undefined);
    } catch (error) {
      console.error(error);
    }
  }

  async startCrawlingByQueue(
    places: Place[],
    reservationMaxNumOfDb: number,
    host: HostDto,
  ) {
    return await this.crawlingReservationInfosByQueue(
      places,
      reservationMaxNumOfDb,
      host,
    );
  }

  async login(host: HostDto): Promise<HostDto> {
    try {
      return await SING_IN(host, this.prismaService);
    } catch (error) {
      console.error('not authenticated');
    }
  }

  async getReservations(
    host: HostDto,
    page: number,
    reservationMaxNumOfDb: number,
    result: any[],
  ): Promise<any[]> {
    try {
      const {
        data: { reservations },
      } = await GET_RESERVATIONS(page, host);

      const minReservation = reservations.reduce((prev, curr) => {
        return prev.id < curr.id ? prev : curr;
      });
      result.push(...reservations);
      if (minReservation.id > reservationMaxNumOfDb) {
        // 예약 정보중에 가장 예약번호가 작은 것보다 reservationMaxNumOfDb가 작다면 다음 페이지도 조회해바야한다.
        await this.getReservations(host, ++page, reservationMaxNumOfDb, result);
      }
      return result;
      // console.log('이곳이다!', JSON.stringify(minReservation, null, 2));
    } catch (error: any) {
      //로그인이 실패한 경우
      if (error.response && error.response.status === 401) {
        const updatedHost: HostDto = await this.login(host);
        // 해당 부분은 accessToken이 일치하지 않을때이다.
        return this.getReservations(
          updatedHost,
          page,
          reservationMaxNumOfDb,
          [],
        );
      }
      throw error;
    }
  }

  // 모든 호스트들에 대한 Space 정보 가져오기
  async getAllSpaces() {
    try {
      const hosts: HostDto[] = await this.prismaService.host.findMany({
        where: {
          status: HostStatus.USE,
        },
      });
      const res = await Promise.all(
        hosts.map(async (host) => {
          const spaces = await this.getSpacesByHostId(host);
          return { host, spaces };
        }),
      );
      return res;
    } catch (error) {
      console.error(`There is ${error}`);
    }
  }

  // 특정 호스트에 대한 Space 정보 가져오기
  async getSpacesByHostId(host: HostDto) {
    try {
      const API_URL = 'https://new-api.spacecloud.kr/partner/spaces?all=true';

      const {
        data: { spaces },
      } = await axios.get(API_URL, {
        headers: {
          Authorization: host.accessToken,
        },
      });
      return spaces;
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        const updatedHost: HostDto = await this.login(host);
        // 해당 부분은 accessToken이 일치하지 않을때이다.
        return this.getSpacesByHostId(updatedHost);
      }
      console.error(error);
      return error;
    }
  }

  // 특정 Space에 Product 정보 가져오기
  async getProductsBySpaceId(host: HostDto, spaceId: number) {
    try {
      const API_URL = `https://new-api.spacecloud.kr/partner/spaces/${spaceId}/manage_products`;
      const {
        data: { products },
      } = await axios.get(API_URL, {
        headers: {
          Authorization: host.accessToken,
        },
      });

      return { spaceId, products };
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  // 특정 host의 space들이 갖고 있는 products들 가져오기

  async getProductsByHostId(host: HostDto) {
    try {
      const spaces = await this.getSpacesByHostId(host);
      const products = await Promise.all(
        spaces.map(async (space: any) => {
          return await this.getProductsBySpaceId(host, space.id);
        }),
      );
      return products;
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // 특정 호스트의 space들 입력하기
  async postSpaceOfHost(spaces: SpaceDto[]) {
    return await this.prismaService.space.createMany({
      data: spaces,
      skipDuplicates: true,
    });
  }

  // 특정 호스트의 space들의 products 입력하기
  async postProductsOfSpace(products: ProductDto[]) {
    return await this.prismaService.product.createMany({
      data: products,
      skipDuplicates: true,
    });
  }
}
