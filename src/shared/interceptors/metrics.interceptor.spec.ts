import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { of, throwError } from 'rxjs';
import { MetricsService } from '../metrics/metrics.service';
import { MetricsInterceptor } from './metrics.interceptor';

describe('MetricsInterceptor', () => {
  let interceptor: MetricsInterceptor;
  let metricsService: MetricsService;
  let executionContext: ExecutionContext;
  let callHandler: CallHandler;
  let mockRequest: any;
  let mockResponse: any;

  beforeEach(async () => {
    const mockMetricsService = {
      recordRequest: jest.fn(),
      getMetrics: jest.fn(),
      reset: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MetricsInterceptor,
        {
          provide: MetricsService,
          useValue: mockMetricsService,
        },
      ],
    }).compile();

    interceptor = module.get<MetricsInterceptor>(MetricsInterceptor);
    metricsService = module.get<MetricsService>(MetricsService);

    // Mock request
    mockRequest = {
      method: 'GET',
      url: '/api/test',
      headers: {},
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
    it('should record metrics for successful requests', async () => {
      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });

    it('should record metrics for POST requests', async () => {
      mockRequest.method = 'POST';
      const responseData = { id: 'new-id', name: 'Created Resource' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'POST',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });

    it('should record metrics for PUT requests', async () => {
      mockRequest.method = 'PUT';
      const responseData = { id: 'updated-id', name: 'Updated Resource' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'PUT',
        200,
        expect.any(Number),
      );
    });

    it('should record metrics for DELETE requests', async () => {
      mockRequest.method = 'DELETE';
      mockResponse.statusCode = 204;
      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'DELETE',
        204,
        expect.any(Number),
      );
    });

    it('should record metrics for PATCH requests', async () => {
      mockRequest.method = 'PATCH';
      const responseData = { id: 'patched-id', name: 'Patched Resource' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'PATCH',
        200,
        expect.any(Number),
      );
    });

    it('should measure response time correctly', async () => {
      (callHandler.handle as jest.Mock).mockReturnValue(of({ message: 'success' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      const recordRequestCall = (metricsService.recordRequest as jest.Mock).mock.calls[0];
      const responseTime = recordRequestCall[2];
      
      expect(responseTime).toBeGreaterThanOrEqual(0);
      expect(typeof responseTime).toBe('number');
    });

    it('should handle different status codes', async () => {
      mockResponse.statusCode = 201;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 'created' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        201,
        expect.any(Number),
      );
    });

    it('should handle 400 status codes', async () => {
      mockResponse.statusCode = 400;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ error: 'Bad Request' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        400,
        expect.any(Number),
      );
    });

    it('should handle 404 status codes', async () => {
      mockResponse.statusCode = 404;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ error: 'Not Found' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        404,
        expect.any(Number),
      );
    });

    it('should handle 500 status codes', async () => {
      mockResponse.statusCode = 500;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ error: 'Internal Server Error' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        500,
        expect.any(Number),
      );
    });

    it('should not interfere with request processing when metrics service throws error', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const responseData = { message: 'success' };
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));
      (metricsService.recordRequest as jest.Mock).mockImplementation(() => {
        throw new Error('Metrics service error');
      });

      // Should not throw error, just process the request normally
      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(result).toEqual(responseData);
      expect(metricsService.recordRequest).toHaveBeenCalled();
      expect(consoleSpy).toHaveBeenCalledWith('Error recording metrics:', expect.any(Error));

      consoleSpy.mockRestore();
    });

    it('should pass through errors from the original request', async () => {
      const error = new Error('Original request error');
      (callHandler.handle as jest.Mock).mockReturnValue(throwError(error));

      await expect(interceptor.intercept(executionContext, callHandler).toPromise()).rejects.toThrow('Original request error');

      // Note: In this implementation, metrics are only recorded on success
      // If we want to record metrics on errors too, the interceptor would need a catchError operator
      expect(metricsService.recordRequest).not.toHaveBeenCalled();
    });

    it('should handle undefined response data', async () => {
      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toBeUndefined();
    });

    it('should handle null response data', async () => {
      (callHandler.handle as jest.Mock).mockReturnValue(of(null));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toBeNull();
    });

    it('should handle empty object response data', async () => {
      (callHandler.handle as jest.Mock).mockReturnValue(of({}));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toEqual({});
    });

    it('should handle array response data', async () => {
      const responseData = [{ id: 1 }, { id: 2 }, { id: 3 }];
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });

    it('should handle string response data', async () => {
      const responseData = 'Simple string response';
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });

    it('should handle numeric response data', async () => {
      const responseData = 42;
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });

    it('should handle boolean response data', async () => {
      const responseData = true;
      (callHandler.handle as jest.Mock).mockReturnValue(of(responseData));

      const result = await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        200,
        expect.any(Number),
      );
      expect(result).toEqual(responseData);
    });
  });

  describe('edge cases', () => {
    it('should handle requests with missing method', async () => {
      delete mockRequest.method;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ message: 'success' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        undefined,
        200,
        expect.any(Number),
      );
    });

    it('should handle response with missing statusCode', async () => {
      delete mockResponse.statusCode;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ message: 'success' }));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'GET',
        undefined,
        expect.any(Number),
      );
    });

    it('should handle unusual HTTP methods', async () => {
      mockRequest.method = 'OPTIONS';
      (callHandler.handle as jest.Mock).mockReturnValue(of({}));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'OPTIONS',
        200,
        expect.any(Number),
      );
    });

    it('should handle HEAD requests', async () => {
      mockRequest.method = 'HEAD';
      mockResponse.statusCode = 200;
      (callHandler.handle as jest.Mock).mockReturnValue(of(undefined));

      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledWith(
        'HEAD',
        200,
        expect.any(Number),
      );
    });
  });

  describe('integration scenarios', () => {
    it('should record multiple requests independently', async () => {
      // First request
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 1 }));
      await interceptor.intercept(executionContext, callHandler).toPromise();

      // Second request with different method and status
      mockRequest.method = 'POST';
      mockResponse.statusCode = 201;
      (callHandler.handle as jest.Mock).mockReturnValue(of({ id: 2 }));
      await interceptor.intercept(executionContext, callHandler).toPromise();

      expect(metricsService.recordRequest).toHaveBeenCalledTimes(2);
      expect(metricsService.recordRequest).toHaveBeenNthCalledWith(1, 'GET', 200, expect.any(Number));
      expect(metricsService.recordRequest).toHaveBeenNthCalledWith(2, 'POST', 201, expect.any(Number));
    });

    it('should handle concurrent requests', async () => {
      const request1 = of({ id: 1 });
      const request2 = of({ id: 2 });
      
      (callHandler.handle as jest.Mock)
        .mockReturnValueOnce(request1)
        .mockReturnValueOnce(request2);

      const promise1 = interceptor.intercept(executionContext, callHandler).toPromise();
      const promise2 = interceptor.intercept(executionContext, callHandler).toPromise();

      await Promise.all([promise1, promise2]);

      expect(metricsService.recordRequest).toHaveBeenCalledTimes(2);
    });
  });
});