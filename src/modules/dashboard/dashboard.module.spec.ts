import { Test, TestingModule } from '@nestjs/testing';
import { DashboardModule } from './dashboard.module';

describe('DashboardModule (Empty)', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [DashboardModule],
    }).compile();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should compile the module successfully', async () => {
    expect(module).toBeInstanceOf(TestingModule);
  });

  it('should have empty providers array', () => {
    const providers = Reflect.getMetadata('providers', DashboardModule) || [];
    expect(providers).toEqual([]);
  });

  it('should have empty controllers array', () => {
    const controllers = Reflect.getMetadata('controllers', DashboardModule) || [];
    expect(controllers).toEqual([]);
  });

  it('should create instance correctly', () => {
    const dashboardModule = new DashboardModule();
    expect(dashboardModule).toBeInstanceOf(DashboardModule);
  });
});
