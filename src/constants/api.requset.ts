import axios from 'axios';

import { HostDto } from '../host-queue/dtos/host.dto';
import { PrismaService } from '../prisma/prisma.service';
// 예약 정보 가져오는 API 엔드포인트

// const apiEndPoint = {
//   // 예약 정보 가져오기
//   GET_RESERVATIOM: 'https://new-api.spacecloud.kr/partner/reservations',

//   // 로그인 하기
//   SING_IN: 'https://new-api.spacecloud.kr/partner/users/sign_in',

//   // space의 proudct정보 가져오기

// };

// 예약 정보 가져오는 API 엔드포인트
export const GET_RESERVATIONS = async (page: number, host: HostDto) => {
  return await axios.get(
    `https://new-api.spacecloud.kr/partner/reservations?page=${page}`,
    {
      headers: {
        Authorization: host.accessToken,
      },
    },
  );
};
export const SING_IN = async (host: HostDto, prismaService: PrismaService) => {
  const SPACE_EMAIL = host.spaceCloudEmail;
  const SPACE_PASSWORD = host.spaceCloudPw;
  let accessToken: string;
  try {
    return await axios
      .post('https://new-api.spacecloud.kr/partner/users/sign_in', {
        email: SPACE_EMAIL,
        password: SPACE_PASSWORD,
      })
      .then(async (v) => {
        accessToken = v.data.user.token;
        return await prismaService.host.update({
          data: {
            accessToken,
          },
          where: { id: host.id },
        });
      });
  } catch (error) {
    console.log('not authenticated');
  }
};
