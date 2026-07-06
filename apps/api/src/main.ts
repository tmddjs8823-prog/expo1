/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // CORS 설정 (admin에서 직접 auth 요청 시 쿠키 전달 허용)
  app.enableCors({
    origin: ['http://localhost:4200', 'http://localhost:4300'],
    credentials: true,
  });

  // 쿠키 파싱 미들웨어
  app.use(cookieParser());

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
    .setDescription(
      '박람회 관리 시스템 API 문서\n\n' +
      '## 인증\n' +
      '- Bearer Token (JWT)을 사용합니다.\n' +
      '- 로그인 후 받은 `accessToken`을 `Authorize` 버튼에 입력하세요.\n' +
      '- Refresh Token은 httpOnly 쿠키로 자동 관리됩니다.\n\n' +
      '## 권한\n' +
      '- 🔓 공개 API: 인증 없이 접근 가능\n' +
      '- 🔐 사용자 API: 로그인 필요\n' +
      '- 🛡️ 관리자 API: ADMIN 권한 필요'
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: '로그인 후 받은 accessToken을 입력하세요',
        in: 'header',
      },
    )
    .addGlobalParameters({
      name: 'X-App-Type',
      in: 'header',
      required: false,
      description: '앱 타입 (admin 또는 shop). 인증 관련 API에서 쿠키 이름 결정에 사용.',
      schema: { type: 'string', enum: ['admin', 'shop'], default: 'shop' },
    })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'method',
      docExpansion: 'list',
    },
  });

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

// Trigger rebuild: removed GalleryDto @Exclude pattern
