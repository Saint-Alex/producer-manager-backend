import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditAction, AuditLog } from '../../database/entities/audit-log.entity';
import { AppLoggerService } from '../logging/logger.service';
import { AuditService } from './audit.service';

describe('AuditService', () => {
  let service: AuditService;
  let auditRepository: jest.Mocked<Repository<AuditLog>>;
  let logger: jest.Mocked<AppLoggerService>;

  beforeEach(async () => {
    const mockRepository = {
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getMany: jest.fn(),
        getRawMany: jest.fn(),
      })),
    };

    const mockLogger = {
      logBusinessOperation: jest.fn(),
      logError: jest.fn(),
      logWithData: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockRepository,
        },
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    auditRepository = module.get(getRepositoryToken(AuditLog));
    logger = module.get(AppLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('logCreate', () => {
    it('should create audit log for CREATE operation', async () => {
      const mockSave = auditRepository.save.mockResolvedValue({} as AuditLog);

      const context = {
        userId: 'user-123',
        userIp: '192.168.1.1',
        correlationId: 'corr-123',
      };

      const newData = { id: 'prod-123', nome: 'João Silva' };

      await service.logCreate('Produtor', 'prod-123', newData, context);

      expect(auditRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.CREATE,
          entityType: 'Produtor',
          entityId: 'prod-123',
          newData,
          userId: 'user-123',
          userIp: '192.168.1.1',
          correlationId: 'corr-123',
        }),
      );

      expect(logger.logBusinessOperation).toHaveBeenCalledWith(
        'CREATE',
        'Produtor',
        'prod-123',
        'user-123',
      );
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      auditRepository.save.mockRejectedValue(error);

      await service.logCreate('Produtor', 'prod-123', {});

      expect(logger.logError).toHaveBeenCalledWith(
        error,
        'AuditService.logCreate',
        expect.any(Object),
      );
    });
  });

  describe('logUpdate', () => {
    it('should create audit log for UPDATE operation with changed fields', async () => {
      const mockSave = auditRepository.save.mockResolvedValue({} as AuditLog);

      const oldData = { id: 'prod-123', nome: 'João Silva', idade: 30 };
      const newData = { id: 'prod-123', nome: 'João Santos', idade: 30 };

      await service.logUpdate('Produtor', 'prod-123', oldData, newData);

      expect(auditRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.UPDATE,
          entityType: 'Produtor',
          entityId: 'prod-123',
          oldData,
          newData,
          changedFields: ['nome'],
        }),
      );
    });

    it('should not create log when no fields changed', async () => {
      const data = { id: 'prod-123', nome: 'João Silva' };

      await service.logUpdate('Produtor', 'prod-123', data, data);

      expect(auditRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('logDelete', () => {
    it('should create audit log for DELETE operation', async () => {
      const oldData = { id: 'prod-123', nome: 'João Silva' };

      await service.logDelete('Produtor', 'prod-123', oldData, false);

      expect(auditRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.DELETE,
          entityType: 'Produtor',
          entityId: 'prod-123',
          oldData,
        }),
      );
    });

    it('should create audit log for SOFT_DELETE operation', async () => {
      const oldData = { id: 'prod-123', nome: 'João Silva' };

      await service.logDelete('Produtor', 'prod-123', oldData, true);

      expect(auditRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          action: AuditAction.SOFT_DELETE,
          entityType: 'Produtor',
          entityId: 'prod-123',
          oldData,
        }),
      );
    });
  });

  describe('getEntityHistory', () => {
    it('should return entity history', async () => {
      const mockLogs = [
        { id: '1', action: AuditAction.CREATE },
        { id: '2', action: AuditAction.UPDATE },
      ] as AuditLog[];

      auditRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getEntityHistory('Produtor', 'prod-123');

      expect(result).toEqual(mockLogs);
      expect(auditRepository.find).toHaveBeenCalledWith({
        where: { entityType: 'Produtor', entityId: 'prod-123' },
        order: { createdAt: 'DESC' },
        take: 50,
      });
    });
  });
});
