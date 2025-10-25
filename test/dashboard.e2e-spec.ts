import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Cultivo } from '../src/database/entities/cultivo.entity';
import { Produtor } from '../src/database/entities/produtor.entity';
import { PropriedadeRural } from '../src/database/entities/propriedade-rural.entity';
import { DashboardController } from '../src/modules/dashboard/dashboard.controller';
import { DashboardService } from '../src/modules/dashboard/dashboard.service';

describe('DashboardController (e2e)', () => {
  let app: INestApplication;
  let produtorRepository: Repository<Produtor>;
  let propriedadeRepository: Repository<PropriedadeRural>;
  let cultivoRepository: Repository<Cultivo>;

  const mockProdutorRepository = {
    count: jest.fn(),
  };

  const mockPropriedadeRepository = {
    createQueryBuilder: jest.fn(),
  };

  const mockCultivoRepository = {
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        DashboardService,
        {
          provide: getRepositoryToken(Produtor),
          useValue: mockProdutorRepository,
        },
        {
          provide: getRepositoryToken(PropriedadeRural),
          useValue: mockPropriedadeRepository,
        },
        {
          provide: getRepositoryToken(Cultivo),
          useValue: mockCultivoRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    produtorRepository = moduleFixture.get<Repository<Produtor>>(
      getRepositoryToken(Produtor)
    );
    propriedadeRepository = moduleFixture.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural)
    );
    cultivoRepository = moduleFixture.get<Repository<Cultivo>>(
      getRepositoryToken(Cultivo)
    );

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /dashboard/stats', () => {
    it('should return complete dashboard statistics', async () => {
      // Mock do total de produtores
      mockProdutorRepository.count.mockResolvedValue(25);

      // Mock das estatísticas de propriedades (total fazendas e área total)
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '150',
          areatotal: '75000.0'
        })
      };

      // Mock da área por estado
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { estado: 'SP', fazendas: '80', area: '35000.0' },
          { estado: 'MT', fazendas: '40', area: '25000.0' },
          { estado: 'MG', fazendas: '30', area: '15000.5' }
        ])
      };

      // Mock da área por cultura
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { cultura: 'Soja', area: '30000.0' },
          { cultura: 'Milho', area: '20000.0' },
          { cultura: 'Algodão', area: '10000.0' }
        ])
      };

      // Mock do uso do solo
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: '45000.0',
          areavegetacao: '30000.0',
          areatotal: '75000.0'
        })
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder) // Para getPropriedadesStats
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)   // Para getAreaPorEstado
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);     // Para getUsoSolo

      mockCultivoRepository.createQueryBuilder
        .mockReturnValueOnce(mockAreaCulturaQueryBuilder); // Para getAreaPorCultura

      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .expect(200);

      // Verificar estrutura da resposta
      expect(response.body).toHaveProperty('totalProdutores', 25);
      expect(response.body).toHaveProperty('totalFazendas', 150);
      expect(response.body).toHaveProperty('totalAreaHectares', 75000.0);

      expect(response.body.areaPorEstado).toHaveLength(3);
      expect(response.body.areaPorEstado[0]).toMatchObject({
        estado: 'SP',
        fazendas: 80,
        area: 35000.0
      });

      expect(response.body.areaPorCultura).toHaveLength(3);
      expect(response.body.areaPorCultura[0]).toMatchObject({
        cultura: 'Soja',
        area: 30000.0,
        percentual: 50.0
      });

      expect(response.body.usoSolo).toMatchObject({
        areaAgricultavel: 45000.0,
        areaVegetacao: 30000.0,
        percentualAgricultavel: 60.0,
        percentualVegetacao: 40.0
      });

      // Verificar se os repositórios foram chamados corretamente
      expect(mockProdutorRepository.count).toHaveBeenCalled();
      expect(mockPropriedadeRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(mockCultivoRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should return empty statistics when no data exists', async () => {
      // Mock do total de produtores - nenhum
      mockProdutorRepository.count.mockResolvedValue(0);

      // Mock das estatísticas de propriedades - nenhuma
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '0',
          areatotal: null
        })
      };

      // Mock da área por estado - nenhuma
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([])
      };

      // Mock da área por cultura - nenhuma
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([])
      };

      // Mock do uso do solo - nenhum
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: null,
          areavegetacao: null,
          areatotal: null
        })
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder)
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);

      mockCultivoRepository.createQueryBuilder
        .mockReturnValueOnce(mockAreaCulturaQueryBuilder);

      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .expect(200);

      const expectedStats = {
        totalProdutores: 0,
        totalFazendas: 0,
        totalAreaHectares: 0,
        areaPorEstado: [],
        areaPorCultura: [],
        usoSolo: {
          areaAgricultavel: 0,
          areaVegetacao: 0,
          percentualAgricultavel: 0,
          percentualVegetacao: 0
        }
      };

      expect(response.body).toMatchObject(expectedStats);
    });

    it('should handle partial data correctly', async () => {
      // Mock do total de produtores
      mockProdutorRepository.count.mockResolvedValue(10);

      // Mock das estatísticas de propriedades
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '5',
          areatotal: '1000.0'
        })
      };

      // Mock da área por estado - apenas um estado
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { estado: 'SP', fazendas: '5', area: '1000.0' }
        ])
      };

      // Mock da área por cultura - apenas uma cultura
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { cultura: 'Soja', area: '500.0' }
        ])
      };

      // Mock do uso do solo
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: '600.0',
          areavegetacao: '400.0',
          areatotal: '1000.0'
        })
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder)
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);

      mockCultivoRepository.createQueryBuilder
        .mockReturnValueOnce(mockAreaCulturaQueryBuilder);

      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalProdutores: 10,
        totalFazendas: 5,
        totalAreaHectares: 1000.0,
        areaPorEstado: [
          { estado: 'SP', fazendas: 5, area: 1000.0 }
        ],
        areaPorCultura: [
          { cultura: 'Soja', area: 500.0, percentual: 100.0 }
        ],
        usoSolo: {
          areaAgricultavel: 600.0,
          areaVegetacao: 400.0,
          percentualAgricultavel: 60.0,
          percentualVegetacao: 40.0
        }
      });
    });

    it('should handle null/undefined values in database results', async () => {
      // Mock do total de produtores
      mockProdutorRepository.count.mockResolvedValue(5);

      // Mock das estatísticas de propriedades com valores null
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '3',
          areatotal: null // Valor null do banco
        })
      };

      // Mock da área por estado com alguns valores null
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { estado: 'SP', fazendas: '2', area: '500.0' },
          { estado: 'RJ', fazendas: '1', area: null } // Valor null
        ])
      };

      // Mock da área por cultura com valores null
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { cultura: 'Soja', area: null } // Valor null
        ])
      };

      // Mock do uso do solo com valores null
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: null,
          areavegetacao: null,
          areatotal: null
        })
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder)
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);

      mockCultivoRepository.createQueryBuilder
        .mockReturnValueOnce(mockAreaCulturaQueryBuilder);

      const response = await request(app.getHttpServer())
        .get('/dashboard/stats')
        .expect(200);

      expect(response.body).toMatchObject({
        totalProdutores: 5,
        totalFazendas: 3,
        totalAreaHectares: 0, // null convertido para 0
        areaPorEstado: [
          { estado: 'SP', fazendas: 2, area: 500.0 },
          { estado: 'RJ', fazendas: 1, area: 0 } // null convertido para 0
        ],
        areaPorCultura: [
          { cultura: 'Soja', area: 0, percentual: 0 } // null convertido para 0
        ],
        usoSolo: {
          areaAgricultavel: 0,
          areaVegetacao: 0,
          percentualAgricultavel: 0,
          percentualVegetacao: 0
        }
      });
    });
  });
});
