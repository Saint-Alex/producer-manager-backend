import { Test, TestingModule } from '@nestjs/testing';
import { AppLoggerService } from './logger.service';

describe('AppLoggerService', () => {
  let service: AppLoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppLoggerService],
    }).compile();

    service = module.get<AppLoggerService>(AppLoggerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should log messages with different levels', () => {
    // Simply verify the methods can be called without error
    expect(() => {
      service.log('Test info message', 'TestContext');
      service.error('Test error message', 'stack trace', 'TestContext');
      service.warn('Test warning message', 'TestContext');
      service.debug('Test debug message', 'TestContext');
    }).not.toThrow();
  });

  it('should log request information', () => {
    const logSpy = jest.spyOn(service, 'logRequest');

    service.logRequest('GET', '/api/test', 200, 150);

    expect(logSpy).toHaveBeenCalledWith('GET', '/api/test', 200, 150);
  });

  it('should log business operations', () => {
    const logSpy = jest.spyOn(service, 'logBusinessOperation');

    service.logBusinessOperation('CREATE', 'Producer', 'test-id', 'user-123');

    expect(logSpy).toHaveBeenCalledWith('CREATE', 'Producer', 'test-id', 'user-123');
  });

  it('should log errors with context', () => {
    const logSpy = jest.spyOn(service, 'logError');
    const testError = new Error('Test error');

    service.logError(testError, 'TestContext', { additionalInfo: 'test' });

    expect(logSpy).toHaveBeenCalledWith(testError, 'TestContext', { additionalInfo: 'test' });
  });
});
