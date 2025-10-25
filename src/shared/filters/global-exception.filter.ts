import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Response } from 'express';
import { AppLoggerService } from '../logging/logger.service';
import { RequestWithCorrelation } from '../middleware/correlation-id.middleware';

export interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
  correlationId?: string;
  stack?: string;
}

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: AppLoggerService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<RequestWithCorrelation>();

    const status = this.getHttpStatus(exception);
    const errorResponse = this.createErrorResponse(exception, request, status);

    // Log do erro
    this.logError(exception, request, status);

    // Remover stack trace em produção
    if (process.env.NODE_ENV === 'production') {
      delete errorResponse.stack;
    }

    response.status(status).json(errorResponse);
  }

  private getHttpStatus(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    // Erros de validação do TypeORM
    if (exception instanceof Error) {
      if (exception.name === 'QueryFailedError') {
        return HttpStatus.BAD_REQUEST;
      }
      if (exception.name === 'EntityNotFoundError') {
        return HttpStatus.NOT_FOUND;
      }
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private createErrorResponse(
    exception: unknown,
    request: RequestWithCorrelation,
    status: number,
  ): ErrorResponse {
    const baseResponse: ErrorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: 'Internal server error',
      correlationId: request.correlationId,
    };

    if (exception instanceof HttpException) {
      const response = exception.getResponse();

      if (typeof response === 'object' && response !== null) {
        const responseObj = response as any;
        baseResponse.message = responseObj.message || exception.message;
        baseResponse.error = responseObj.error || exception.name;
      } else {
        baseResponse.message = response as string;
        baseResponse.error = exception.name;
      }
    } else if (exception instanceof Error) {
      baseResponse.message = this.getSafeErrorMessage(exception);
      baseResponse.error = exception.name;

      // Incluir stack trace apenas em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        baseResponse.stack = exception.stack;
      }
    }

    return baseResponse;
  }

  private getSafeErrorMessage(error: Error): string {
    // Mapear mensagens de erro comuns do PostgreSQL
    const errorMappings: Record<string, string> = {
      'duplicate key value violates unique constraint': 'Este registro já existe no sistema.',
      'violates foreign key constraint': 'Referência inválida a outro registro.',
      'violates not-null constraint': 'Campo obrigatório não foi preenchido.',
      'violates check constraint': 'Valor não atende aos critérios de validação.',
      'invalid input syntax for type uuid': 'Formato de ID inválido.',
      'relation does not exist': 'Recurso não encontrado.',
      'column does not exist': 'Campo não encontrado.',
    };

    const message = error.message.toLowerCase();

    for (const [dbError, userMessage] of Object.entries(errorMappings)) {
      if (message.includes(dbError)) {
        return userMessage;
      }
    }

    // Se não encontrou mapeamento específico, retornar mensagem genérica
    if (process.env.NODE_ENV === 'production') {
      return 'Ocorreu um erro interno. Tente novamente em alguns momentos.';
    }

    return error.message;
  }

  private logError(exception: unknown, request: RequestWithCorrelation, status: number): void {
    const { method, url, body, query, headers, ip } = request;
    const userAgent = headers['user-agent'] || '';

    const errorContext = {
      method,
      url,
      statusCode: status,
      userAgent,
      ip,
      correlationId: request.correlationId,
      body: this.sanitizeBody(body),
      query,
    };

    if (exception instanceof Error) {
      this.logger.logError(exception, 'GlobalExceptionFilter', errorContext);
    } else {
      this.logger.error(
        'Unknown error occurred',
        JSON.stringify(exception),
        'GlobalExceptionFilter',
      );
    }

    // Log específico para erros críticos (5xx)
    if (status >= 500) {
      this.logger.error(
        `Critical error: ${status} ${method} ${url}`,
        exception instanceof Error ? exception.stack : 'No stack trace',
        'GlobalExceptionFilter',
      );
    }
  }

  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') return body;

    const sensitiveFields = ['password', 'token', 'secret', 'authorization'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
