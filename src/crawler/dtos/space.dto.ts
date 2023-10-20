import { Space } from '@prisma/client';

export class SpaceDto {
  id: number;
  name: string;
  imageUrl?: string;
  isPublic?: string;
  message?: string | null;
  hostId: number;
  isMessage?: string | null;

  registedAt?: Date;
  createdAt?: Date;
  constructor(option: {
    id: number;
    name: string;
    imageUrl: string;
    isPublic: string;
    message: string | null;
    hostId: number;
    registedAt: Date;
    createdAt: Date;
  }) {
    this.id = option.id;
    this.name = option.name;
    this.imageUrl = option.imageUrl;
    this.isPublic = option.isPublic;
    this.message = option.message ?? null;
    this.hostId = option.hostId;
    this.registedAt = option.registedAt;
    this.createdAt = option.createdAt;
  }
}
