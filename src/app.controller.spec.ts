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

    it('should return app info data', () => {
      const result = appController.getInfo();

      expect(result).toBeDefined();
      expect(result.name).toBe('Producer Manager API');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBe('1.0.0');
      expect(typeof result.timestamp).toBe('string');
    });

    it('should call appService.getInfo', () => {
      const spy = jest.spyOn(appService, 'getInfo');
      appController.getInfo();
      expect(spy).toHaveBeenCalled();
    });

    it('should have proper constructor injection', () => {
      expect(appController['appService']).toBeDefined();
      expect(appController['appService']).toBeInstanceOf(AppService);
    });
  });

  describe('app info endpoint', () => {
    it('should return consistent structure', () => {
      const result1 = appController.getInfo();
      const result2 = appController.getInfo();

      expect(Object.keys(result1).sort()).toEqual(
        ['name', 'version', 'description', 'environment', 'timestamp'].sort(),
      );
      expect(Object.keys(result2).sort()).toEqual(
        ['name', 'version', 'description', 'environment', 'timestamp'].sort(),
      );
      expect(result1.name).toBe(result2.name);
      expect(result1.version).toBe(result2.version);
    });

    it('should return valid timestamp format', () => {
      const result = appController.getInfo();
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
    });
  });
});
