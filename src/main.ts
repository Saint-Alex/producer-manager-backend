import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppLoggerService } from './shared/logging/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const logger = app.get(AppLoggerService);

  // Configurar logger da aplicação
  app.useLogger(logger);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? undefined : false,
  }));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  // CORS
  const allowedOrigins = process.env.NODE_ENV === 'production'
    ? process.env.CORS_ORIGINS?.split(',') || ['https://yourdomain.com']
    : ['http://localhost:3000', 'http://localhost:3001'];

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-correlation-id'],
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

  // Graceful shutdown
  process.on('SIGTERM', () => {
    logger.log('SIGTERM received, shutting down gracefully', 'Bootstrap');
    app.close().then(() => {
      logger.log('Application closed successfully', 'Bootstrap');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    logger.log('SIGINT received, shutting down gracefully', 'Bootstrap');
    app.close().then(() => {
      logger.log('Application closed successfully', 'Bootstrap');
      process.exit(0);
    });
  });

  logger.log(`🚀 Producer Manager API is running on: http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
  logger.log(`📚 Swagger documentation: http://localhost:${port}/${swaggerPath}`, 'Bootstrap');
  logger.log(`🔍 Health checks: http://localhost:${port}/${apiPrefix}/health`, 'Bootstrap');
  logger.log(`📊 Metrics: http://localhost:${port}/${apiPrefix}/metrics`, 'Bootstrap');
}

bootstrap();
