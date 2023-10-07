import { User } from '@prisma/client';

export class UserDto {
  id: string;
  userName: string;
  phoneNumber: string;
  usedCount?: number;
  constructor(option: {
    userName: string;
    phoneNumber: string;
    usedCount?: number;
  }) {
    this.userName = option.userName;
    this.phoneNumber = option.phoneNumber;
  }
}
