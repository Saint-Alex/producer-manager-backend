import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should be defined', () => {
      expect(appController).toBeDefined();
    });

    it('should return health check data', () => {
      const result = appController.getHealth();

      expect(result).toBeDefined();
      expect(result.message).toBe('Producer Manager API is running successfully!');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should call appService.getHealth', () => {
      const spy = jest.spyOn(appService, 'getHealth');
      appController.getHealth();
      expect(spy).toHaveBeenCalled();
    });

    it('should have proper constructor injection', () => {
      expect(appController['appService']).toBeDefined();
      expect(appController['appService']).toBeInstanceOf(AppService);
    });
  });

  describe('health check endpoint', () => {
    it('should return consistent structure', () => {
      const result1 = appController.getHealth();
      const result2 = appController.getHealth();

      expect(Object.keys(result1)).toEqual(['message', 'timestamp', 'version']);
      expect(Object.keys(result2)).toEqual(['message', 'timestamp', 'version']);
      expect(result1.message).toBe(result2.message);
      expect(result1.version).toBe(result2.version);
    });

    it('should return valid timestamp format', () => {
      const result = appController.getHealth();
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});
