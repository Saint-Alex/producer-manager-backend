import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getInfo() {
    return {
      name: 'Producer Manager API',
      version: '1.0.0',
      description: 'Brain Agriculture - Producer Management System API',
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
    };
  }

  // Manter método antigo para compatibilidade
  getHealth(): { message: string; timestamp: string; version: string } {
    return {
      message: 'Producer Manager API is running successfully!',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
