import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Produtor } from '../../database/entities/produtor.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { DashboardService } from './dashboard.service';

describe('DashboardService', () => {
  let service: DashboardService;
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
    const module: TestingModule = await Test.createTestingModule({
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

    service = module.get<DashboardService>(DashboardService);
    produtorRepository = module.get<Repository<Produtor>>(getRepositoryToken(Produtor));
    propriedadeRepository = module.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural),
    );
    cultivoRepository = module.get<Repository<Cultivo>>(getRepositoryToken(Cultivo));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getStats', () => {
    it('should return complete dashboard statistics', async () => {
      // Mock do total de produtores
      mockProdutorRepository.count.mockResolvedValue(25);

      // Mock das estatísticas de propriedades (total fazendas e área total)
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '150',
          areatotal: '75000.0',
        }),
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
          { estado: 'MG', fazendas: '30', area: '15000.0' },
        ]),
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
          { cultura: 'Algodão', area: '10000.0' },
        ]),
      };

      // Mock do uso do solo
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: '45000.0',
          areavegetacao: '30000.0',
          areatotal: '75000.0',
        }),
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder) // Para getPropriedadesStats
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder) // Para getAreaPorEstado
        .mockReturnValueOnce(mockUsoSoloQueryBuilder); // Para getUsoSolo

      mockCultivoRepository.createQueryBuilder.mockReturnValueOnce(mockAreaCulturaQueryBuilder); // Para getAreaPorCultura

      const result = await service.getStats();

      expect(result.totalProdutores).toBe(25);
      expect(result.totalFazendas).toBe(150);
      expect(result.totalAreaHectares).toBe(75000.0);

      expect(result.areaPorEstado).toEqual([
        { estado: 'SP', fazendas: 80, area: 35000.0 },
        { estado: 'MT', fazendas: 40, area: 25000.0 },
        { estado: 'MG', fazendas: 30, area: 15000.0 },
      ]);

      expect(result.areaPorCultura).toHaveLength(3);
      expect(result.areaPorCultura[0]).toEqual({
        cultura: 'Soja',
        area: 30000.0,
        percentual: 50.0,
      });
      expect(result.areaPorCultura[1].cultura).toBe('Milho');
      expect(result.areaPorCultura[1].area).toBe(20000.0);
      expect(result.areaPorCultura[1].percentual).toBeCloseTo(33.33, 2);
      expect(result.areaPorCultura[2].cultura).toBe('Algodão');
      expect(result.areaPorCultura[2].area).toBe(10000.0);
      expect(result.areaPorCultura[2].percentual).toBeCloseTo(16.67, 2);

      expect(result.usoSolo).toEqual({
        areaAgricultavel: 45000.0,
        areaVegetacao: 30000.0,
        percentualAgricultavel: 60.0,
        percentualVegetacao: 40.0,
      });

      // Verificar se os repositórios foram chamados corretamente
      expect(mockProdutorRepository.count).toHaveBeenCalled();
      expect(mockPropriedadeRepository.createQueryBuilder).toHaveBeenCalledTimes(3);
      expect(mockCultivoRepository.createQueryBuilder).toHaveBeenCalledTimes(1);
    });

    it('should handle empty data correctly', async () => {
      // Mock do total de produtores - nenhum
      mockProdutorRepository.count.mockResolvedValue(0);

      // Mock das estatísticas de propriedades - nenhuma
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '0',
          areatotal: null,
        }),
      };

      // Mock da área por estado - nenhuma
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      // Mock da área por cultura - nenhuma
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      // Mock do uso do solo - nenhum
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: null,
          areavegetacao: null,
          areatotal: null,
        }),
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder)
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);

      mockCultivoRepository.createQueryBuilder.mockReturnValueOnce(mockAreaCulturaQueryBuilder);

      const result = await service.getStats();

      expect(result).toEqual({
        totalProdutores: 0,
        totalFazendas: 0,
        totalAreaHectares: 0,
        areaPorEstado: [],
        areaPorCultura: [],
        usoSolo: {
          areaAgricultavel: 0,
          areaVegetacao: 0,
          percentualAgricultavel: 0,
          percentualVegetacao: 0,
        },
      });
    });

    it('should handle null values from database correctly', async () => {
      // Mock do total de produtores
      mockProdutorRepository.count.mockResolvedValue(5);

      // Mock das estatísticas de propriedades com valores null
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '3',
          areatotal: null, // Valor null do banco
        }),
      };

      // Mock da área por estado com alguns valores null
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { estado: 'SP', fazendas: '2', area: '500.0' },
          { estado: 'RJ', fazendas: '1', area: null }, // Valor null
        ]),
      };

      // Mock da área por cultura com valores null
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { cultura: 'Soja', area: null }, // Valor null
        ]),
      };

      // Mock do uso do solo com valores null
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: null,
          areavegetacao: null,
          areatotal: null,
        }),
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder)
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);

      mockCultivoRepository.createQueryBuilder.mockReturnValueOnce(mockAreaCulturaQueryBuilder);

      const result = await service.getStats();

      expect(result).toEqual({
        totalProdutores: 5,
        totalFazendas: 3,
        totalAreaHectares: 0, // null convertido para 0
        areaPorEstado: [
          { estado: 'SP', fazendas: 2, area: 500.0 },
          { estado: 'RJ', fazendas: 1, area: 0 }, // null convertido para 0
        ],
        areaPorCultura: [
          { cultura: 'Soja', area: 0, percentual: 0 }, // null convertido para 0
        ],
        usoSolo: {
          areaAgricultavel: 0,
          areaVegetacao: 0,
          percentualAgricultavel: 0,
          percentualVegetacao: 0,
        },
      });
    });

    it('should calculate percentual correctly when total area is zero', async () => {
      // Mock do total de produtores
      mockProdutorRepository.count.mockResolvedValue(1);

      // Mock das estatísticas de propriedades
      const mockPropriedadeQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          total: '1',
          areatotal: '100.0',
        }),
      };

      // Mock da área por estado
      const mockAreaEstadoQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([{ estado: 'SP', fazendas: '1', area: '100.0' }]),
      };

      // Mock da área por cultura - todas com área zero
      const mockAreaCulturaQueryBuilder = {
        innerJoin: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([
          { cultura: 'Soja', area: '0' },
          { cultura: 'Milho', area: '0' },
        ]),
      };

      // Mock do uso do solo
      const mockUsoSoloQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({
          areaagricultavel: '60.0',
          areavegetacao: '40.0',
          areatotal: '100.0',
        }),
      };

      // Configurar mocks dos QueryBuilders
      mockPropriedadeRepository.createQueryBuilder
        .mockReturnValueOnce(mockPropriedadeQueryBuilder)
        .mockReturnValueOnce(mockAreaEstadoQueryBuilder)
        .mockReturnValueOnce(mockUsoSoloQueryBuilder);

      mockCultivoRepository.createQueryBuilder.mockReturnValueOnce(mockAreaCulturaQueryBuilder);

      const result = await service.getStats();

      expect(result.areaPorCultura).toEqual([
        { cultura: 'Soja', area: 0, percentual: 0 },
        { cultura: 'Milho', area: 0, percentual: 0 },
      ]);
      expect(result.usoSolo.percentualAgricultavel).toBe(60.0);
      expect(result.usoSolo.percentualVegetacao).toBe(40.0);
    });
  });
});
