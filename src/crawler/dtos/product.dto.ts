import { Product } from '@prisma/client';

export class ProductDto implements Product {
  id: number;
  name: string;
  isPublic: string;
  registedAt: Date;
  createdAt: Date;
  spaceId: number;
  constructor(option: { name: string; isPublic: string; spaceId: number }) {
    this.name = option.name;
    this.isPublic = option.isPublic;
    this.spaceId = option.spaceId;
  }
}
