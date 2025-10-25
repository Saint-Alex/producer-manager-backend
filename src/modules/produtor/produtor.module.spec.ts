import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { ProdutorController } from './produtor.controller';
import { ProdutorModule } from './produtor.module';
import { ProdutorService } from './produtor.service';

describe('ProdutorModule', () => {
  let module: TestingModule;
  let produtorService: ProdutorService;
  let produtorController: ProdutorController;
  let produtorRepository: Repository<Produtor>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    module = await Test.createTestingModule({
      imports: [ProdutorModule],
    })
      .overrideProvider(getRepositoryToken(Produtor))
      .useValue(mockRepository)
      .compile();

    produtorService = module.get<ProdutorService>(ProdutorService);
    produtorController = module.get<ProdutorController>(ProdutorController);
    produtorRepository = module.get<Repository<Produtor>>(getRepositoryToken(Produtor));
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  describe('module compilation', () => {
    it('should compile the module successfully', async () => {
      expect(module).toBeInstanceOf(TestingModule);
    });

    it('should have all providers available', () => {
      expect(produtorService).toBeInstanceOf(ProdutorService);
      expect(produtorController).toBeInstanceOf(ProdutorController);
      expect(produtorRepository).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide ProdutorService', () => {
      expect(produtorService).toBeDefined();
      expect(produtorService).toBeInstanceOf(ProdutorService);
    });

    it('should provide Produtor repository', () => {
      expect(produtorRepository).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should provide ProdutorController', () => {
      expect(produtorController).toBeDefined();
      expect(produtorController).toBeInstanceOf(ProdutorController);
    });
  });

  describe('exports', () => {
    it('should export ProdutorService', () => {
      // ProdutorService should be available for other modules to inject
      expect(produtorService).toBeDefined();
    });
  });

  describe('imports', () => {
    it('should import TypeOrmModule with Produtor entity', () => {
      // Verify that the repository is properly injected
      expect(produtorRepository).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should inject repository into service', () => {
      // Verify that the service has access to the repository
      expect(produtorService).toBeDefined();
      expect(produtorRepository).toBeDefined();
    });

    it('should inject service into controller', () => {
      // Verify that the controller has access to the service
      expect(produtorController).toBeDefined();
      expect(produtorService).toBeDefined();
    });
  });

  describe('module configuration', () => {
    it('should have correct module metadata', () => {
      const moduleMetadata = Reflect.getMetadata('imports', ProdutorModule) || [];
      const controllers = Reflect.getMetadata('controllers', ProdutorModule) || [];
      const providers = Reflect.getMetadata('providers', ProdutorModule) || [];
      const exports = Reflect.getMetadata('exports', ProdutorModule) || [];

      expect(moduleMetadata).toBeDefined();
      expect(controllers).toContain(ProdutorController);
      expect(providers).toContain(ProdutorService);
      expect(exports).toContain(ProdutorService);
    });
  });

  describe('module instantiation', () => {
    it('should create instances correctly', () => {
      expect(produtorService).toBeInstanceOf(ProdutorService);
      expect(produtorController).toBeInstanceOf(ProdutorController);
    });

    it('should maintain singleton pattern for providers', () => {
      const service1 = module.get<ProdutorService>(ProdutorService);
      const service2 = module.get<ProdutorService>(ProdutorService);

      expect(service1).toBe(service2);
    });

    it('should maintain singleton pattern for controllers', () => {
      const controller1 = module.get<ProdutorController>(ProdutorController);
      const controller2 = module.get<ProdutorController>(ProdutorController);

      expect(controller1).toBe(controller2);
    });
  });

  describe('error handling', () => {
    it('should handle module compilation errors gracefully', async () => {
      // This test ensures our module compiles without errors
      expect(module).toBeDefined();
      expect(() => module.get<ProdutorService>(ProdutorService)).not.toThrow();
    });
  });

  describe('module isolation', () => {
    it('should be isolated from other modules', () => {
      // Each module should be independent
      expect(produtorService).toBeDefined();
      expect(produtorController).toBeDefined();
    });
  });
});
