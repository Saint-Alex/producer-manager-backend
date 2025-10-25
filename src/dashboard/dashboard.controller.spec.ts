import { Test, TestingModule } from '@nestjs/testing';
import { DashboardController } from './dashboard.controller';
import { DashboardService, DashboardStats } from './dashboard.service';

describe('DashboardController', () => {
  let controller: DashboardController;
  let service: DashboardService;

  const mockDashboardService = {
    getStats: jest.fn(),
  };

  const mockDashboardStats: DashboardStats = {
    totalFazendas: 150,
    totalAreaHectares: 75000.5,
    totalProdutores: 45,
    areaPorEstado: [
      {
        estado: 'SP',
        area: 25000.0,
        fazendas: 50
      },
      {
        estado: 'MT',
        area: 30000.0,
        fazendas: 60
      },
      {
        estado: 'GO',
        area: 20000.5,
        fazendas: 40
      }
    ],
    areaPorCultura: [
      {
        cultura: 'Soja',
        area: 15000.0,
        percentual: 35.5
      },
      {
        cultura: 'Milho',
        area: 12000.0,
        percentual: 28.4
      },
      {
        cultura: 'Café',
        area: 8000.0,
        percentual: 18.9
      },
      {
        cultura: 'Algodão',
        area: 7000.5,
        percentual: 16.6
      }
    ],
    usoSolo: {
      areaAgricultavel: 45000.0,
      areaVegetacao: 30000.5,
      percentualAgricultavel: 60.0,
      percentualVegetacao: 40.0
    }
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DashboardController],
      providers: [
        {
          provide: DashboardService,
          useValue: mockDashboardService,
        },
      ],
    }).compile();

    controller = module.get<DashboardController>(DashboardController);
    service = module.get<DashboardService>(DashboardService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStats', () => {
    it('should return complete dashboard statistics', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getStats();

      expect(service.getStats).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDashboardStats);
    });

    it('should return correct total statistics', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getStats();

      expect(result.totalFazendas).toBe(150);
      expect(result.totalAreaHectares).toBe(75000.5);
      expect(result.totalProdutores).toBe(45);
    });

    it('should return area distribution by state', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getStats();

      expect(result.areaPorEstado).toHaveLength(3);
      expect(result.areaPorEstado[0]).toEqual({
        estado: 'SP',
        area: 25000.0,
        fazendas: 50
      });
      expect(result.areaPorEstado[1]).toEqual({
        estado: 'MT',
        area: 30000.0,
        fazendas: 60
      });
      expect(result.areaPorEstado[2]).toEqual({
        estado: 'GO',
        area: 20000.5,
        fazendas: 40
      });
    });

    it('should return culture distribution with percentages', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getStats();

      expect(result.areaPorCultura).toHaveLength(4);
      expect(result.areaPorCultura[0]).toEqual({
        cultura: 'Soja',
        area: 15000.0,
        percentual: 35.5
      });
      expect(result.areaPorCultura[1]).toEqual({
        cultura: 'Milho',
        area: 12000.0,
        percentual: 28.4
      });

      // Verifica se todos os percentuais somam próximo a 100%
      const totalPercentual = result.areaPorCultura.reduce((sum, item) => sum + item.percentual, 0);
      expect(totalPercentual).toBeCloseTo(99.4, 1);
    });

    it('should return land use statistics', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getStats();

      expect(result.usoSolo).toEqual({
        areaAgricultavel: 45000.0,
        areaVegetacao: 30000.5,
        percentualAgricultavel: 60.0,
        percentualVegetacao: 40.0
      });

      // Verifica se os percentuais de uso do solo somam 100%
      const totalPercentualUso = result.usoSolo.percentualAgricultavel + result.usoSolo.percentualVegetacao;
      expect(totalPercentualUso).toBe(100.0);
    });

    it('should handle empty dashboard data', async () => {
      const emptyStats: DashboardStats = {
        totalFazendas: 0,
        totalAreaHectares: 0,
        totalProdutores: 0,
        areaPorEstado: [],
        areaPorCultura: [],
        usoSolo: {
          areaAgricultavel: 0,
          areaVegetacao: 0,
          percentualAgricultavel: 0,
          percentualVegetacao: 0
        }
      };

      mockDashboardService.getStats.mockResolvedValue(emptyStats);

      const result = await controller.getStats();

      expect(result.totalFazendas).toBe(0);
      expect(result.totalAreaHectares).toBe(0);
      expect(result.totalProdutores).toBe(0);
      expect(result.areaPorEstado).toHaveLength(0);
      expect(result.areaPorCultura).toHaveLength(0);
      expect(result.usoSolo.areaAgricultavel).toBe(0);
      expect(result.usoSolo.areaVegetacao).toBe(0);
    });

    it('should handle single state data', async () => {
      const singleStateStats: DashboardStats = {
        ...mockDashboardStats,
        areaPorEstado: [
          {
            estado: 'SP',
            area: 75000.5,
            fazendas: 150
          }
        ]
      };

      mockDashboardService.getStats.mockResolvedValue(singleStateStats);

      const result = await controller.getStats();

      expect(result.areaPorEstado).toHaveLength(1);
      expect(result.areaPorEstado[0].estado).toBe('SP');
      expect(result.areaPorEstado[0].area).toBe(75000.5);
      expect(result.areaPorEstado[0].fazendas).toBe(150);
    });

    it('should handle single culture data', async () => {
      const singleCultureStats: DashboardStats = {
        ...mockDashboardStats,
        areaPorCultura: [
          {
            cultura: 'Soja',
            area: 42300.0,
            percentual: 100.0
          }
        ]
      };

      mockDashboardService.getStats.mockResolvedValue(singleCultureStats);

      const result = await controller.getStats();

      expect(result.areaPorCultura).toHaveLength(1);
      expect(result.areaPorCultura[0].cultura).toBe('Soja');
      expect(result.areaPorCultura[0].percentual).toBe(100.0);
    });

    it('should handle service errors', async () => {
      const error = new Error('Database connection error');
      mockDashboardService.getStats.mockRejectedValue(error);

      await expect(controller.getStats()).rejects.toThrow('Database connection error');
      expect(service.getStats).toHaveBeenCalledTimes(1);
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('Query timeout');
      mockDashboardService.getStats.mockRejectedValue(timeoutError);

      await expect(controller.getStats()).rejects.toThrow('Query timeout');
      expect(service.getStats).toHaveBeenCalledTimes(1);
    });

    it('should verify return type matches DashboardStats interface', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = await controller.getStats();

      // Verifica se todas as propriedades obrigatórias estão presentes
      expect(result).toHaveProperty('totalFazendas');
      expect(result).toHaveProperty('totalAreaHectares');
      expect(result).toHaveProperty('totalProdutores');
      expect(result).toHaveProperty('areaPorEstado');
      expect(result).toHaveProperty('areaPorCultura');
      expect(result).toHaveProperty('usoSolo');

      // Verifica tipos
      expect(typeof result.totalFazendas).toBe('number');
      expect(typeof result.totalAreaHectares).toBe('number');
      expect(typeof result.totalProdutores).toBe('number');
      expect(Array.isArray(result.areaPorEstado)).toBe(true);
      expect(Array.isArray(result.areaPorCultura)).toBe(true);
      expect(typeof result.usoSolo).toBe('object');

      // Verifica estrutura dos arrays
      if (result.areaPorEstado.length > 0) {
        expect(result.areaPorEstado[0]).toHaveProperty('estado');
        expect(result.areaPorEstado[0]).toHaveProperty('area');
        expect(result.areaPorEstado[0]).toHaveProperty('fazendas');
      }

      if (result.areaPorCultura.length > 0) {
        expect(result.areaPorCultura[0]).toHaveProperty('cultura');
        expect(result.areaPorCultura[0]).toHaveProperty('area');
        expect(result.areaPorCultura[0]).toHaveProperty('percentual');
      }

      // Verifica estrutura do uso do solo
      expect(result.usoSolo).toHaveProperty('areaAgricultavel');
      expect(result.usoSolo).toHaveProperty('areaVegetacao');
      expect(result.usoSolo).toHaveProperty('percentualAgricultavel');
      expect(result.usoSolo).toHaveProperty('percentualVegetacao');
    });

    it('should handle large numbers correctly', async () => {
      const largeNumberStats: DashboardStats = {
        totalFazendas: 10000,
        totalAreaHectares: 999999.99,
        totalProdutores: 5000,
        areaPorEstado: [
          {
            estado: 'MT',
            area: 500000.0,
            fazendas: 5000
          }
        ],
        areaPorCultura: [
          {
            cultura: 'Soja',
            area: 800000.0,
            percentual: 80.0
          }
        ],
        usoSolo: {
          areaAgricultavel: 800000.0,
          areaVegetacao: 199999.99,
          percentualAgricultavel: 80.0,
          percentualVegetacao: 20.0
        }
      };

      mockDashboardService.getStats.mockResolvedValue(largeNumberStats);

      const result = await controller.getStats();

      expect(result.totalAreaHectares).toBe(999999.99);
      expect(result.areaPorEstado[0].area).toBe(500000.0);
      expect(result.usoSolo.areaVegetacao).toBe(199999.99);
    });

    it('should handle decimal precision in calculations', async () => {
      const precisionStats: DashboardStats = {
        ...mockDashboardStats,
        areaPorCultura: [
          {
            cultura: 'Soja',
            area: 15000.123,
            percentual: 33.333
          },
          {
            cultura: 'Milho',
            area: 15000.456,
            percentual: 33.334
          },
          {
            cultura: 'Café',
            area: 15000.789,
            percentual: 33.333
          }
        ]
      };

      mockDashboardService.getStats.mockResolvedValue(precisionStats);

      const result = await controller.getStats();

      expect(result.areaPorCultura[0].area).toBe(15000.123);
      expect(result.areaPorCultura[0].percentual).toBe(33.333);
      expect(result.areaPorCultura[1].percentual).toBe(33.334);

      // Soma dos percentuais deve ser próxima de 100%
      const totalPercentual = result.areaPorCultura.reduce((sum, item) => sum + item.percentual, 0);
      expect(totalPercentual).toBeCloseTo(100.0, 2);
    });
  });

  describe('service injection', () => {
    it('should have dashboardService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockDashboardService);
    });
  });

  describe('API contract', () => {
    it('should return Promise<DashboardStats>', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      const result = controller.getStats();

      expect(result).toBeInstanceOf(Promise);

      const resolvedResult = await result;
      expect(resolvedResult).toEqual(mockDashboardStats);
    });

    it('should call service.getStats without parameters', async () => {
      mockDashboardService.getStats.mockResolvedValue(mockDashboardStats);

      await controller.getStats();

      expect(service.getStats).toHaveBeenCalledWith();
      expect(service.getStats).toHaveBeenCalledTimes(1);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom service error');
      mockDashboardService.getStats.mockRejectedValue(customError);

      await expect(controller.getStats()).rejects.toThrow('Custom service error');
    });

    it('should handle async operation errors', async () => {
      const asyncError = new Error('Async operation failed');
      mockDashboardService.getStats.mockRejectedValue(asyncError);

      await expect(controller.getStats()).rejects.toThrow('Async operation failed');
      expect(service.getStats).toHaveBeenCalledTimes(1);
    });
  });
});
