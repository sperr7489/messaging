import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
  });
  const configService = app.get(ConfigService);
  const isDevelopment = configService.get('NODE_ENV') === 'development';
  // app.setGlobalPrefix('api', {
  //   exclude: ['/'],
  // });
  // 스웨거 문서 생성을 위한 설정 객체 생성
  const config = new DocumentBuilder()
    .setTitle('My API')
    .setDescription('API 문서를 위한 NestJS 프로젝트')
    .setVersion('1.0')
    .build();
  const port = app.get<ConfigService>(ConfigService).get('PORT');

  // 스웨거 문서 생성
  if (isDevelopment) {
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  // 스웨거 UI 설정
  await app.listen(port);
}
bootstrap();
