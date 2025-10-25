import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditService } from '../audit/audit.service';
import { RequestWithCorrelation } from '../middleware/correlation-id.middleware';

// Decorator para marcar endpoints que devem ser auditados
export const Auditable = (entityType: string) => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    Reflect.defineMetadata('audit_entity_type', entityType, descriptor.value);
    return descriptor;
  };
};

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(
    private readonly auditService: AuditService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithCorrelation>();
    const handler = context.getHandler();

    // Verificar se o endpoint tem o decorator @Auditable
    const entityType = this.reflector.get<string>('audit_entity_type', handler);

    if (!entityType) {
      return next.handle();
    }

    const method = request.method;
    const { params, body: _body } = request;
    const entityId = params.id;

    // Capturar contexto do usuário
    const auditContext = {
      userId: this.extractUserId(request),
      userIp: request.ip || request.connection?.remoteAddress,
      userAgent: request.headers?.['user-agent'],
      correlationId: request.correlationId,
    };

    return next.handle().pipe(
      tap(async (response) => {
        try {
          switch (method) {
            case 'POST':
              if (response && response.id) {
                await this.auditService.logCreate(entityType, response.id, response, auditContext);
              }
              break;

            case 'PUT':
            case 'PATCH':
              if (entityId && response) {
                // Para UPDATE, precisaríamos dos dados antigos
                // Isso poderia ser implementado usando decorators adicionais
                // ou interceptando o service layer
                await this.auditService.logUpdate(
                  entityType,
                  entityId,
                  {}, // oldData - seria necessário implementar captura
                  response,
                  auditContext,
                );
              }
              break;

            case 'DELETE':
              if (entityId) {
                await this.auditService.logDelete(
                  entityType,
                  entityId,
                  {}, // oldData - seria necessário implementar captura
                  false,
                  auditContext,
                );
              }
              break;
          }
        } catch (error) {
          // Não fazer throw do erro para não afetar a resposta principal
          console.error('Error in audit interceptor:', error);
        }
      }),
    );
  }

  private extractUserId(_request: any): string | undefined {
    // Aqui você implementaria a extração do user ID do token JWT
    // Por enquanto, retornamos undefined (usuário anônimo)
    //
    // Exemplo com JWT:
    // const token = request.headers.authorization?.replace('Bearer ', '');
    // const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // return decoded.sub;

    return undefined;
  }
}
