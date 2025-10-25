import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: ['http://localhost:3000'], // Frontend URL
    credentials: true,
  });

  // API prefix
  const apiPrefix = configService.get('API_PREFIX') || 'api';
  app.setGlobalPrefix(apiPrefix);

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Producer Manager API')
    .setDescription('Brain Agriculture - Producer Management System API')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  const swaggerPath = configService.get('SWAGGER_PATH') || 'api/docs';
  SwaggerModule.setup(swaggerPath, app, document);

  const port = configService.get('PORT') || 3001;
  await app.listen(port);

  console.log(`🚀 Producer Manager API is running on: http://localhost:${port}/${apiPrefix}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`);
}

bootstrap();
