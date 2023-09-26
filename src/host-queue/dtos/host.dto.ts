import { Host } from '@prisma/client';

export class HostDto implements Host {
  id: number;
  spaceCloudEmail: string;
  spaceCloudPw: string;
  aligoId: string;
  aligoKey: string;
  aligoSender: string;
  status: string;
  accessToken: string;

  constructor(option: {
    id: number;
    spaceCloudEmail: string;
    spaceCloudPw: string;
    aligoId: string;
    aligoKey: string;
    aligoSender: string;
    status: string;
    accessToken: string;
  }) {
    this.id = option.id;
    this.spaceCloudEmail = option.spaceCloudEmail;
    this.spaceCloudPw = option.spaceCloudPw;
    this.aligoId = option.aligoId;
    this.aligoKey = option.aligoKey;
    this.aligoSender = option.aligoSender;
    this.status = option.status;
    this.accessToken = option.accessToken;
  }
}
