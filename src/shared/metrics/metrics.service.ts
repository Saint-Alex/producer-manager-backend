import { Injectable } from '@nestjs/common';

interface RequestMetrics {
  totalRequests: number;
  requestsByMethod: Record<string, number>;
  requestsByStatus: Record<string, number>;
  averageResponseTime: number;
  errorRate: number;
  lastRequest: Date | null;
}

interface ResponseTimeData {
  sum: number;
  count: number;
}

@Injectable()
export class MetricsService {
  private metrics: RequestMetrics = {
    totalRequests: 0,
    requestsByMethod: {},
    requestsByStatus: {},
    averageResponseTime: 0,
    errorRate: 0,
    lastRequest: null,
  };

  private responseTimeData: ResponseTimeData = {
    sum: 0,
    count: 0,
  };

  recordRequest(method: string, statusCode: number, responseTime: number) {
    // Incrementar contadores
    this.metrics.totalRequests++;
    this.metrics.requestsByMethod[method] = (this.metrics.requestsByMethod[method] || 0) + 1;
    this.metrics.requestsByStatus[statusCode] = (this.metrics.requestsByStatus[statusCode] || 0) + 1;

    // Atualizar tempo de resposta médio
    this.responseTimeData.sum += responseTime;
    this.responseTimeData.count++;
    this.metrics.averageResponseTime = this.responseTimeData.sum / this.responseTimeData.count;

    // Calcular taxa de erro (4xx e 5xx)
    const errorRequests = Object.keys(this.metrics.requestsByStatus)
      .filter(status => parseInt(status) >= 400)
      .reduce((sum, status) => sum + this.metrics.requestsByStatus[status], 0);

    this.metrics.errorRate = (errorRequests / this.metrics.totalRequests) * 100;

    // Última requisição
    this.metrics.lastRequest = new Date();
  }

  getMetrics(): RequestMetrics & {
    uptime: number;
    memory: NodeJS.MemoryUsage;
    environment: string;
    version: string;
  } {
    return {
      ...this.metrics,
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
    };
  }

  // Formato Prometheus-like para futuras integrações
  getPrometheusMetrics(): string {
    const lines: string[] = [];

    // Total requests
    lines.push(`# HELP http_requests_total Total number of HTTP requests`);
    lines.push(`# TYPE http_requests_total counter`);
    lines.push(`http_requests_total ${this.metrics.totalRequests}`);

    // Requests by method
    lines.push(`# HELP http_requests_by_method_total Requests by HTTP method`);
    lines.push(`# TYPE http_requests_by_method_total counter`);
    Object.entries(this.metrics.requestsByMethod).forEach(([method, count]) => {
      lines.push(`http_requests_by_method_total{method="${method}"} ${count}`);
    });

    // Requests by status
    lines.push(`# HELP http_requests_by_status_total Requests by status code`);
    lines.push(`# TYPE http_requests_by_status_total counter`);
    Object.entries(this.metrics.requestsByStatus).forEach(([status, count]) => {
      lines.push(`http_requests_by_status_total{status="${status}"} ${count}`);
    });

    // Average response time
    lines.push(`# HELP http_request_duration_ms Average request duration in milliseconds`);
    lines.push(`# TYPE http_request_duration_ms gauge`);
    lines.push(`http_request_duration_ms ${this.metrics.averageResponseTime.toFixed(2)}`);

    // Error rate
    lines.push(`# HELP http_error_rate_percent Error rate percentage`);
    lines.push(`# TYPE http_error_rate_percent gauge`);
    lines.push(`http_error_rate_percent ${this.metrics.errorRate.toFixed(2)}`);

    // Memory usage
    const memory = process.memoryUsage();
    lines.push(`# HELP process_memory_usage_bytes Memory usage in bytes`);
    lines.push(`# TYPE process_memory_usage_bytes gauge`);
    lines.push(`process_memory_usage_bytes{type="rss"} ${memory.rss}`);
    lines.push(`process_memory_usage_bytes{type="heapTotal"} ${memory.heapTotal}`);
    lines.push(`process_memory_usage_bytes{type="heapUsed"} ${memory.heapUsed}`);

    // Uptime
    lines.push(`# HELP process_uptime_seconds Process uptime in seconds`);
    lines.push(`# TYPE process_uptime_seconds gauge`);
    lines.push(`process_uptime_seconds ${process.uptime()}`);

    return lines.join('\n') + '\n';
  }

  reset() {
    this.metrics = {
      totalRequests: 0,
      requestsByMethod: {},
      requestsByStatus: {},
      averageResponseTime: 0,
      errorRate: 0,
      lastRequest: null,
    };

    this.responseTimeData = {
      sum: 0,
      count: 0,
    };
  }
}
