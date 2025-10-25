import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { of } from 'rxjs';
import { AuditService } from '../audit/audit.service';
import { RequestWithCorrelation } from '../middleware/correlation-id.middleware';
import { Auditable, AuditInterceptor } from './audit.interceptor';

describe('AuditInterceptor', () => {
  let interceptor: AuditInterceptor;
  let auditService: AuditService;
  let reflector: Reflector;
  let executionContext: ExecutionContext;
  let callHandler: CallHandler;
  let mockRequest: Partial<RequestWithCorrelation>;

  beforeEach(async () => {
    const mockAuditService = {
      logCreate: jest.fn(),
      logUpdate: jest.fn(),
      logDelete: jest.fn(),
    };

    const mockReflector = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditInterceptor,
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
        {
          provide: Reflector,
          useValue: mockReflector,
        },
      ],
    }).compile();

    interceptor = module.get<AuditInterceptor>(AuditInterceptor);
    auditService = module.get<AuditService>(AuditService);
    reflector = module.get<Reflector>(Reflector);

    // Mock request
    mockRequest = {
      method: 'GET',
      params: { id: 'test-id' },
      body: { name: 'test' },
      ip: '127.0.0.1',
      headers: { 'user-agent': 'test-agent' },
      correlationId: 'correlation-123',
      connection: { remoteAddress: '192.168.1.1' } as any,
    };

    // Mock execution context
    executionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
      getHandler: jest.fn().mockReturnValue(() => {}),
    } as any;

    // Mock call handler
    callHandler = {
      handle: jest.fn(),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('intercept', () => {
    it('should not audit when endpoint is not marked as @Auditable', async () => {
      (reflector.get as jest.Mock).mockReturnValue(undefined);
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'response-id' }));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(reflector.get).toHaveBeenCalledWith('audit_entity_type', expect.any(Function));
      expect(auditService.logCreate).not.toHaveBeenCalled();
      expect(auditService.logUpdate).not.toHaveBeenCalled();
      expect(auditService.logDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'response-id' });
    });

    it('should audit POST request (create operation)', async () => {
      mockRequest.method = 'POST';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'new-id', name: 'New Producer' }));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).toHaveBeenCalledWith(
        'Producer',
        'new-id',
        { id: 'new-id', name: 'New Producer' },
        {
          userId: undefined,
          userIp: '127.0.0.1',
          userAgent: 'test-agent',
          correlationId: 'correlation-123',
        },
      );
      expect(result).toEqual({ id: 'new-id', name: 'New Producer' });
    });

    it('should audit PUT request (update operation)', async () => {
      mockRequest.method = 'PUT';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(
        of({ id: 'test-id', name: 'Updated Producer' }),
      );

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logUpdate).toHaveBeenCalledWith(
        'Producer',
        'test-id',
        {},
        { id: 'test-id', name: 'Updated Producer' },
        {
          userId: undefined,
          userIp: '127.0.0.1',
          userAgent: 'test-agent',
          correlationId: 'correlation-123',
        },
      );
      expect(result).toEqual({ id: 'test-id', name: 'Updated Producer' });
    });

    it('should audit PATCH request (update operation)', async () => {
      mockRequest.method = 'PATCH';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(
        of({ id: 'test-id', name: 'Patched Producer' }),
      );

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logUpdate).toHaveBeenCalledWith(
        'Producer',
        'test-id',
        {},
        { id: 'test-id', name: 'Patched Producer' },
        expect.objectContaining({
          userId: undefined,
          userIp: '127.0.0.1',
          correlationId: 'correlation-123',
        }),
      );
    });

    it('should audit DELETE request (delete operation)', async () => {
      mockRequest.method = 'DELETE';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logDelete).toHaveBeenCalledWith('Producer', 'test-id', {}, false, {
        userId: undefined,
        userIp: '127.0.0.1',
        userAgent: 'test-agent',
        correlationId: 'correlation-123',
      });
      expect(result).toBeUndefined();
    });

    it('should not audit POST if response has no id', async () => {
      mockRequest.method = 'POST';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ message: 'Success but no id' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).not.toHaveBeenCalled();
    });

    it('should not audit PUT/PATCH if no entityId in params', async () => {
      mockRequest.method = 'PUT';
      mockRequest.params = {};
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ name: 'Updated' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logUpdate).not.toHaveBeenCalled();
    });

    it('should not audit DELETE if no entityId in params', async () => {
      mockRequest.method = 'DELETE';
      mockRequest.params = {};
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logDelete).not.toHaveBeenCalled();
    });

    it('should handle GET request without auditing', async () => {
      mockRequest.method = 'GET';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'test-id', name: 'Producer' }));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).not.toHaveBeenCalled();
      expect(auditService.logUpdate).not.toHaveBeenCalled();
      expect(auditService.logDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ id: 'test-id', name: 'Producer' });
    });

    it('should handle audit service errors gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      mockRequest.method = 'POST';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'new-id', name: 'New Producer' }));
      (auditService.logCreate as jest.Mock).mockRejectedValue(new Error('Audit service error'));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(consoleSpy).toHaveBeenCalledWith('Error in audit interceptor:', expect.any(Error));
      expect(result).toEqual({ id: 'new-id', name: 'New Producer' });

      consoleSpy.mockRestore();
    });

    it('should use connection.remoteAddress when ip is not available', async () => {
      const mockRequestWithoutIp = {
        ...mockRequest,
        ip: undefined,
      };
      executionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutIp),
      });

      mockRequestWithoutIp.method = 'POST';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'new-id', name: 'New Producer' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).toHaveBeenCalledWith(
        'Producer',
        'new-id',
        { id: 'new-id', name: 'New Producer' },
        expect.objectContaining({
          userIp: '192.168.1.1',
        }),
      );
    });

    it('should handle missing headers gracefully', async () => {
      const mockRequestWithoutHeaders = {
        ...mockRequest,
        headers: undefined,
        method: 'POST',
      };
      executionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutHeaders),
      });

      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'new-id', name: 'New Producer' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).toHaveBeenCalledWith(
        'Producer',
        'new-id',
        { id: 'new-id', name: 'New Producer' },
        expect.objectContaining({
          userAgent: undefined,
        }),
      );
    });
  });

  describe('extractUserId', () => {
    it('should return undefined for anonymous users', () => {
      const result = interceptor['extractUserId'](mockRequest);
      expect(result).toBeUndefined();
    });

    it('should handle request without authorization header', () => {
      const requestWithoutAuth = { headers: {} };
      const result = interceptor['extractUserId'](requestWithoutAuth);
      expect(result).toBeUndefined();
    });
  });

  describe('Auditable decorator', () => {
    it('should set metadata on target method', () => {
      const mockDescriptor = { value: jest.fn() };
      const mockTarget = {};
      const defineSpy = jest.spyOn(Reflect, 'defineMetadata');

      Auditable('Producer')(mockTarget, 'create', mockDescriptor);

      expect(defineSpy).toHaveBeenCalledWith('audit_entity_type', 'Producer', mockDescriptor.value);

      defineSpy.mockRestore();
    });

    it('should return the original descriptor', () => {
      const mockDescriptor = { value: jest.fn() };
      const mockTarget = {};

      const result = Auditable('Producer')(mockTarget, 'create', mockDescriptor);

      expect(result).toBe(mockDescriptor);
    });
  });

  describe('error handling and edge cases', () => {
    it('should handle null response in POST', async () => {
      mockRequest.method = 'POST';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of(null));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).not.toHaveBeenCalled();
    });

    it('should handle undefined response in PUT', async () => {
      mockRequest.method = 'PUT';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logUpdate).not.toHaveBeenCalled();
    });

    it('should handle missing correlationId', async () => {
      const mockRequestWithoutCorrelation = {
        ...mockRequest,
        correlationId: undefined,
        method: 'POST',
      };
      executionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutCorrelation),
      });

      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'new-id', name: 'Producer' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).toHaveBeenCalledWith(
        'Producer',
        'new-id',
        { id: 'new-id', name: 'Producer' },
        expect.objectContaining({
          correlationId: undefined,
        }),
      );
    });

    it('should handle different HTTP methods not in switch', async () => {
      mockRequest.method = 'OPTIONS';
      (reflector.get as jest.Mock).mockReturnValue('Producer');
      (callHandler.handle as jest.Mock).mockReturnValue(of({ message: 'Options response' }));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(auditService.logCreate).not.toHaveBeenCalled();
      expect(auditService.logUpdate).not.toHaveBeenCalled();
      expect(auditService.logDelete).not.toHaveBeenCalled();
      expect(result).toEqual({ message: 'Options response' });
    });
  });
});
