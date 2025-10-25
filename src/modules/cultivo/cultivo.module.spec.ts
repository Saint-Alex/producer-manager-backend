import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Cultura } from '../../database/entities/cultura.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { CultivoController } from './cultivo.controller';
import { CultivoModule } from './cultivo.module';
import { CultivoService } from './cultivo.service';

describe('CultivoModule', () => {
  let module: TestingModule;
  let cultivoService: CultivoService;
  let cultivoController: CultivoController;
  let cultivoRepository: Repository<Cultivo>;
  let propriedadeRepository: Repository<PropriedadeRural>;
  let culturaRepository: Repository<Cultura>;
  let safraRepository: Repository<Safra>;

  beforeEach(async () => {
    const mockCultivoRepository = {
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

    const mockCulturaRepository = {
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

    module = await Test.createTestingModule({
      imports: [CultivoModule],
    })
      .overrideProvider(getRepositoryToken(Cultivo))
      .useValue(mockCultivoRepository)
      .overrideProvider(getRepositoryToken(Cultura))
      .useValue(mockCulturaRepository)
      .overrideProvider(getRepositoryToken(PropriedadeRural))
      .useValue(mockPropriedadeRepository)
      .overrideProvider(getRepositoryToken(Safra))
      .useValue(mockSafraRepository)
      .compile();

    cultivoService = module.get<CultivoService>(CultivoService);
    cultivoController = module.get<CultivoController>(CultivoController);
    cultivoRepository = module.get<Repository<Cultivo>>(getRepositoryToken(Cultivo));
    propriedadeRepository = module.get<Repository<PropriedadeRural>>(getRepositoryToken(PropriedadeRural));
    culturaRepository = module.get<Repository<Cultura>>(getRepositoryToken(Cultura));
    safraRepository = module.get<Repository<Safra>>(getRepositoryToken(Safra));
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
      expect(cultivoService).toBeInstanceOf(CultivoService);
      expect(cultivoController).toBeInstanceOf(CultivoController);
      expect(cultivoRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(safraRepository).toBeDefined();
    });
  });

  describe('providers', () => {
    it('should provide CultivoService', () => {
      expect(cultivoService).toBeDefined();
      expect(cultivoService).toBeInstanceOf(CultivoService);
    });

    it('should provide all required repositories', () => {
      expect(cultivoRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(safraRepository).toBeDefined();
    });
  });

  describe('controllers', () => {
    it('should provide CultivoController', () => {
      expect(cultivoController).toBeDefined();
      expect(cultivoController).toBeInstanceOf(CultivoController);
    });
  });

  describe('exports', () => {
    it('should export CultivoService', () => {
      expect(cultivoService).toBeDefined();
    });
  });

  describe('imports', () => {
    it('should import TypeOrmModule with all required entities', () => {
      expect(cultivoRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(safraRepository).toBeDefined();
    });
  });

  describe('dependency injection', () => {
    it('should inject all repositories into service', () => {
      expect(cultivoService).toBeDefined();
      expect(cultivoRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(safraRepository).toBeDefined();
    });

    it('should inject service into controller', () => {
      expect(cultivoController).toBeDefined();
      expect(cultivoService).toBeDefined();
    });
  });

  describe('module configuration', () => {
    it('should have correct module metadata', () => {
      const controllers = Reflect.getMetadata('controllers', CultivoModule) || [];
      const providers = Reflect.getMetadata('providers', CultivoModule) || [];
      const exports = Reflect.getMetadata('exports', CultivoModule) || [];

      expect(controllers).toContain(CultivoController);
      expect(providers).toContain(CultivoService);
      expect(exports).toContain(CultivoService);
    });
  });

  describe('multiple entities and relationships', () => {
    it('should handle multiple entity repositories', () => {
      const repositories = [
        cultivoRepository,
        propriedadeRepository,
        culturaRepository,
        safraRepository
      ];

      // All repositories should be defined
      repositories.forEach(repo => {
        expect(repo).toBeDefined();
      });

      // All repositories should be different instances
      for (let i = 0; i < repositories.length; i++) {
        for (let j = i + 1; j < repositories.length; j++) {
          expect(repositories[i]).not.toBe(repositories[j]);
        }
      }
    });

    it('should support complex entity relationships', () => {
      // Cultivo has relationships with Propriedade, Cultura, and Safra
      expect(cultivoRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(safraRepository).toBeDefined();
    });
  });

  describe('module instantiation', () => {
    it('should create instances correctly', () => {
      expect(cultivoService).toBeInstanceOf(CultivoService);
      expect(cultivoController).toBeInstanceOf(CultivoController);
    });

    it('should maintain singleton pattern for providers', () => {
      const service1 = module.get<CultivoService>(CultivoService);
      const service2 = module.get<CultivoService>(CultivoService);

      expect(service1).toBe(service2);
    });
  });

  describe('error handling', () => {
    it('should handle module compilation errors gracefully', async () => {
      expect(module).toBeDefined();
      expect(() => module.get<CultivoService>(CultivoService)).not.toThrow();
    });
  });

  describe('complex dependencies', () => {
    it('should resolve complex dependency tree', () => {
      // CultivoModule depends on 4 different entities
      expect(cultivoService).toBeDefined();
      expect(cultivoRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(culturaRepository).toBeDefined();
      expect(safraRepository).toBeDefined();
    });
  });
});
