import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Import modules
import { CultivoModule } from './modules/cultivo/cultivo.module';
import { CulturaModule } from './modules/cultura/cultura.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ProdutorModule } from './modules/produtor/produtor.module';
import { PropriedadeModule } from './modules/propriedade/propriedade.module';
import { SafraModule } from './modules/safra/safra.module';

// Import observability components
import { AuditLog } from './database/entities/audit-log.entity';
import { AuditService } from './shared/audit/audit.service';
import { getDatabaseConfig } from './shared/config/database.config';
import { configValidationSchema } from './shared/config/validation.schema';
import { GlobalExceptionFilter } from './shared/filters/global-exception.filter';
import { HealthModule } from './shared/health/health.module';
import { AuditInterceptor } from './shared/interceptors/audit.interceptor';
import { LoggingInterceptor } from './shared/interceptors/logging.interceptor';
import { MetricsInterceptor } from './shared/interceptors/metrics.interceptor';
import { AppLoggerService } from './shared/logging/logger.service';
import { MetricsController } from './shared/metrics/metrics.controller';
import { MetricsService } from './shared/metrics/metrics.service';
import { CorrelationIdMiddleware } from './shared/middleware/correlation-id.middleware';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema: configValidationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: false,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests por minuto
      },
    ]),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const dbConfig = getDatabaseConfig();
        return {
          type: 'postgres',
          host: dbConfig.host,
          port: dbConfig.port,
          username: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
          entities: [__dirname + '/database/entities/*.entity{.ts,.js}'],
          migrations: [__dirname + '/database/migrations/*{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),

    // Audit module
    TypeOrmModule.forFeature([AuditLog]),

    // Feature modules
    ProdutorModule,
    PropriedadeModule,
    SafraModule,
    CulturaModule,
    CultivoModule,
    DashboardModule,
    HealthModule,
  ],
  controllers: [AppController, MetricsController],
  providers: [
    AppService,
    AppLoggerService,
    AuditService,
    MetricsService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
