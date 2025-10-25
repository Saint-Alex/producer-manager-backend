import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(private readonly metricsService: MetricsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const startTime = Date.now();

    return next.handle().pipe(
      tap(() => {
        try {
          const responseTime = Date.now() - startTime;
          const method = request.method;
          const statusCode = response.statusCode;

          this.metricsService.recordRequest(method, statusCode, responseTime);
        } catch (error) {
          // Não fazer throw do erro para não afetar a resposta principal
          console.error('Error recording metrics:', error);
        }
      }),
    );
  }
}
