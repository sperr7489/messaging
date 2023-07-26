import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class AligoService {
  constructor(private readonly configService: ConfigService) {}

  async sendSMS(phoneNumber: string, message: string) {
    const apiUrl = 'https://apis.aligo.in/send/';
    const params = new URLSearchParams({
      key: this.configService.get<string>('ALIGO_KEY'),
      user_id: this.configService.get<string>('ALIGO_ID'), // 알리고 홈페이지에서 발급받은 사용자 아이디
      sender: this.configService.get<string>('ALIGO_SENDER'), // 발신자 이름
      receiver: phoneNumber,
      msg: message,
    });

    try {
      const response = await axios.post(apiUrl, params);
      // SMS 발송 성공에 대한 처리
      return response.data;
    } catch (error) {
      // SMS 발송 실패에 대한 처리
      throw new Error('Failed to send SMS.');
    }
  }
}
