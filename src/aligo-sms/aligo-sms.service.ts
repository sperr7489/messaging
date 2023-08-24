import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { HostDto } from 'src/host-queue/dtos/host.dto';

@Injectable()
export class AligoService {
  constructor(private readonly configService: ConfigService) {}

  async sendSMS(phoneNumber: string, message: string, host: HostDto) {
    const apiUrl = 'https://apis.aligo.in/send/';
    const params = new URLSearchParams({
      key: host.aligoKey,
      user_id: host.aligoId,
      sender: host.aligoSender, // 발신자 이름
      receiver: phoneNumber,
      msg: message,
    });

    try {
      const response = await axios.post(apiUrl, params);
      // SMS 발송 성공에 대한 처리
      console.log(
        'response.status : ' + response.status,
        ' response.data : ' + JSON.stringify(response.data),
      );

      return response.data;
    } catch (error) {
      // SMS 발송 실패에 대한 처리
      throw new Error('Failed to send SMS.');
    }
  }

  async testSendSMS() {
    const apiUrl = 'https://apis.aligo.in/send/';
    const params = new URLSearchParams({
      key: 'jiz2mrufqpggjmlkktvgmle6jxhcorcm',
      user_id: 'baroandco',
      sender: '01095291129', // 발신자 이름
      receiver: '01024087489',
      msg: ' this is test mode',
      testmode_yn: 'Y',
    });

    try {
      console.log('test');

      const response = await axios.post(apiUrl, params);
      // SMS 발송 성공에 대한 처리
      console.log(
        'response.status : ' + response.status,
        ' response.data : ' + JSON.stringify(response.data),
      );

      return response;
    } catch (error) {
      // SMS 발송 실패에 대한 처리
      throw new Error('Failed to send SMS.');
    }
  }
}
