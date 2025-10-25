import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(() => {
    service = new AppService();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getHealth', () => {
    it('should return health check data', () => {
      const result = service.getHealth();

      expect(result).toBeDefined();
      expect(result.message).toBe('Producer Manager API is running successfully!');
      expect(result.timestamp).toBeDefined();
      expect(result.version).toBe('1.0.0');
    });

    it('should return object with correct structure', () => {
      const result = service.getHealth();

      expect(typeof result).toBe('object');
      expect(Object.keys(result)).toEqual(['message', 'timestamp', 'version']);
    });

    it('should return valid ISO timestamp', () => {
      const result = service.getHealth();
      const timestamp = new Date(result.timestamp);

      expect(timestamp).toBeInstanceOf(Date);
      expect(timestamp.getTime()).not.toBeNaN();
      expect(result.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should return consistent message and version', () => {
      const result1 = service.getHealth();
      const result2 = service.getHealth();

      expect(result1.message).toBe(result2.message);
      expect(result1.version).toBe(result2.version);
    });

    it('should return current timestamp on each call', () => {
      const result1 = service.getHealth();

      // Small delay to ensure different timestamps
      const start = Date.now();
      while (Date.now() - start < 1) {
        // Wait for at least 1ms
      }

      const result2 = service.getHealth();

      expect(result1.timestamp).not.toBe(result2.timestamp);
    });

    it('should return string values for all properties', () => {
      const result = service.getHealth();

      expect(typeof result.message).toBe('string');
      expect(typeof result.timestamp).toBe('string');
      expect(typeof result.version).toBe('string');
    });
  });
});
