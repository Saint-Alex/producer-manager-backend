import { ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { AppLoggerService } from '../logging/logger.service';
import { RequestWithCorrelation } from '../middleware/correlation-id.middleware';
import { GlobalExceptionFilter } from './global-exception.filter';

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let logger: AppLoggerService;
  let mockResponse: Partial<Response>;
  let mockRequest: Partial<RequestWithCorrelation>;
  let mockArgumentsHost: Partial<ArgumentsHost>;

  beforeEach(async () => {
    const mockLogger = {
      error: jest.fn(),
      logError: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GlobalExceptionFilter,
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    filter = module.get<GlobalExceptionFilter>(GlobalExceptionFilter);
    logger = module.get<AppLoggerService>(AppLoggerService);

    // Mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };

    // Mock request
    mockRequest = {
      url: '/test',
      method: 'GET',
      body: {},
      query: {},
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
      correlationId: 'test-correlation-id',
    };

    // Mock ArgumentsHost
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: jest.fn().mockReturnValue(mockResponse),
        getRequest: jest.fn().mockReturnValue(mockRequest),
      }),
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.NODE_ENV;
  });

  describe('catch', () => {
    it('should handle HttpException correctly', () => {
      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Test error',
          path: '/test',
          method: 'GET',
          correlationId: 'test-correlation-id',
        }),
      );
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: ['field is required'], error: 'Bad Request' },
        HttpStatus.BAD_REQUEST,
      );

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: ['field is required'],
          error: 'Bad Request',
        }),
      );
    });

    it('should handle generic Error correctly', () => {
      const exception = new Error('Generic error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Generic error',
          error: 'Error',
        }),
      );
    });

    it('should handle QueryFailedError with BAD_REQUEST status', () => {
      const exception = new Error('duplicate key value violates unique constraint');
      exception.name = 'QueryFailedError';

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Este registro já existe no sistema.',
          error: 'QueryFailedError',
        }),
      );
    });

    it('should handle EntityNotFoundError with NOT_FOUND status', () => {
      const exception = new Error('Entity not found');
      exception.name = 'EntityNotFoundError';

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.NOT_FOUND,
          message: 'Entity not found',
          error: 'EntityNotFoundError',
        }),
      );
    });

    it('should handle unknown exception correctly', () => {
      const exception = 'String exception';

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'Internal server error',
        }),
      );
    });

    it('should remove stack trace in production', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeUndefined();
    });

    it('should include stack trace in development', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Test error');

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.stack).toBeDefined();
    });
  });

  describe('getHttpStatus', () => {
    it('should return correct status for HttpException', () => {
      const exception = new HttpException('Test', HttpStatus.FORBIDDEN);
      const result = filter['getHttpStatus'](exception);
      expect(result).toBe(HttpStatus.FORBIDDEN);
    });

    it('should return BAD_REQUEST for QueryFailedError', () => {
      const exception = new Error('Query failed');
      exception.name = 'QueryFailedError';
      const result = filter['getHttpStatus'](exception);
      expect(result).toBe(HttpStatus.BAD_REQUEST);
    });

    it('should return NOT_FOUND for EntityNotFoundError', () => {
      const exception = new Error('Entity not found');
      exception.name = 'EntityNotFoundError';
      const result = filter['getHttpStatus'](exception);
      expect(result).toBe(HttpStatus.NOT_FOUND);
    });

    it('should return INTERNAL_SERVER_ERROR for unknown errors', () => {
      const exception = new Error('Unknown error');
      const result = filter['getHttpStatus'](exception);
      expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });

    it('should return INTERNAL_SERVER_ERROR for non-Error exceptions', () => {
      const exception = { some: 'object' };
      const result = filter['getHttpStatus'](exception);
      expect(result).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
    });
  });

  describe('createErrorResponse', () => {
    it('should create basic error response', () => {
      const exception = new Error('Test error');
      const result = filter['createErrorResponse'](exception, mockRequest as RequestWithCorrelation, 500);

      expect(result).toMatchObject({
        statusCode: 500,
        timestamp: expect.any(String),
        path: '/test',
        method: 'GET',
        message: 'Test error',
        error: 'Error',
        correlationId: 'test-correlation-id',
      });
    });

    it('should handle HttpException with string response', () => {
      const exception = new HttpException('Custom message', HttpStatus.BAD_REQUEST);
      const result = filter['createErrorResponse'](exception, mockRequest as RequestWithCorrelation, 400);

      expect(result.message).toBe('Custom message');
      expect(result.error).toBe('HttpException');
    });

    it('should handle HttpException with object response', () => {
      const exception = new HttpException(
        { message: 'Validation failed', error: 'ValidationError' },
        HttpStatus.BAD_REQUEST,
      );
      const result = filter['createErrorResponse'](exception, mockRequest as RequestWithCorrelation, 400);

      expect(result.message).toBe('Validation failed');
      expect(result.error).toBe('ValidationError');
    });

    it('should include stack trace in development for Error', () => {
      process.env.NODE_ENV = 'development';
      const exception = new Error('Test error');
      const result = filter['createErrorResponse'](exception, mockRequest as RequestWithCorrelation, 500);

      expect(result.stack).toBeDefined();
    });

    it('should not include stack trace in production for Error', () => {
      process.env.NODE_ENV = 'production';
      const exception = new Error('Test error');
      const result = filter['createErrorResponse'](exception, mockRequest as RequestWithCorrelation, 500);

      expect(result.stack).toBeUndefined();
    });
  });

  describe('getSafeErrorMessage', () => {
    it('should return mapped message for duplicate key error', () => {
      const error = new Error('duplicate key value violates unique constraint');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Este registro já existe no sistema.');
    });

    it('should return mapped message for foreign key error', () => {
      const error = new Error('violates foreign key constraint');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Referência inválida a outro registro.');
    });

    it('should return mapped message for not-null constraint', () => {
      const error = new Error('violates not-null constraint');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Campo obrigatório não foi preenchido.');
    });

    it('should return mapped message for check constraint', () => {
      const error = new Error('violates check constraint');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Valor não atende aos critérios de validação.');
    });

    it('should return mapped message for invalid UUID', () => {
      const error = new Error('invalid input syntax for type uuid');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Formato de ID inválido.');
    });

    it('should return mapped message for relation not exist', () => {
      const error = new Error('relation does not exist');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Recurso não encontrado.');
    });

    it('should return mapped message for column not exist', () => {
      const error = new Error('column does not exist');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Campo não encontrado.');
    });

    it('should return generic message in production for unmapped errors', () => {
      process.env.NODE_ENV = 'production';
      const error = new Error('Some unmapped error');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Ocorreu um erro interno. Tente novamente em alguns momentos.');
    });

    it('should return original message in development for unmapped errors', () => {
      process.env.NODE_ENV = 'development';
      const error = new Error('Some unmapped error');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Some unmapped error');
    });

    it('should handle case insensitive error matching', () => {
      const error = new Error('DUPLICATE KEY VALUE VIOLATES UNIQUE CONSTRAINT');
      const result = filter['getSafeErrorMessage'](error);
      expect(result).toBe('Este registro já existe no sistema.');
    });
  });

  describe('logError', () => {
    it('should log Error exceptions correctly', () => {
      const exception = new Error('Test error');
      filter['logError'](exception, mockRequest as RequestWithCorrelation, 400);

      expect(logger.logError).toHaveBeenCalledWith(
        exception,
        'GlobalExceptionFilter',
        expect.objectContaining({
          method: 'GET',
          url: '/test',
          statusCode: 400,
          correlationId: 'test-correlation-id',
        }),
      );
    });

    it('should log unknown exceptions correctly', () => {
      const exception = 'String exception';
      filter['logError'](exception, mockRequest as RequestWithCorrelation, 500);

      expect(logger.error).toHaveBeenCalledWith(
        'Unknown error occurred',
        JSON.stringify(exception),
        'GlobalExceptionFilter',
      );
    });

    it('should log critical errors (5xx) with additional context', () => {
      const exception = new Error('Critical error');
      filter['logError'](exception, mockRequest as RequestWithCorrelation, 500);

      expect(logger.error).toHaveBeenCalledWith(
        'Critical error: 500 GET /test',
        exception.stack,
        'GlobalExceptionFilter',
      );
    });

    it('should log critical errors for non-Error exceptions', () => {
      const exception = 'Critical string exception';
      filter['logError'](exception, mockRequest as RequestWithCorrelation, 503);

      expect(logger.error).toHaveBeenCalledWith(
        'Critical error: 503 GET /test',
        'No stack trace',
        'GlobalExceptionFilter',
      );
    });

    it('should not log additional context for non-critical errors', () => {
      const exception = new Error('Client error');
      filter['logError'](exception, mockRequest as RequestWithCorrelation, 400);

      expect(logger.error).not.toHaveBeenCalledWith(
        expect.stringContaining('Critical error'),
        expect.anything(),
        expect.anything(),
      );
    });
  });

  describe('sanitizeBody', () => {
    it('should redact sensitive fields', () => {
      const body = {
        username: 'user',
        password: 'secret123',
        token: 'abc123',
        secret: 'mysecret',
        authorization: 'Bearer token',
        normalField: 'normal',
      };

      const result = filter['sanitizeBody'](body);

      expect(result).toEqual({
        username: 'user',
        password: '***REDACTED***',
        token: '***REDACTED***',
        secret: '***REDACTED***',
        authorization: '***REDACTED***',
        normalField: 'normal',
      });
    });

    it('should return original body if not an object', () => {
      expect(filter['sanitizeBody']('string')).toBe('string');
      expect(filter['sanitizeBody'](123)).toBe(123);
      expect(filter['sanitizeBody'](null)).toBe(null);
      expect(filter['sanitizeBody'](undefined)).toBe(undefined);
    });

    it('should handle empty object', () => {
      const result = filter['sanitizeBody']({});
      expect(result).toEqual({});
    });

    it('should not modify original body object', () => {
      const originalBody = { password: 'secret', normal: 'value' };
      const result = filter['sanitizeBody'](originalBody);

      expect(originalBody.password).toBe('secret'); // Original unchanged
      expect(result.password).toBe('***REDACTED***'); // Result sanitized
    });

    it('should handle body without sensitive fields', () => {
      const body = { username: 'user', email: 'user@example.com' };
      const result = filter['sanitizeBody'](body);

      expect(result).toEqual(body);
    });
  });

  describe('integration tests', () => {
    it('should handle complete error flow for HttpException', () => {
      const exception = new HttpException('Validation failed', HttpStatus.BAD_REQUEST);

      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(logger.logError).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: HttpStatus.BAD_REQUEST,
          message: 'Validation failed',
          error: 'HttpException',
          correlationId: 'test-correlation-id',
        }),
      );
    });

    it('should handle sensitive data in request body', () => {
      mockRequest.body = {
        username: 'user',
        password: 'secret123',
        data: 'normal'
      };

      const exception = new Error('Test error');
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      expect(logger.logError).toHaveBeenCalledWith(
        exception,
        'GlobalExceptionFilter',
        expect.objectContaining({
          body: {
            username: 'user',
            password: '***REDACTED***',
            data: 'normal',
          },
        }),
      );
    });

    it('should handle request without correlation ID', () => {
      delete mockRequest.correlationId;

      const exception = new HttpException('Test error', HttpStatus.BAD_REQUEST);
      filter.catch(exception, mockArgumentsHost as ArgumentsHost);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.correlationId).toBeUndefined();
    });
  });
});
