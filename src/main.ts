// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());

  // Habilita o pipe de validação globalmente
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Remove propriedades que não estão no DTO
    forbidNonWhitelisted: true, // Lança um erro se propriedades extras forem enviadas
    transform: true, // Transforma o payload para o tipo do DTO
  }));

  app.enableCors({
    origin: 'http://localhost:3000', // URL do seu frontend
    credentials: true,
  });

  await app.listen(5000);
}
bootstrap();