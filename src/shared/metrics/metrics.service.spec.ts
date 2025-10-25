import { Test, TestingModule } from '@nestjs/testing';
import { MetricsService } from './metrics.service';

describe('MetricsService', () => {
  let service: MetricsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MetricsService],
    }).compile();

    service = module.get<MetricsService>(MetricsService);
  });

  afterEach(() => {
    service.reset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('recordRequest', () => {
    it('should record request metrics correctly', () => {
      service.recordRequest('GET', 200, 150);

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(1);
      expect(metrics.requestsByMethod['GET']).toBe(1);
      expect(metrics.requestsByStatus['200']).toBe(1);
      expect(metrics.averageResponseTime).toBe(150);
      expect(metrics.errorRate).toBe(0);
    });

    it('should calculate error rate correctly', () => {
      service.recordRequest('GET', 200, 100);
      service.recordRequest('POST', 400, 200);
      service.recordRequest('PUT', 500, 300);

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(3);
      expect(metrics.errorRate).toBeCloseTo(66.67, 1); // 2 errors out of 3 requests
    });

    it('should calculate average response time correctly', () => {
      service.recordRequest('GET', 200, 100);
      service.recordRequest('POST', 201, 200);
      service.recordRequest('PUT', 202, 300);

      const metrics = service.getMetrics();
      expect(metrics.averageResponseTime).toBe(200); // (100 + 200 + 300) / 3
    });

    it('should update last request timestamp', () => {
      const beforeTime = new Date();
      service.recordRequest('GET', 200, 100);
      const afterTime = new Date();

      const metrics = service.getMetrics();
      expect(metrics.lastRequest).toBeInstanceOf(Date);
      expect(metrics.lastRequest!.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(metrics.lastRequest!.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });
  });

  describe('getPrometheusMetrics', () => {
    it('should return metrics in Prometheus format', () => {
      service.recordRequest('GET', 200, 100);
      service.recordRequest('POST', 201, 200);

      const prometheusMetrics = service.getPrometheusMetrics();

      expect(prometheusMetrics).toContain('http_requests_total 2');
      expect(prometheusMetrics).toContain('http_requests_by_method_total{method="GET"} 1');
      expect(prometheusMetrics).toContain('http_requests_by_method_total{method="POST"} 1');
      expect(prometheusMetrics).toContain('http_requests_by_status_total{status="200"} 1');
      expect(prometheusMetrics).toContain('http_requests_by_status_total{status="201"} 1');
    });

    it('should include memory and uptime metrics', () => {
      const prometheusMetrics = service.getPrometheusMetrics();

      expect(prometheusMetrics).toContain('process_memory_usage_bytes{type="rss"}');
      expect(prometheusMetrics).toContain('process_memory_usage_bytes{type="heapTotal"}');
      expect(prometheusMetrics).toContain('process_memory_usage_bytes{type="heapUsed"}');
      expect(prometheusMetrics).toContain('process_uptime_seconds');
    });
  });

  describe('reset', () => {
    it('should reset all metrics to initial state', () => {
      service.recordRequest('GET', 200, 100);
      service.recordRequest('POST', 404, 200);

      service.reset();

      const metrics = service.getMetrics();
      expect(metrics.totalRequests).toBe(0);
      expect(metrics.requestsByMethod).toEqual({});
      expect(metrics.requestsByStatus).toEqual({});
      expect(metrics.averageResponseTime).toBe(0);
      expect(metrics.errorRate).toBe(0);
      expect(metrics.lastRequest).toBeNull();
    });
  });
});
