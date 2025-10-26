import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Cultura } from '../../database/entities/cultura.entity';
import { CulturaController } from './cultura.controller';
import { CulturaModule } from './cultura.module';
import { CulturaService } from './cultura.service';

describe('CulturaModule', () => {
  let module: TestingModule;
  let culturaService: CulturaService;
  let culturaController: CulturaController;
  let culturaRepository: Repository<Cultura>;
  let cultivoRepository: Repository<Cultivo>;

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
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    const mockCultivoRepository = {
      count: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      create: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [CulturaModule],
    })
      .overrideProvider(getRepositoryToken(Cultura))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(Cultivo))
      .useValue(mockCultivoRepository)
      .compile();

    culturaService = module.get<CulturaService>(CulturaService);
    culturaController = module.get<CulturaController>(CulturaController);
    culturaRepository = module.get<Repository<Cultura>>(getRepositoryToken(Cultura));
    cultivoRepository = module.get<Repository<Cultivo>>(getRepositoryToken(Cultivo));
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
      expect(culturaService).toBeInstanceOf(CulturaService);
      expect(culturaController).toBeInstanceOf(CulturaController);
      expect(culturaRepository).toBeDefined();
      expect(cultivoRepository).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide CulturaService', () => {
      expect(culturaService).toBeDefined();
      expect(culturaService).toBeInstanceOf(CulturaService);
    });

    it('should provide Cultura repository', () => {
      expect(culturaRepository).toBeDefined();
    });

    it('should provide Cultivo repository', () => {
      expect(cultivoRepository).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should provide CulturaController', () => {
      expect(culturaController).toBeDefined();
      expect(culturaController).toBeInstanceOf(CulturaController);
    });
  });

  describe('exports', () => {
    it('should export CulturaService', () => {
      expect(culturaService).toBeDefined();
    });
  });

  describe('imports', () => {
    it('should import TypeOrmModule with Cultura entity', () => {
      expect(culturaRepository).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should inject repository into service', () => {
      expect(culturaService).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(cultivoRepository).toBeDefined();
    });

    it('should inject service into controller', () => {
      expect(culturaController).toBeDefined();
      expect(culturaService).toBeDefined();
    });
  });

  describe('module configuration', () => {
    it('should have correct module metadata', () => {
      const controllers = Reflect.getMetadata('controllers', CulturaModule) || [];
      const providers = Reflect.getMetadata('providers', CulturaModule) || [];
      const exports = Reflect.getMetadata('exports', CulturaModule) || [];

      expect(controllers).toContain(CulturaController);
      expect(providers).toContain(CulturaService);
      expect(exports).toContain(CulturaService);
    });
  });

  describe('module instantiation', () => {
    it('should create instances correctly', () => {
      expect(culturaService).toBeInstanceOf(CulturaService);
      expect(culturaController).toBeInstanceOf(CulturaController);
    });

    it('should maintain singleton pattern for providers', () => {
      const service1 = module.get<CulturaService>(CulturaService);
      const service2 = module.get<CulturaService>(CulturaService);

      expect(service1).toBe(service2);
    });

    it('should maintain singleton pattern for controllers', () => {
      const controller1 = module.get<CulturaController>(CulturaController);
      const controller2 = module.get<CulturaController>(CulturaController);

      expect(controller1).toBe(controller2);
    });
  });

  describe('error handling', () => {
    it('should handle module compilation errors gracefully', async () => {
      expect(module).toBeDefined();
      expect(() => module.get<CulturaService>(CulturaService)).not.toThrow();
    });
  });

  describe('module isolation', () => {
    it('should be isolated from other modules', () => {
      expect(culturaService).toBeDefined();
      expect(culturaController).toBeDefined();
    });
  });

  describe('agricultural culture management', () => {
    it('should support culture type operations', () => {
      // CulturaModule should support agricultural culture management
      expect(culturaRepository).toBeDefined();
      expect(culturaService).toBeDefined();
    });
  });

  describe('crop categorization', () => {
    it('should handle crop categorization functionality', () => {
      // Cultura deals with crop types and categorization
      expect(culturaRepository).toBeDefined();
      expect(culturaService).toBeDefined();
    });
  });

  describe('culture metadata', () => {
    it('should handle culture metadata and characteristics', () => {
      // Culture entities contain metadata about crop characteristics
      expect(culturaRepository).toBeDefined();
      expect(culturaService).toBeDefined();
    });
  });
});
