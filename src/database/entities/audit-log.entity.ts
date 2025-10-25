import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    PrimaryGeneratedColumn,
} from 'typeorm';

export enum AuditAction {
  CREATE = 'CREATE',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  SOFT_DELETE = 'SOFT_DELETE',
  RESTORE = 'RESTORE',
}

@Entity('audit_logs')
@Index(['entityType', 'entityId'])
@Index(['userId'])
@Index(['action'])
@Index(['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AuditAction,
    comment: 'Tipo de operação realizada',
  })
  action: AuditAction;

  @Column({
    type: 'varchar',
    length: 100,
    comment: 'Nome da entidade afetada (ex: Producer, Propriedade)',
  })
  entityType: string;

  @Column({
    type: 'uuid',
    comment: 'ID da entidade afetada',
  })
  entityId: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'ID do usuário que realizou a operação',
  })
  userId: string;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    comment: 'IP do usuário',
  })
  userIp: string;

  @Column({
    type: 'text',
    nullable: true,
    comment: 'User Agent do navegador',
  })
  userAgent: string;

  @Column({
    type: 'uuid',
    nullable: true,
    comment: 'ID de correlação da requisição',
  })
  correlationId: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Dados antes da alteração (para UPDATE e DELETE)',
  })
  oldData: any;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Dados após a alteração (para CREATE e UPDATE)',
  })
  newData: any;

  @Column({
    type: 'jsonb',
    nullable: true,
    comment: 'Campos que foram alterados (apenas para UPDATE)',
  })
  changedFields: string[];

  @Column({
    type: 'text',
    nullable: true,
    comment: 'Informações adicionais ou contexto da operação',
  })
  metadata: string;

  @CreateDateColumn({
    type: 'timestamp',
    comment: 'Data e hora da operação',
  })
  createdAt: Date;

  // Métodos utilitários
  static create(params: {
    action: AuditAction;
    entityType: string;
    entityId: string;
    userId?: string;
    userIp?: string;
    userAgent?: string;
    correlationId?: string;
    oldData?: any;
    newData?: any;
    changedFields?: string[];
    metadata?: string;
  }): AuditLog {
    const auditLog = new AuditLog();
    Object.assign(auditLog, params);
    return auditLog;
  }

  // Método para comparar objetos e identificar campos alterados
  static getChangedFields(oldData: any, newData: any): string[] {
    if (!oldData || !newData) return [];

    const changedFields: string[] = [];
    const allKeys = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const key of allKeys) {
      if (key === 'updatedAt' || key === 'createdAt') continue; // Ignorar campos de timestamp

      const oldValue = oldData[key];
      const newValue = newData[key];

      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changedFields.push(key);
      }
    }

    return changedFields;
  }

  // Método para sanitizar dados sensíveis
  static sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') return data;

    const sensitiveFields = ['password', 'token', 'secret', 'key'];
    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '***REDACTED***';
      }
    }

    return sanitized;
  }
}
