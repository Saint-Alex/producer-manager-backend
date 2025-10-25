import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from '../../database/entities/audit-log.entity';
import { AppLoggerService } from '../logging/logger.service';

export interface AuditContext {
  userId?: string;
  userIp?: string;
  userAgent?: string;
  correlationId?: string;
  metadata?: string;
}

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditRepository: Repository<AuditLog>,
    private readonly logger: AppLoggerService,
  ) {}

  async logCreate(
    entityType: string,
    entityId: string,
    newData: any,
    context?: AuditContext,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create({
        action: AuditAction.CREATE,
        entityType,
        entityId,
        newData: AuditLog.sanitizeData(newData),
        ...context,
      });

      await this.auditRepository.save(auditLog);

      this.logger.logBusinessOperation('CREATE', entityType, entityId, context?.userId);
    } catch (error) {
      this.logger.logError(error, 'AuditService.logCreate', {
        entityType,
        entityId,
        context,
      });
    }
  }

  async logUpdate(
    entityType: string,
    entityId: string,
    oldData: any,
    newData: any,
    context?: AuditContext,
  ): Promise<void> {
    try {
      const changedFields = AuditLog.getChangedFields(oldData, newData);

      // Só criar log se houve mudanças
      if (changedFields.length === 0) return;

      const auditLog = AuditLog.create({
        action: AuditAction.UPDATE,
        entityType,
        entityId,
        oldData: AuditLog.sanitizeData(oldData),
        newData: AuditLog.sanitizeData(newData),
        changedFields,
        ...context,
      });

      await this.auditRepository.save(auditLog);

      this.logger.logBusinessOperation('UPDATE', entityType, entityId, context?.userId);
      this.logger.logWithData(
        'info',
        'Entity updated',
        {
          entityType,
          entityId,
          changedFields,
        },
        'AuditService',
      );
    } catch (error) {
      this.logger.logError(error, 'AuditService.logUpdate', {
        entityType,
        entityId,
        context,
      });
    }
  }

  async logDelete(
    entityType: string,
    entityId: string,
    oldData: any,
    isSoftDelete: boolean = false,
    context?: AuditContext,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create({
        action: isSoftDelete ? AuditAction.SOFT_DELETE : AuditAction.DELETE,
        entityType,
        entityId,
        oldData: AuditLog.sanitizeData(oldData),
        ...context,
      });

      await this.auditRepository.save(auditLog);

      this.logger.logBusinessOperation('DELETE', entityType, entityId, context?.userId);
    } catch (error) {
      this.logger.logError(error, 'AuditService.logDelete', {
        entityType,
        entityId,
        context,
      });
    }
  }

  async logRestore(
    entityType: string,
    entityId: string,
    restoredData: any,
    context?: AuditContext,
  ): Promise<void> {
    try {
      const auditLog = AuditLog.create({
        action: AuditAction.RESTORE,
        entityType,
        entityId,
        newData: AuditLog.sanitizeData(restoredData),
        ...context,
      });

      await this.auditRepository.save(auditLog);

      this.logger.logBusinessOperation('RESTORE', entityType, entityId, context?.userId);
    } catch (error) {
      this.logger.logError(error, 'AuditService.logRestore', {
        entityType,
        entityId,
        context,
      });
    }
  }

  // Métodos de consulta para relatórios de auditoria
  async getEntityHistory(
    entityType: string,
    entityId: string,
    limit: number = 50,
  ): Promise<AuditLog[]> {
    return this.auditRepository.find({
      where: { entityType, entityId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async getUserActivity(
    userId: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 100,
  ): Promise<AuditLog[]> {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .where('audit.userId = :userId', { userId })
      .orderBy('audit.createdAt', 'DESC')
      .limit(limit);

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    return query.getMany();
  }

  async getAuditStatistics(startDate?: Date, endDate?: Date) {
    const query = this.auditRepository
      .createQueryBuilder('audit')
      .select(['audit.action', 'audit.entityType', 'COUNT(*) as count'])
      .groupBy('audit.action, audit.entityType');

    if (startDate) {
      query.andWhere('audit.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('audit.createdAt <= :endDate', { endDate });
    }

    return query.getRawMany();
  }
}
