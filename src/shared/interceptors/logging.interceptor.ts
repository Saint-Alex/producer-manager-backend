import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppLoggerService } from '../logging/logger.service';
import { RequestWithCorrelation } from '../middleware/correlation-id.middleware';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: AppLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithCorrelation>();
    const response = context.switchToHttp().getResponse();

    const { method, url, body, query, params, headers } = request;
    const userAgent = headers?.['user-agent'] || '';
    const ip = request.ip || request.connection?.remoteAddress || '';
    const startTime = Date.now();

    // Log da requisição
    this.logger.log('Request started', 'HTTP');

    // Log estruturado detalhado
    this.logger.logWithData(
      'debug',
      'Request details',
      {
        type: 'http_request_start',
        method,
        url,
        userAgent,
        ip,
        hasBody: !!body && Object.keys(body).length > 0,
        queryParams: Object.keys(query || {}).length,
        pathParams: Object.keys(params || {}).length,
      },
      'HTTP',
    );

    return next.handle().pipe(
      tap((_data) => {
        const responseTime = Date.now() - startTime;
        const statusCode = response.statusCode;

        // Log da resposta bem-sucedida
        this.logger.logRequest(method, url, statusCode, responseTime);

        // Log adicional para operações importantes
        if (method !== 'GET') {
          this.logger.logBusinessOperation(
            method,
            this.extractEntityType(url),
            this.extractEntityId(params),
          );
        }
      }),
      catchError((error) => {
        const responseTime = Date.now() - startTime;
        const statusCode = error.status || 500;

        // Log do erro
        this.logger.logRequest(method, url, statusCode, responseTime);
        this.logger.logError(error, 'HTTP Request Error', {
          method,
          url,
          userAgent,
          ip,
          responseTime,
        });

        throw error;
      }),
    );
  }

  private extractEntityType(url: string): string {
    // Extrair tipo de entidade da URL: /api/produtores -> produtor
    const pathParts = url.split('/').filter((part) => part.length > 0);

    if (pathParts.length === 0) {
      return '';
    }

    const entityPath = pathParts[pathParts.length - 1];

    if (!entityPath) {
      return '';
    }

    // Remover IDs e query params
    const cleanPath = entityPath.split('?')[0];

    // Converter plural para singular
    if (cleanPath.endsWith('es')) {
      return cleanPath.slice(0, -2);
    } else if (cleanPath.endsWith('s')) {
      return cleanPath.slice(0, -1);
    }

    return cleanPath;
  }

  private extractEntityId(params: any): string {
    return params?.id || 'unknown';
  }
}
