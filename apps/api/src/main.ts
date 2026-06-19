/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // class-validator + class-transformer 글로벌 파이프
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,             // DTO에 없는 프로퍼티 자동 제거
    forbidNonWhitelisted: true,  // DTO에 없는 프로퍼티 전송 시 400 에러
    transform: true,             // class-transformer 자동 적용 (payload → DTO 인스턴스)
    exceptionFactory: (errors) => {
      const messages = errors.map(err => {
        const constraints = err.constraints ? Object.values(err.constraints) : [];
        return constraints.map(c =>
          c.includes('should not exist') ? `허용되지 않는 필드입니다: ${err.property}` : c
        );
      }).flat();
      return new BadRequestException(messages);
    },
  }));

  // Swagger 설정
  const config = new DocumentBuilder()
    .setTitle('Expo API')
    .setDescription('박람회 관리 시스템 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`,
  );
  Logger.log(
    `📄 Swagger docs: http://localhost:${port}/api/docs`,
  );
}

bootstrap();

// Trigger server restart - Korean DTO messages
