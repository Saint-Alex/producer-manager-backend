import { Test, TestingModule } from '@nestjs/testing';
import { CreateSafraDto } from './dto/create-safra.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';
import { SafraController } from './safra.controller';
import { SafraService } from './safra.service';

describe('SafraController', () => {
  let controller: SafraController;
  let service: SafraService;

  const mockSafraService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByYear: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockSafra = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'Safra 2025',
    ano: 2025,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cultivos: [],
  };

  const mockSafras = [
    mockSafra,
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nome: 'Safra 2024',
      ano: 2024,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      cultivos: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SafraController],
      providers: [
        {
          provide: SafraService,
          useValue: mockSafraService,
        },
      ],
    }).compile();

    controller = module.get<SafraController>(SafraController);
    service = module.get<SafraService>(SafraService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a safra successfully', async () => {
      const createDto: CreateSafraDto = {
        nome: 'Safra 2025',
        ano: 2025,
      };

      mockSafraService.create.mockResolvedValue(mockSafra);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSafra);
    });

    it('should create safra with different year', async () => {
      const createDto: CreateSafraDto = {
        nome: 'Safra 2026',
        ano: 2026,
      };

      const mockSafra2026 = { ...mockSafra, ...createDto };
      mockSafraService.create.mockResolvedValue(mockSafra2026);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockSafra2026);
    });

    it('should handle duplicate year errors', async () => {
      const createDto: CreateSafraDto = {
        nome: 'Safra 2025',
        ano: 2025,
      };

      const error = new Error('Safra para este ano já existe');
      mockSafraService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Safra para este ano já existe');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle invalid year range errors', async () => {
      const createDto: CreateSafraDto = {
        nome: 'Safra Inválida',
        ano: 1999, // Ano anterior ao mínimo permitido
      };

      const error = new Error('Ano deve estar entre 2000 e 2050');
      mockSafraService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'Ano deve estar entre 2000 e 2050',
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle future year validation', async () => {
      const createDto: CreateSafraDto = {
        nome: 'Safra 2051',
        ano: 2051, // Ano posterior ao máximo permitido
      };

      const error = new Error('Ano deve estar entre 2000 e 2050');
      mockSafraService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'Ano deve estar entre 2000 e 2050',
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all safras', async () => {
      mockSafraService.findAll.mockResolvedValue(mockSafras);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSafras);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no safras exist', async () => {
      mockSafraService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should return safras ordered by year', async () => {
      const orderedSafras = [mockSafras[0], mockSafras[1]]; // 2025, 2024
      mockSafraService.findAll.mockResolvedValue(orderedSafras);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(orderedSafras);
      expect(result[0].ano).toBeGreaterThan(result[1].ano);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockSafraService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection error');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return a safra by id', async () => {
      mockSafraService.findOne.mockResolvedValue(mockSafra);

      const result = await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSafra);
    });

    it('should handle not found error', async () => {
      const error = new Error('Safra not found');
      mockSafraService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(validId)).rejects.toThrow('Safra not found');
      expect(service.findOne).toHaveBeenCalledWith(validId);
    });

    it('should return safra with cultivos information', async () => {
      const detailedSafra = {
        ...mockSafra,
        cultivos: [
          { id: '123', areaCultivada: 100 },
          { id: '456', areaCultivada: 200 },
        ],
      };
      mockSafraService.findOne.mockResolvedValue(detailedSafra);

      const result = await controller.findOne(validId);

      expect(result).toHaveProperty('cultivos');
      expect(result.cultivos).toHaveLength(2);
    });
  });

  describe('findByYear', () => {
    it('should return safra by year', async () => {
      const year = 2025;
      mockSafraService.findByYear.mockResolvedValue(mockSafra);

      const result = await controller.findByYear(year);

      expect(service.findByYear).toHaveBeenCalledWith(year);
      expect(service.findByYear).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockSafra);
    });

    it('should find safra for different years', async () => {
      const year = 2024;
      const safra2024 = mockSafras[1];
      mockSafraService.findByYear.mockResolvedValue(safra2024);

      const result = await controller.findByYear(year);

      expect(service.findByYear).toHaveBeenCalledWith(year);
      expect(result.ano).toBe(year);
    });

    it('should handle not found error for year', async () => {
      const year = 2023;
      const error = new Error('Safra não encontrada para este ano');
      mockSafraService.findByYear.mockRejectedValue(error);

      await expect(controller.findByYear(year)).rejects.toThrow(
        'Safra não encontrada para este ano',
      );
      expect(service.findByYear).toHaveBeenCalledWith(year);
    });

    it('should handle invalid year values', async () => {
      const year = 1900;
      const error = new Error('Ano inválido');
      mockSafraService.findByYear.mockRejectedValue(error);

      await expect(controller.findByYear(year)).rejects.toThrow('Ano inválido');
      expect(service.findByYear).toHaveBeenCalledWith(year);
    });

    it('should handle future year search', async () => {
      const year = 2030;
      const error = new Error('Safra não encontrada para este ano');
      mockSafraService.findByYear.mockRejectedValue(error);

      await expect(controller.findByYear(year)).rejects.toThrow(
        'Safra não encontrada para este ano',
      );
      expect(service.findByYear).toHaveBeenCalledWith(year);
    });
  });

  describe('update', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a safra successfully', async () => {
      const updateDto: UpdateSafraDto = {
        nome: 'Safra 2025 Atualizada',
      };

      const updatedSafra = { ...mockSafra, ...updateDto };
      mockSafraService.update.mockResolvedValue(updatedSafra);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedSafra);
    });

    it('should update year', async () => {
      const updateDto: UpdateSafraDto = {
        ano: 2026,
      };

      const updatedSafra = { ...mockSafra, ...updateDto };
      mockSafraService.update.mockResolvedValue(updatedSafra);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toHaveProperty('ano', updateDto.ano);
    });

    it('should update date range', async () => {
      const updateDto: UpdateSafraDto = {
        nome: 'Safra com datas atualizadas',
      };

      const updatedSafra = { ...mockSafra, ...updateDto };
      mockSafraService.update.mockResolvedValue(updatedSafra);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toHaveProperty('nome', updateDto.nome);
    });

    it('should update multiple fields', async () => {
      const updateDto: UpdateSafraDto = {
        nome: 'Safra Completa 2025',
        ano: 2025,
      };

      const updatedSafra = { ...mockSafra, ...updateDto };
      mockSafraService.update.mockResolvedValue(updatedSafra);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.nome).toBe(updateDto.nome);
      expect(result).toHaveProperty('ano', updateDto.ano);
    });

    it('should handle not found error during update', async () => {
      const updateDto: UpdateSafraDto = {
        nome: 'Safra Atualizada',
      };

      const error = new Error('Safra not found');
      mockSafraService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Safra not found');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle duplicate year errors during update', async () => {
      const updateDto: UpdateSafraDto = {
        ano: 2024, // Ano já existente
      };

      const error = new Error('Safra para este ano já existe');
      mockSafraService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow(
        'Safra para este ano já existe',
      );
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle invalid date range during update', async () => {
      const updateDto: UpdateSafraDto = {
        nome: 'Safra com nome inválido',
      };

      const error = new Error('Nome inválido para safra');
      mockSafraService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow(
        'Nome inválido para safra',
      );
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle empty update object', async () => {
      const updateDto: UpdateSafraDto = {};

      mockSafraService.update.mockResolvedValue(mockSafra);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(mockSafra);
    });
  });

  describe('remove', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should remove a safra successfully', async () => {
      mockSafraService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(service.remove).toHaveBeenCalledWith(validId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle not found error during removal', async () => {
      const error = new Error('Safra not found');
      mockSafraService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Safra not found');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle cascade deletion constraints', async () => {
      const error = new Error('Cannot delete safra with associated cultivos');
      mockSafraService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow(
        'Cannot delete safra with associated cultivos',
      );
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockSafraService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Database error');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle active safra deletion prevention', async () => {
      const error = new Error('Cannot delete active safra');
      mockSafraService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Cannot delete active safra');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });
  });

  describe('service injection', () => {
    it('should have safraService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockSafraService);
    });
  });

  describe('parameter parsing', () => {
    it('should use ParseUUIDPipe for id parameters', async () => {
      mockSafraService.findOne.mockResolvedValue(mockSafra);

      // Testamos apenas o comportamento, o pipe é testado pelo NestJS
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
    });

    it('should use ParseIntPipe for year parameter', async () => {
      mockSafraService.findByYear.mockResolvedValue(mockSafra);

      // Testamos apenas o comportamento, o pipe é testado pelo NestJS
      const year = 2025;
      await controller.findByYear(year);

      expect(service.findByYear).toHaveBeenCalledWith(year);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom service error');
      mockSafraService.findAll.mockRejectedValue(customError);

      await expect(controller.findAll()).rejects.toThrow('Custom service error');
    });

    it('should handle async operation errors in all methods', async () => {
      const asyncError = new Error('Async operation failed');

      mockSafraService.create.mockRejectedValue(asyncError);
      mockSafraService.findAll.mockRejectedValue(asyncError);
      mockSafraService.findOne.mockRejectedValue(asyncError);
      mockSafraService.findByYear.mockRejectedValue(asyncError);
      mockSafraService.update.mockRejectedValue(asyncError);
      mockSafraService.remove.mockRejectedValue(asyncError);

      const createDto: CreateSafraDto = {
        nome: 'Test',
        ano: 2025,
      };
      const updateDto: UpdateSafraDto = { nome: 'Test' };
      const id = '550e8400-e29b-41d4-a716-446655440000';
      const year = 2025;

      await expect(controller.create(createDto)).rejects.toThrow('Async operation failed');
      await expect(controller.findAll()).rejects.toThrow('Async operation failed');
      await expect(controller.findOne(id)).rejects.toThrow('Async operation failed');
      await expect(controller.findByYear(year)).rejects.toThrow('Async operation failed');
      await expect(controller.update(id, updateDto)).rejects.toThrow('Async operation failed');
      await expect(controller.remove(id)).rejects.toThrow('Async operation failed');
    });
  });
});
