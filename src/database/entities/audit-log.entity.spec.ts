import { AuditAction, AuditLog } from './audit-log.entity';

describe('AuditLog Entity', () => {
  describe('create static method', () => {
    it('should create audit log with all properties', () => {
      const params = {
        action: AuditAction.CREATE,
        entityType: 'Produtor',
        entityId: 'prod-123',
        userId: 'user-456',
        userIp: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        correlationId: 'corr-789',
        oldData: null,
        newData: { nome: 'João Silva' },
        changedFields: [],
        metadata: 'Created via API',
      };

      const auditLog = AuditLog.create(params);

      expect(auditLog.action).toBe(AuditAction.CREATE);
      expect(auditLog.entityType).toBe('Produtor');
      expect(auditLog.entityId).toBe('prod-123');
      expect(auditLog.userId).toBe('user-456');
      expect(auditLog.userIp).toBe('192.168.1.1');
      expect(auditLog.userAgent).toBe('Mozilla/5.0');
      expect(auditLog.correlationId).toBe('corr-789');
      expect(auditLog.oldData).toBeNull();
      expect(auditLog.newData).toEqual({ nome: 'João Silva' });
      expect(auditLog.changedFields).toEqual([]);
      expect(auditLog.metadata).toBe('Created via API');
    });

    it('should create audit log with minimal properties', () => {
      const params = {
        action: AuditAction.DELETE,
        entityType: 'Cultura',
        entityId: 'cult-123',
      };

      const auditLog = AuditLog.create(params);

      expect(auditLog.action).toBe(AuditAction.DELETE);
      expect(auditLog.entityType).toBe('Cultura');
      expect(auditLog.entityId).toBe('cult-123');
      expect(auditLog.userId).toBeUndefined();
      expect(auditLog.userIp).toBeUndefined();
      expect(auditLog.oldData).toBeUndefined();
      expect(auditLog.newData).toBeUndefined();
    });
  });

  describe('getChangedFields static method', () => {
    it('should identify changed fields correctly', () => {
      const oldData = {
        id: 'prod-123',
        nome: 'João Silva',
        cpfCnpj: '123.456.789-00',
        email: 'joao@email.com',
        updatedAt: new Date('2023-01-01'),
      };

      const newData = {
        id: 'prod-123',
        nome: 'João Santos', // Changed
        cpfCnpj: '123.456.789-00',
        email: 'joao.santos@email.com', // Changed
        updatedAt: new Date('2023-01-02'), // Should be ignored
      };

      const changedFields = AuditLog.getChangedFields(oldData, newData);

      expect(changedFields).toEqual(['nome', 'email']);
      expect(changedFields).not.toContain('id');
      expect(changedFields).not.toContain('cpfCnpj');
      expect(changedFields).not.toContain('updatedAt');
    });

    it('should handle nested objects', () => {
      const oldData = {
        id: 'prod-123',
        endereco: {
          rua: 'Rua A',
          numero: 123,
          cidade: 'São Paulo',
        },
      };

      const newData = {
        id: 'prod-123',
        endereco: {
          rua: 'Rua B', // Changed
          numero: 123,
          cidade: 'São Paulo',
        },
      };

      const changedFields = AuditLog.getChangedFields(oldData, newData);

      expect(changedFields).toEqual(['endereco']);
    });

    it('should handle array changes', () => {
      const oldData = {
        id: 'prod-123',
        tags: ['tag1', 'tag2'],
      };

      const newData = {
        id: 'prod-123',
        tags: ['tag1', 'tag2', 'tag3'],
      };

      const changedFields = AuditLog.getChangedFields(oldData, newData);

      expect(changedFields).toEqual(['tags']);
    });

    it('should return empty array when no changes', () => {
      const data = {
        id: 'prod-123',
        nome: 'João Silva',
        cpfCnpj: '123.456.789-00',
      };

      const changedFields = AuditLog.getChangedFields(data, data);

      expect(changedFields).toEqual([]);
    });

    it('should return empty array when data is null/undefined', () => {
      expect(AuditLog.getChangedFields(null, null)).toEqual([]);
      expect(AuditLog.getChangedFields(undefined, undefined)).toEqual([]);
      expect(AuditLog.getChangedFields({}, null)).toEqual([]);
      expect(AuditLog.getChangedFields(null, {})).toEqual([]);
    });
  });

  describe('sanitizeData static method', () => {
    it('should sanitize sensitive fields', () => {
      const data = {
        id: 'user-123',
        name: 'João Silva',
        password: 'secretpassword',
        token: 'bearer-token-123',
        secret: 'api-secret',
        key: 'encryption-key',
        email: 'joao@email.com',
      };

      const sanitized = AuditLog.sanitizeData(data);

      expect(sanitized.id).toBe('user-123');
      expect(sanitized.name).toBe('João Silva');
      expect(sanitized.email).toBe('joao@email.com');
      expect(sanitized.password).toBe('***REDACTED***');
      expect(sanitized.token).toBe('***REDACTED***');
      expect(sanitized.secret).toBe('***REDACTED***');
      expect(sanitized.key).toBe('***REDACTED***');
    });

    it('should handle non-object data', () => {
      expect(AuditLog.sanitizeData(null)).toBeNull();
      expect(AuditLog.sanitizeData(undefined)).toBeUndefined();
      expect(AuditLog.sanitizeData('string')).toBe('string');
      expect(AuditLog.sanitizeData(123)).toBe(123);
      expect(AuditLog.sanitizeData([])).toEqual({}); // Arrays are objects, get spread as empty object
    });

    it('should not modify original data', () => {
      const originalData = {
        id: 'user-123',
        password: 'secret',
        name: 'João',
      };

      const sanitized = AuditLog.sanitizeData(originalData);

      expect(originalData.password).toBe('secret'); // Original unchanged
      expect(sanitized.password).toBe('***REDACTED***'); // Copy sanitized
    });
  });

  describe('AuditAction enum', () => {
    it('should have all required actions', () => {
      expect(AuditAction.CREATE).toBe('CREATE');
      expect(AuditAction.UPDATE).toBe('UPDATE');
      expect(AuditAction.DELETE).toBe('DELETE');
      expect(AuditAction.SOFT_DELETE).toBe('SOFT_DELETE');
      expect(AuditAction.RESTORE).toBe('RESTORE');
    });
  });
});
