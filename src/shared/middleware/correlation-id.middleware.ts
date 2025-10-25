import { Injectable, NestMiddleware } from '@nestjs/common';
import * as cls from 'cls-hooked';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';

export interface RequestWithCorrelation extends Request {
  correlationId: string;
}

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  private readonly namespace =
    cls.getNamespace('app-context') || cls.createNamespace('app-context');

  use(req: RequestWithCorrelation, res: Response, next: NextFunction) {
    const correlationId = (req.headers['x-correlation-id'] as string) || uuidv4();

    // Adicionar correlation ID ao request
    req.correlationId = correlationId;

    // Adicionar correlation ID ao response header
    res.setHeader('x-correlation-id', correlationId);

    // Executar próximo middleware dentro do contexto
    this.namespace.run(() => {
      this.namespace.set('correlationId', correlationId);
      next();
    });
  }
}
