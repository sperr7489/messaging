import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { SpaceDto } from './dtos/space.dto';
import { PrismaService } from '../prisma/prisma.service';
import { HostStatus } from 'src/constants/host-status.constant';
import { ProductDto } from './dtos/product.dto';
import { HostDto } from '../host-queue/dtos/host.dto';

@Controller()
export class CrawlerController {
  constructor(
    private readonly crawlerService: CrawlerService,
    private readonly prismaService: PrismaService,
  ) {}
  // @Get()
  // async crawlingReservationInfos() {
  //   return await this.crawlerService.crawlingReservationInfos();
  // }

  // 모든 호스트들에 대한 Space 정보 가져오기
  @Get('hosts/spaces')
  async getAllSpaces() {
    // return 'test';
    return await this.crawlerService.getAllSpaces();
  }

  // 특정 호스트에 대한 Space 정보 가져오기
  @Get('host/:id/spaces')
  async getSpacesByHostId(@Param('id', new ParseIntPipe()) id: number) {
    try {
      const host = await this.prismaService.host.findFirstOrThrow({
        where: {
          id: id,
          status: HostStatus.USE,
        },
      });
      // return 'test';
      return await this.crawlerService.getSpacesByHostId(host);
    } catch (error) {
      console.error(error);
      return error;
    }
  }
  // 특정 host의 space들이 갖고 있는 products들 가져오기
  @Get('host/:id/products')
  async getProductsByHostId(@Param('id', new ParseIntPipe()) id: number) {
    try {
      const host = await this.prismaService.host.findFirstOrThrow({
        where: {
          id: id,
          status: HostStatus.USE,
        },
      });
      return await this.crawlerService.getProductsByHostId(host);
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // 특정 host가 갖고 있는 특정 Space에 Product 정보 가져오기
  @Get('host/:hostId/spaces/:spaceId/products')
  async getProductsBySpaceId(
    @Param('hostId', new ParseIntPipe()) hostId: number,
    @Param('spaceId', new ParseIntPipe()) spaceId: number,
  ) {
    try {
      const host = await this.prismaService.host.findFirstOrThrow({
        where: {
          id: hostId,
          status: HostStatus.USE,
        },
      });
      return await this.crawlerService.getProductsBySpaceId(host, spaceId);
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // 특정 호스트의 space들 입력하기
  @Post('host/:id/spaces')
  async postSpaceOfHost(@Param('id', new ParseIntPipe()) id: number) {
    try {
      const host = await this.prismaService.host.findFirstOrThrow({
        where: {
          id,
          status: HostStatus.USE,
        },
      });
      const spaces = await this.getSpacesByHostId(id);

      const spaceDtos: SpaceDto[] = spaces.map((space: any) => {
        return {
          id: space.id,
          name: space.name,
          imageUrl: space.image_url,
          isPublic: space.EXPS_YN,
          message: `${space.name}을 찾아주셔서 감사합니다. 안내 문자가 아닌 경우 ${host.aligoSender}로 연락주세요`,
          registedAt: space.REG_YMDT,
          hostId: id,
        };
      });
      // return spaceDtos;
      return await this.crawlerService.postSpaceOfHost(spaceDtos);
    } catch (error) {
      console.error(error);
      return error;
    }
  }

  // 특정 호스트의 space들의 products 입력하기
  @Post('host/:id/products')
  async postProductsOfSpace(@Param('id', new ParseIntPipe()) id: number) {
    const products: any = await this.getProductsByHostId(id);
    const productDtos: ProductDto[] = products
      .map((space: any) => {
        return space.products.map((product: any) => ({
          id: product.id,
          name: product.name,
          isPublic: product.exposed,
          registedAt: product.registration_date,
          spaceId: space.spaceId,
        }));
      })
      .flat();

    return await this.crawlerService.postProductsOfSpace(productDtos);
  }

  // 모든 host들에 대한 space와 product 입력하기
  @Post('hosts/spaces-products')
  async postAllSpacesAndProducts() {
    const hosts: HostDto[] = await this.prismaService.host.findMany({
      where: {
        status: HostStatus.USE,
      },
    });
    return await Promise.all(
      hosts.map(async (host: HostDto) => {
        // space 정보 입력하기
        await this.postSpaceOfHost(host.id);
        await this.postProductsOfSpace(host.id);
      }),
    );
  }

  // 특정 space에 대한 정보 입력하기 ( 크롤링 시에 처음 발견한 space의 경우 )
  @Post('/space/:id')
  async postSpaceById(
    @Param('id', new ParseIntPipe()) id: number,
    @Body('host') host: HostDto,
  ): Promise<SpaceDto> {
    // 스페이스 정보 입력하기,

    return await this.crawlerService.postSpaceById(id, host);
  }
}
