import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

describe('Metrics (e2e)', () => {
  let app: INestApplication;
  let metricsService: MetricsService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [MetricsController],
      providers: [MetricsService],
    }).compile();

    app = moduleFixture.createNestApplication();
    metricsService = moduleFixture.get<MetricsService>(MetricsService);

    await app.init();
  });

  afterEach(async () => {
    metricsService.reset();
    await app.close();
  });

  describe('/metrics (GET)', () => {
    it('should return initial metrics', () => {
      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('totalRequests', 0);
          expect(res.body).toHaveProperty('requestsByMethod', {});
          expect(res.body).toHaveProperty('requestsByStatus', {});
          expect(res.body).toHaveProperty('averageResponseTime', 0);
          expect(res.body).toHaveProperty('errorRate', 0);
          expect(res.body).toHaveProperty('lastRequest', null);
          expect(res.body).toHaveProperty('uptime');
          expect(res.body).toHaveProperty('memory');
          expect(res.body).toHaveProperty('environment');
          expect(res.body).toHaveProperty('version');
        });
    });

    it('should update metrics after requests', async () => {
      // Simulate some requests by calling the metrics service
      metricsService.recordRequest('GET', 200, 100);
      metricsService.recordRequest('POST', 201, 200);
      metricsService.recordRequest('GET', 404, 150);

      return request(app.getHttpServer())
        .get('/metrics')
        .expect(200)
        .expect((res) => {
          expect(res.body.totalRequests).toBe(3);
          expect(res.body.requestsByMethod).toEqual({
            GET: 2,
            POST: 1,
          });
          expect(res.body.requestsByStatus).toEqual({
            '200': 1,
            '201': 1,
            '404': 1,
          });
          expect(res.body.averageResponseTime).toBeCloseTo(150, 1);
          expect(res.body.errorRate).toBeCloseTo(33.33, 1);
          expect(res.body.lastRequest).not.toBeNull();
        });
    });
  });

  describe('/metrics/prometheus (GET)', () => {
    it('should return prometheus format metrics', () => {
      return request(app.getHttpServer())
        .get('/metrics/prometheus')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('data');
          expect(res.body).toHaveProperty('headers');
          expect(res.body.headers['Content-Type']).toBe('text/plain; version=0.0.4; charset=utf-8');

          const prometheusData = res.body.data;
          expect(prometheusData).toContain('# HELP http_requests_total');
          expect(prometheusData).toContain('# TYPE http_requests_total counter');
          expect(prometheusData).toContain('http_requests_total 0');
          expect(prometheusData).toContain('process_memory_usage_bytes');
          expect(prometheusData).toContain('process_uptime_seconds');
        });
    });

    it('should include recorded metrics in prometheus format', async () => {
      metricsService.recordRequest('GET', 200, 100);
      metricsService.recordRequest('POST', 500, 200);

      return request(app.getHttpServer())
        .get('/metrics/prometheus')
        .expect(200)
        .expect((res) => {
          const prometheusData = res.body.data;
          expect(prometheusData).toContain('http_requests_total 2');
          expect(prometheusData).toContain('http_requests_by_method_total{method="GET"} 1');
          expect(prometheusData).toContain('http_requests_by_method_total{method="POST"} 1');
          expect(prometheusData).toContain('http_requests_by_status_total{status="200"} 1');
          expect(prometheusData).toContain('http_requests_by_status_total{status="500"} 1');
        });
    });
  });

  describe('metrics response time', () => {
    it('should respond quickly to metrics requests', async () => {
      const startTime = Date.now();

      await request(app.getHttpServer()).get('/metrics').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(500); // Less than 500ms
    });
  });

  describe('metrics accuracy', () => {
    it('should maintain metric accuracy across multiple requests', async () => {
      // Record multiple requests
      for (let i = 0; i < 10; i++) {
        metricsService.recordRequest('GET', 200, 100 + i * 10);
      }

      const response = await request(app.getHttpServer()).get('/metrics').expect(200);

      expect(response.body.totalRequests).toBe(10);
      expect(response.body.requestsByMethod['GET']).toBe(10);
      expect(response.body.requestsByStatus['200']).toBe(10);
      expect(response.body.averageResponseTime).toBe(145); // Average of 100,110,120...190
      expect(response.body.errorRate).toBe(0);
    });
  });
});
