import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { AppLoggerService } from '../logging/logger.service';
import { RequestWithCorrelation } from '../middleware/correlation-id.middleware';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;
  let logger: AppLoggerService;
  let executionContext: ExecutionContext;
  let callHandler: CallHandler;
  let mockRequest: Partial<RequestWithCorrelation>;
  let mockResponse: any;

  beforeEach(async () => {
    const mockLogger = {
      log: jest.fn(),
      logWithData: jest.fn(),
      logRequest: jest.fn(),
      logBusinessOperation: jest.fn(),
      logError: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoggingInterceptor,
        {
          provide: AppLoggerService,
          useValue: mockLogger,
        },
      ],
    }).compile();

    interceptor = module.get<LoggingInterceptor>(LoggingInterceptor);
    logger = module.get<AppLoggerService>(AppLoggerService);

    // Mock request
    mockRequest = {
      method: 'GET',
      url: '/api/produtores',
      body: { name: 'test' },
      query: { page: '1', limit: '10' },
      params: { id: 'test-id' },
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
      connection: { remoteAddress: '192.168.1.1' } as any,
    };

    // Mock response
    mockResponse = {
      statusCode: 200,
    };

    // Mock execution context
    executionContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequest),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      }),
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
    it('should log request start and completion successfully', async () => {
      const responseData = { id: 'test-id', name: 'test' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.log).toHaveBeenCalledWith('Request started', 'HTTP');
      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          type: 'http_request_start',
          method: 'GET',
          url: '/api/produtores',
          userAgent: 'test-agent',
          ip: '127.0.0.1',
          hasBody: true,
          queryParams: 2,
          pathParams: 1,
        }),
        'HTTP',
      );
      expect(logger.logRequest).toHaveBeenCalledWith(
        'GET',
        '/api/produtores',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });

    it('should log business operations for non-GET requests', async () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/produtores';
      mockRequest.params = { id: 'new-id' };

      const responseData = { id: 'new-id', name: 'New Producer' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logBusinessOperation).toHaveBeenCalledWith('POST', 'produtor', 'new-id');
    });

    it('should not log business operations for GET requests', async () => {
      mockRequest.method = 'GET';

      const responseData = { id: 'test-id', name: 'Producer' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logBusinessOperation).not.toHaveBeenCalled();
    });

    it('should handle requests with empty body', async () => {
      mockRequest.body = {};

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          hasBody: false,
        }),
        'HTTP',
      );
    });

    it('should handle requests with no body', async () => {
      mockRequest.body = undefined;

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          hasBody: false,
        }),
        'HTTP',
      );
    });

    it('should handle requests with empty query and params', async () => {
      mockRequest.query = {};
      mockRequest.params = {};

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          queryParams: 0,
          pathParams: 0,
        }),
        'HTTP',
      );
    });

    it('should handle requests with undefined query and params', async () => {
      mockRequest.query = undefined;
      mockRequest.params = undefined;

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          queryParams: 0,
          pathParams: 0,
        }),
        'HTTP',
      );
    });

    it('should handle missing user-agent header', async () => {
      mockRequest.headers = {};

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          userAgent: '',
        }),
        'HTTP',
      );
    });

    it('should handle missing headers', async () => {
      mockRequest.headers = undefined;

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          userAgent: '',
        }),
        'HTTP',
      );
    });

    it('should use connection.remoteAddress when ip is not available', async () => {
      const mockRequestWithoutIp = {
        ...mockRequest,
        ip: undefined,
      };
      executionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutIp),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      });

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          ip: '192.168.1.1',
        }),
        'HTTP',
      );
    });

    it('should handle missing ip and connection', async () => {
      const mockRequestWithoutIpAndConnection = {
        ...mockRequest,
        ip: undefined,
        connection: undefined,
      };
      executionContext.switchToHttp = jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(mockRequestWithoutIpAndConnection),
        getResponse: jest.fn().mockReturnValue(mockResponse),
      });

      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logWithData).toHaveBeenCalledWith(
        'debug',
        'Request details',
        expect.objectContaining({
          ip: '',
        }),
        'HTTP',
      );
    });

    it('should log errors and rethrow them', async () => {
      const error = new Error('Test error');
      error['status'] = 400;
      (callHandler.handle as jest.Mock).mockReturnValue(throwError(error));

      await expect(
        interceptor.intercept(executionContext, callHandler).toPromise(),
      ).rejects.toThrow('Test error');

      expect(logger.logRequest).toHaveBeenCalledWith(
        'GET',
        '/api/produtores',
        400,
        expect.any(Number),
      );
      expect(logger.logError).toHaveBeenCalledWith(
        error,
        'HTTP Request Error',
        expect.objectContaining({
          method: 'GET',
          url: '/api/produtores',
          userAgent: 'test-agent',
          ip: '127.0.0.1',
          responseTime: expect.any(Number),
        }),
      );
    });

    it('should handle errors without status code', async () => {
      const error = new Error('Test error without status');
      (callHandler.handle as jest.Mock).mockReturnValue(throwError(error));

      await expect(
        interceptor.intercept(executionContext, callHandler).toPromise(),
      ).rejects.toThrow('Test error without status');

      expect(logger.logRequest).toHaveBeenCalledWith(
        'GET',
        '/api/produtores',
        500,
        expect.any(Number),
      );
    });

    it('should measure response time correctly', async () => {
      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      const logRequestCall = (logger.logRequest as jest.Mock).mock.calls[0];
      const responseTime = logRequestCall[3];
      expect(responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof responseTime).toBe('number');
    });
  });

  describe('extractEntityType', () => {
    it('should extract entity type from plural URLs ending with "es"', () => {
      const result = interceptor['extractEntityType']('/api/propriedades');
      expect(result).toBe('propriedad'); // propriedades -> propriedad
    });

    it('should extract entity type from plural URLs ending with "s"', () => {
      const result = interceptor['extractEntityType']('/api/produtores');
      expect(result).toBe('produtor');
    });

    it('should extract entity type from URLs without plural ending', () => {
      const result = interceptor['extractEntityType']('/api/dashboard');
      expect(result).toBe('dashboard');
    });

    it('should handle URLs with query parameters', () => {
      const result = interceptor['extractEntityType']('/api/produtores?page=1&limit=10');
      expect(result).toBe('produtor');
    });

    it('should handle deep URL paths', () => {
      const result = interceptor['extractEntityType']('/api/v1/produtores/123/propriedades');
      expect(result).toBe('propriedad');
    });

    it('should handle URLs with trailing slash', () => {
      const result = interceptor['extractEntityType']('/api/produtores/');
      expect(result).toBe('produtor'); // After filtering empty parts, 'produtores' is the last valid part
    });

    it('should handle empty URL', () => {
      const result = interceptor['extractEntityType']('');
      expect(result).toBe('');
    });

    it('should handle root URL', () => {
      const result = interceptor['extractEntityType']('/');
      expect(result).toBe('');
    });

    it('should handle single word URLs', () => {
      const result = interceptor['extractEntityType']('/health');
      expect(result).toBe('health');
    });

    it('should handle URLs with file extensions', () => {
      const result = interceptor['extractEntityType']('/api/exports.csv');
      expect(result).toBe('exports.csv');
    });
  });

  describe('extractEntityId', () => {
    it('should extract entity id from params', () => {
      const params = { id: 'test-id-123' };
      const result = interceptor['extractEntityId'](params);
      expect(result).toBe('test-id-123');
    });

    it('should return "unknown" when id is not present', () => {
      const params = { name: 'test' };
      const result = interceptor['extractEntityId'](params);
      expect(result).toBe('unknown');
    });

    it('should return "unknown" when params is undefined', () => {
      const result = interceptor['extractEntityId'](undefined);
      expect(result).toBe('unknown');
    });

    it('should return "unknown" when params is null', () => {
      const result = interceptor['extractEntityId'](null);
      expect(result).toBe('unknown');
    });

    it('should return "unknown" when params is empty object', () => {
      const result = interceptor['extractEntityId']({});
      expect(result).toBe('unknown');
    });

    it('should handle non-string id values', () => {
      const params = { id: 123 };
      const result = interceptor['extractEntityId'](params);
      expect(result).toBe(123);
    });
  });

  describe('integration with different HTTP methods', () => {
    it('should handle POST requests correctly', async () => {
      mockRequest.method = 'POST';
      mockRequest.url = '/api/produtores';

      const responseData = { id: 'new-id', name: 'New Producer' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logBusinessOperation).toHaveBeenCalledWith('POST', 'produtor', 'test-id');
    });

    it('should handle PUT requests correctly', async () => {
      mockRequest.method = 'PUT';
      mockRequest.url = '/api/produtores/123';

      const responseData = { id: '123', name: 'Updated Producer' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logBusinessOperation).toHaveBeenCalledWith('PUT', '123', 'test-id'); // 123 is the extracted entity type from URL
    });

    it('should handle DELETE requests correctly', async () => {
      mockRequest.method = 'DELETE';
      mockRequest.url = '/api/produtores/123';

      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logBusinessOperation).toHaveBeenCalledWith('DELETE', '123', 'test-id'); // 123 is the extracted entity type from URL
    });

    it('should handle PATCH requests correctly', async () => {
      mockRequest.method = 'PATCH';
      mockRequest.url = '/api/propriedades/456';

      const responseData = { id: '456', name: 'Patched Property' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(logger.logBusinessOperation).toHaveBeenCalledWith('PATCH', '456', 'test-id'); // 456 is the extracted entity type from URL
    });
  });

  describe('error scenarios', () => {
    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('Request timeout');
      timeoutError['code'] = 'ETIMEDOUT';
      (callHandler.handle as jest.Mock).mockReturnValue(throwError(timeoutError));

      await expect(
        interceptor.intercept(executionContext, callHandler).toPromise(),
      ).rejects.toThrow('Request timeout');

      expect(logger.logError).toHaveBeenCalledWith(
        timeoutError,
        'HTTP Request Error',
        expect.objectContaining({
          method: 'GET',
          url: '/api/produtores',
        }),
      );
    });

    it('should handle validation errors', async () => {
      const validationError = new Error('Validation failed');
      validationError['status'] = 422;
      (callHandler.handle as jest.Mock).mockReturnValue(throwError(validationError));

      await expect(
        interceptor.intercept(executionContext, callHandler).toPromise(),
      ).rejects.toThrow('Validation failed');

      expect(logger.logRequest).toHaveBeenCalledWith(
        'GET',
        '/api/produtores',
        422,
        expect.any(Number),
      );
    });
  });
});
