import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import * as cls from 'cls-hooked';
import * as winston from 'winston';

@Injectable()
export class AppLoggerService implements NestLoggerService {
  private readonly logger: winston.Logger;
  private readonly namespace = cls.createNamespace('app-context');

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf((info) => {
          const correlationId = this.getCorrelationId();
          return JSON.stringify({
            ...info,
            correlationId,
            service: 'producer-manager-api',
            environment: process.env.NODE_ENV || 'development',
          });
        }),
      ),
      transports: [
        new winston.transports.Console({
          format:
            process.env.NODE_ENV === 'production'
              ? winston.format.json()
              : winston.format.combine(
                  winston.format.colorize(),
                  winston.format.simple(),
                  winston.format.printf((info) => {
                    const correlationId = this.getCorrelationId();
                    const correlationStr = correlationId ? `[${correlationId}]` : '';
                    return `${info.timestamp} ${info.level} ${correlationStr}: ${info.message}`;
                  }),
                ),
        }),
      ],
    });

    // Em produção, adicionar transporte para arquivo
    if (process.env.NODE_ENV === 'production') {
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
      );
      this.logger.add(
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      );
    }
  }

  private getCorrelationId(): string | undefined {
    return cls.getNamespace('app-context')?.get('correlationId');
  }

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Métodos para logging estruturado com dados adicionais
  logWithData(level: string, message: string, data: any, context?: string) {
    this.logger.log(level, message, { ...data, context });
  }

  // Métodos adicionais para logging estruturado
  logRequest(method: string, url: string, statusCode: number, responseTime: number) {
    this.logger.info('Request completed', {
      type: 'http_request',
      method,
      url,
      statusCode,
      responseTime,
    });
  }

  logDatabaseQuery(query: string, duration: number, success: boolean) {
    this.logger.debug('Database query executed', {
      type: 'database_query',
      query: query.substring(0, 100), // Limitar tamanho do log
      duration,
      success,
    });
  }

  logBusinessOperation(operation: string, entityType: string, entityId: string, userId?: string) {
    this.logger.info('Business operation', {
      type: 'business_operation',
      operation,
      entityType,
      entityId,
      userId,
    });
  }

  logError(error: Error, context?: string, additionalData?: any) {
    this.logger.error('Application error', {
      type: 'application_error',
      message: error.message,
      stack: error.stack,
      context,
      ...additionalData,
    });
  }

  // Método para definir correlation ID
  setCorrelationId(correlationId: string): void {
    this.namespace.set('correlationId', correlationId);
  }

  // Método para executar código com contexto
  runWithContext<T>(correlationId: string, fn: () => T): T {
    return this.namespace.run(() => {
      this.setCorrelationId(correlationId);
      return fn();
    }) as T;
  }
}
