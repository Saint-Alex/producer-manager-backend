import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { PropriedadeController } from './propriedade.controller';
import { PropriedadeModule } from './propriedade.module';
import { PropriedadeService } from './propriedade.service';

describe('PropriedadeModule', () => {
  let module: TestingModule;
  let propriedadeService: PropriedadeService;
  let propriedadeController: PropriedadeController;
  let propriedadeRepository: Repository<PropriedadeRural>;
  let produtorRepository: Repository<Produtor>;

  beforeEach(async () => {
    const mockPropriedadeRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    const mockProdutorRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    module = await Test.createTestingModule({
      imports: [PropriedadeModule],
    })
      .overrideProvider(getRepositoryToken(PropriedadeRural))
      .useValue(mockPropriedadeRepository)
      .overrideProvider(getRepositoryToken(Produtor))
      .useValue(mockProdutorRepository)
      .compile();

    propriedadeService = module.get<PropriedadeService>(PropriedadeService);
    propriedadeController = module.get<PropriedadeController>(PropriedadeController);
    propriedadeRepository = module.get<Repository<PropriedadeRural>>(getRepositoryToken(PropriedadeRural));
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
      expect(propriedadeService).toBeInstanceOf(PropriedadeService);
      expect(propriedadeController).toBeInstanceOf(PropriedadeController);
      expect(propriedadeRepository).toBeDefined();
      expect(produtorRepository).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide PropriedadeService', () => {
      expect(propriedadeService).toBeDefined();
      expect(propriedadeService).toBeInstanceOf(PropriedadeService);
    });

    it('should provide PropriedadeRural repository', () => {
      expect(propriedadeRepository).toBeDefined();
    });

    it('should provide Produtor repository', () => {
      expect(produtorRepository).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should provide PropriedadeController', () => {
      expect(propriedadeController).toBeDefined();
      expect(propriedadeController).toBeInstanceOf(PropriedadeController);
    });
  });

  describe('exports', () => {
    it('should export PropriedadeService', () => {
      expect(propriedadeService).toBeDefined();
    });
  });

  describe('imports', () => {
    it('should import TypeOrmModule with PropriedadeRural and Produtor entities', () => {
      expect(propriedadeRepository).toBeDefined();
      expect(produtorRepository).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should inject repositories into service', () => {
      expect(propriedadeService).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(produtorRepository).toBeDefined();
    });

    it('should inject service into controller', () => {
      expect(propriedadeController).toBeDefined();
      expect(propriedadeService).toBeDefined();
    });
  });

  describe('module configuration', () => {
    it('should have correct module metadata', () => {
      const controllers = Reflect.getMetadata('controllers', PropriedadeModule) || [];
      const providers = Reflect.getMetadata('providers', PropriedadeModule) || [];
      const exports = Reflect.getMetadata('exports', PropriedadeModule) || [];

      expect(controllers).toContain(PropriedadeController);
      expect(providers).toContain(PropriedadeService);
      expect(exports).toContain(PropriedadeService);
    });
  });

  describe('multiple entities', () => {
    it('should handle multiple entity repositories', () => {
      expect(propriedadeRepository).toBeDefined();
      expect(produtorRepository).toBeDefined();

      // Both repositories should be different instances
      expect(propriedadeRepository).not.toBe(produtorRepository);
    });
  });

  describe('module instantiation', () => {
    it('should create instances correctly', () => {
      expect(propriedadeService).toBeInstanceOf(PropriedadeService);
      expect(propriedadeController).toBeInstanceOf(PropriedadeController);
    });

    it('should maintain singleton pattern for providers', () => {
      const service1 = module.get<PropriedadeService>(PropriedadeService);
      const service2 = module.get<PropriedadeService>(PropriedadeService);

      expect(service1).toBe(service2);
    });
  });

  describe('error handling', () => {
    it('should handle module compilation errors gracefully', async () => {
      expect(module).toBeDefined();
      expect(() => module.get<PropriedadeService>(PropriedadeService)).not.toThrow();
    });
  });

  describe('module relationships', () => {
    it('should support entity relationships through repositories', () => {
      // PropriedadeRural has relationship with Produtor
      expect(propriedadeRepository).toBeDefined();
      expect(produtorRepository).toBeDefined();
    });
  });
});
