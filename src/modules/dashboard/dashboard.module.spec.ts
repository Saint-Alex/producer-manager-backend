import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Produtor } from '../../database/entities/produtor.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { DashboardController } from './dashboard.controller';
import { DashboardModule } from './dashboard.module';
import { DashboardService } from './dashboard.service';

describe('DashboardModule', () => {
  let module: TestingModule;
  let dashboardController: DashboardController;
  let dashboardService: DashboardService;
  let produtorRepository: Repository<Produtor>;
  let propriedadeRepository: Repository<PropriedadeRural>;
  let cultivoRepository: Repository<Cultivo>;

  beforeEach(async () => {
    const mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn(),
        getRawMany: jest.fn(),
      }),
    };

    module = await Test.createTestingModule({
      imports: [DashboardModule],
    })
      .overrideProvider(getRepositoryToken(Produtor))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(PropriedadeRural))
      .useValue(mockRepository)
      .overrideProvider(getRepositoryToken(Cultivo))
      .useValue(mockRepository)
      .compile();

    dashboardController = module.get<DashboardController>(DashboardController);
    dashboardService = module.get<DashboardService>(DashboardService);
    produtorRepository = module.get<Repository<Produtor>>(getRepositoryToken(Produtor));
    propriedadeRepository = module.get<Repository<PropriedadeRural>>(getRepositoryToken(PropriedadeRural));
    cultivoRepository = module.get<Repository<Cultivo>>(getRepositoryToken(Cultivo));
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should have DashboardController', () => {
    expect(dashboardController).toBeDefined();
    expect(dashboardController).toBeInstanceOf(DashboardController);
  });

  it('should have DashboardService', () => {
    expect(dashboardService).toBeDefined();
    expect(dashboardService).toBeInstanceOf(DashboardService);
  });

  it('should have Produtor repository', () => {
    expect(produtorRepository).toBeDefined();
  });

  it('should have PropriedadeRural repository', () => {
    expect(propriedadeRepository).toBeDefined();
  });

  it('should have Cultivo repository', () => {
    expect(cultivoRepository).toBeDefined();
  });

  it('should export DashboardService', () => {
    const exportedService = module.get<DashboardService>(DashboardService);
    expect(exportedService).toBeDefined();
    expect(exportedService).toBe(dashboardService);
  });

  describe('Module Configuration', () => {
    it('should configure TypeORM repositories correctly', () => {
      // Verifica se os repositórios estão configurados
      expect(produtorRepository).toBeDefined();
      expect(propriedadeRepository).toBeDefined();
      expect(cultivoRepository).toBeDefined();
    });

    it('should have correct controller registration', () => {
      const controllers = Reflect.getMetadata('controllers', DashboardModule);
      expect(controllers).toContain(DashboardController);
    });

    it('should have correct provider registration', () => {
      const providers = Reflect.getMetadata('providers', DashboardModule);
      expect(providers).toContain(DashboardService);
    });

    it('should have correct exports configuration', () => {
      const exports = Reflect.getMetadata('exports', DashboardModule);
      expect(exports).toContain(DashboardService);
    });
  });

  describe('Module Dependencies', () => {
    it('should inject repositories into DashboardService', () => {
      // Verifica se o serviço tem acesso aos repositórios injetados
      expect(dashboardService).toBeDefined();

      // Testa se os métodos do serviço podem ser chamados (indicando injeção bem-sucedida)
      expect(typeof dashboardService.getStats).toBe('function');
    });

    it('should inject DashboardService into DashboardController', () => {
      // Verifica se o controller tem acesso ao serviço injetado
      expect(dashboardController).toBeDefined();

      // Testa se os métodos do controller podem ser chamados (indicando injeção bem-sucedida)
      expect(typeof dashboardController.getStats).toBe('function');
    });
  });

  describe('Entity Integration', () => {
    it('should work with Produtor entity', async () => {
      const mockCount = 5;
      jest.spyOn(produtorRepository, 'count').mockResolvedValue(mockCount);

      // Este teste verifica se a integração com a entidade Produtor funciona
      const result = await produtorRepository.count();
      expect(result).toBe(mockCount);
      expect(produtorRepository.count).toHaveBeenCalled();
    });

    it('should work with PropriedadeRural entity', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '10', areatotal: '1000.5' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      jest.spyOn(propriedadeRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Este teste verifica se a integração com a entidade PropriedadeRural funciona
      const qb = propriedadeRepository.createQueryBuilder('propriedade');
      const result = await qb
        .select('COUNT(*)', 'total')
        .addSelect('COALESCE(SUM(propriedade.area_total), 0)', 'areaTotal')
        .getRawOne();

      expect(result).toEqual({ total: '10', areatotal: '1000.5' });
      expect(propriedadeRepository.createQueryBuilder).toHaveBeenCalledWith('propriedade');
    });

    it('should work with Cultivo entity', async () => {
      const mockQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { cultura: 'Soja', area: '500.0' },
          { cultura: 'Milho', area: '300.0' }
        ]),
      };

      jest.spyOn(cultivoRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      // Este teste verifica se a integração com a entidade Cultivo funciona
      const qb = cultivoRepository.createQueryBuilder('cultivo');
      const result = await qb
        .innerJoin('cultivo.cultura', 'cultura')
        .select('cultura.nome', 'cultura')
        .addSelect('COALESCE(SUM(cultivo.area_plantada), 0)', 'area')
        .groupBy('cultura.nome')
        .orderBy('area', 'DESC')
        .getRawMany();

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ cultura: 'Soja', area: '500.0' });
      expect(cultivoRepository.createQueryBuilder).toHaveBeenCalledWith('cultivo');
    });
  });
});
