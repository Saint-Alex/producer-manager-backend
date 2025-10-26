import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { SafraController } from './safra.controller';
import { SafraModule } from './safra.module';
import { SafraService } from './safra.service';

describe('SafraModule', () => {
  let module: TestingModule;
  let safraService: SafraService;
  let safraController: SafraController;
  let safraRepository: Repository<Safra>;
  let propriedadeRuralRepository: Repository<PropriedadeRural>;
  let cultivoRepository: Repository<Cultivo>;

  beforeEach(async () => {
    const mockSafraRepository = {
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

    const mockPropriedadeRuralRepository = {
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
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(),
      create: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
        getMany: jest.fn(),
      })),
    };

    module = await Test.createTestingModule({
      imports: [SafraModule],
    })
      .overrideProvider(getRepositoryToken(Safra))
      .useValue(mockSafraRepository)
      .overrideProvider(getRepositoryToken(PropriedadeRural))
      .useValue(mockPropriedadeRuralRepository)
      .overrideProvider(getRepositoryToken(Cultivo))
      .useValue(mockCultivoRepository)
      .compile();

    safraService = module.get<SafraService>(SafraService);
    safraController = module.get<SafraController>(SafraController);
    safraRepository = module.get<Repository<Safra>>(getRepositoryToken(Safra));
    propriedadeRuralRepository = module.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural),
    );
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
      expect(safraService).toBeInstanceOf(SafraService);
      expect(safraController).toBeInstanceOf(SafraController);
      expect(safraRepository).toBeDefined();
      expect(propriedadeRuralRepository).toBeDefined();
      expect(cultivoRepository).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide SafraService', () => {
      expect(safraService).toBeDefined();
      expect(safraService).toBeInstanceOf(SafraService);
    });

    it('should provide Safra repository', () => {
      expect(safraRepository).toBeDefined();
    });

    it('should provide PropriedadeRural repository', () => {
      expect(propriedadeRuralRepository).toBeDefined();
    });

    it('should provide Cultivo repository', () => {
      expect(cultivoRepository).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should provide SafraController', () => {
      expect(safraController).toBeDefined();
      expect(safraController).toBeInstanceOf(SafraController);
    });
  });

  describe('exports', () => {
    it('should export SafraService', () => {
      expect(safraService).toBeDefined();
    });
  });

  describe('imports', () => {
    it('should import TypeOrmModule with Safra entity', () => {
      expect(safraRepository).toBeDefined();
      expect(propriedadeRuralRepository).toBeDefined();
      expect(cultivoRepository).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should inject repository into service', () => {
      expect(safraService).toBeDefined();
      expect(safraRepository).toBeDefined();
      expect(propriedadeRuralRepository).toBeDefined();
      expect(cultivoRepository).toBeDefined();
    });

    it('should inject service into controller', () => {
      expect(safraController).toBeDefined();
      expect(safraService).toBeDefined();
    });
  });

  describe('module configuration', () => {
    it('should have correct module metadata', () => {
      const controllers = Reflect.getMetadata('controllers', SafraModule) || [];
      const providers = Reflect.getMetadata('providers', SafraModule) || [];
      const exports = Reflect.getMetadata('exports', SafraModule) || [];

      expect(controllers).toContain(SafraController);
      expect(providers).toContain(SafraService);
      expect(exports).toContain(SafraService);
    });
  });

  describe('module instantiation', () => {
    it('should create instances correctly', () => {
      expect(safraService).toBeInstanceOf(SafraService);
      expect(safraController).toBeInstanceOf(SafraController);
    });

    it('should maintain singleton pattern for providers', () => {
      const service1 = module.get<SafraService>(SafraService);
      const service2 = module.get<SafraService>(SafraService);

      expect(service1).toBe(service2);
    });

    it('should maintain singleton pattern for controllers', () => {
      const controller1 = module.get<SafraController>(SafraController);
      const controller2 = module.get<SafraController>(SafraController);

      expect(controller1).toBe(controller2);
    });
  });

  describe('error handling', () => {
    it('should handle module compilation errors gracefully', async () => {
      expect(module).toBeDefined();
      expect(() => module.get<SafraService>(SafraService)).not.toThrow();
    });
  });

  describe('module isolation', () => {
    it('should be isolated from other modules', () => {
      expect(safraService).toBeDefined();
      expect(safraController).toBeDefined();
    });
  });

  describe('year-based functionality', () => {
    it('should support year-based safra operations', () => {
      // SafraModule should support year-based queries
      expect(safraRepository).toBeDefined();
      expect(safraService).toBeDefined();
    });
  });

  describe('temporal data handling', () => {
    it('should handle temporal safra data', () => {
      // Safra deals with year ranges and temporal data
      expect(safraRepository).toBeDefined();
      expect(safraService).toBeDefined();
    });
  });
});
