// Set up test environment variables before any imports
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.DATABASE_HOST = 'localhost';
process.env.DATABASE_PORT = '5432';
process.env.DATABASE_USERNAME = 'test';
process.env.DATABASE_PASSWORD = 'test';
process.env.DATABASE_NAME = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-32-chars-minimum';
process.env.LOG_LEVEL = 'error';
process.env.CORS_ORIGINS = 'http://localhost:3000';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

// Mock TypeORM to avoid database connection issues
jest.mock('@nestjs/typeorm', () => ({
  TypeOrmModule: {
    forRoot: jest.fn(() => ({
      module: class MockTypeOrmModule {},
      providers: [],
      exports: [],
    })),
    forFeature: jest.fn(() => ({
      module: class MockTypeOrmFeatureModule {},
      providers: [],
      exports: [],
    })),
  },
  InjectRepository: jest.fn(() => () => ({})),
}));

describe('AppModule', () => {
  let module: TestingModule;
  let configService: ConfigService;
  let appService: AppService;
  let appController: AppController;

  beforeEach(async () => {
    // Environment variables are already set at the top of the file

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    configService = module.get<ConfigService>(ConfigService);
    appService = module.get<AppService>(AppService);
    appController = module.get<AppController>(AppController);
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
    // Keep environment variables for other tests
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  describe('basic configuration', () => {
    it('should load environment configuration correctly', () => {
      expect(configService.get('NODE_ENV')).toBe('test');
      expect(configService.get('JWT_SECRET')).toBe(
        'test-jwt-secret-key-for-testing-32-chars-minimum',
      );
      expect(configService.get('LOG_LEVEL')).toBe('error');
    });

    it('should provide AppService', () => {
      expect(appService).toBeDefined();
      expect(appService).toBeInstanceOf(AppService);
    });

    it('should provide AppController', () => {
      expect(appController).toBeDefined();
      expect(appController).toBeInstanceOf(AppController);
    });
  });

  describe('JWT validation', () => {
    it('should have JWT_SECRET with minimum length', () => {
      const jwtSecret = configService.get('JWT_SECRET');
      expect(jwtSecret).toBeDefined();
      expect(jwtSecret.length).toBeGreaterThanOrEqual(32);
    });
  });
});
