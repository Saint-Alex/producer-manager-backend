import { ValidationPipe } from '@nestjs/common';

// Mock NestFactory
const mockApp = {
  get: jest.fn(),
  useLogger: jest.fn(),
  use: jest.fn(),
  useGlobalPipes: jest.fn(),
  enableCors: jest.fn(),
  setGlobalPrefix: jest.fn(),
  listen: jest.fn().mockResolvedValue(undefined),
  close: jest.fn().mockResolvedValue(undefined),
};

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue(mockApp),
  },
}));

// Mock SwaggerModule
jest.mock('@nestjs/swagger', () => ({
  DocumentBuilder: jest.fn().mockImplementation(() => ({
    setTitle: jest.fn().mockReturnThis(),
    setDescription: jest.fn().mockReturnThis(),
    setVersion: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({}),
  })),
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
}));

// Mock AppModule
jest.mock('./app.module', () => ({
  AppModule: class MockAppModule {},
}));

describe('Main Bootstrap', () => {
  let mockConfigService: any;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation();

    // Mock ConfigService
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === 'API_PREFIX') return 'api';
        if (key === 'SWAGGER_PATH') return 'api/docs';
        if (key === 'PORT') return 3001;
        return undefined;
      }),
    };

    // Mock AppLoggerService
    const mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    mockApp.get.mockImplementation((service: any) => {
      if (service.name === 'ConfigService') return mockConfigService;
      if (service.name === 'AppLoggerService') return mockLogger;
      return mockConfigService; // fallback
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should create and configure application', async () => {
    // Import main to trigger bootstrap
    await import('./main');

    // Give time for async bootstrap to complete
    await new Promise(resolve => setTimeout(resolve, 100));

    const { NestFactory } = require('@nestjs/core');
    const { SwaggerModule } = require('@nestjs/swagger');

    // Verify NestFactory.create was called
    expect(NestFactory.create).toHaveBeenCalled();

    // Verify app configuration
    expect(mockApp.get).toHaveBeenCalled();
    expect(mockApp.useLogger).toHaveBeenCalled();
    expect(mockApp.use).toHaveBeenCalled(); // helmet
    expect(mockApp.useGlobalPipes).toHaveBeenCalledWith(
      expect.any(ValidationPipe)
    );
    expect(mockApp.enableCors).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
      })
    );
    expect(mockApp.setGlobalPrefix).toHaveBeenCalledWith('api');

    // Verify Swagger setup
    expect(SwaggerModule.createDocument).toHaveBeenCalledWith(mockApp, {});
    expect(SwaggerModule.setup).toHaveBeenCalledWith('api/docs', mockApp, {});

    // Verify server start
    expect(mockApp.listen).toHaveBeenCalledWith(3001);
  });
});
