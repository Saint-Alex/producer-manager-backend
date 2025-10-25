import { Test, TestingModule } from '@nestjs/testing';
import { CultivoController } from './cultivo.controller';
import { CultivoService } from './cultivo.service';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';

describe('CultivoController', () => {
  let controller: CultivoController;
  let service: CultivoService;

  const mockCultivoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPropriedade: jest.fn(),
    findBySafra: jest.fn(),
    findByCultura: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCultivo = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    areaCultivada: 150.5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    propriedade: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nomeFazenda: 'Fazenda Boa Vista',
    },
    cultura: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      nome: 'Soja',
    },
    safra: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      nome: '2025',
    },
  };

  const mockCultivos = [
    mockCultivo,
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      areaCultivada: 200.0,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      propriedade: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nomeFazenda: 'Fazenda Boa Vista',
      },
      cultura: {
        id: '550e8400-e29b-41d4-a716-446655440005',
        nome: 'Milho',
      },
      safra: {
        id: '550e8400-e29b-41d4-a716-446655440003',
        nome: '2025',
      },
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CultivoController],
      providers: [
        {
          provide: CultivoService,
          useValue: mockCultivoService,
        },
      ],
    }).compile();

    controller = module.get<CultivoController>(CultivoController);
    service = module.get<CultivoService>(CultivoService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cultivo successfully', async () => {
      const createDto: CreateCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440001',
        culturaId: '550e8400-e29b-41d4-a716-446655440002',
        safraId: '550e8400-e29b-41d4-a716-446655440003',
        areaCultivada: 150.5,
      };

      mockCultivoService.create.mockResolvedValue(mockCultivo);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCultivo);
    });

    it('should handle area validation errors', async () => {
      const createDto: CreateCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440001',
        culturaId: '550e8400-e29b-41d4-a716-446655440002',
        safraId: '550e8400-e29b-41d4-a716-446655440003',
        areaCultivada: 5000.0, // Área maior que a propriedade
      };

      const error = new Error('Área cultivada excede a área agricultável da propriedade');
      mockCultivoService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'Área cultivada excede a área agricultável da propriedade',
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle duplicate cultivo errors', async () => {
      const createDto: CreateCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440001',
        culturaId: '550e8400-e29b-41d4-a716-446655440002',
        safraId: '550e8400-e29b-41d4-a716-446655440003',
        areaCultivada: 150.5,
      };

      const error = new Error('Cultivo já existe para essa combinação');
      mockCultivoService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'Cultivo já existe para essa combinação',
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle invalid reference errors', async () => {
      const createDto: CreateCultivoDto = {
        propriedadeId: 'invalid-uuid',
        culturaId: '550e8400-e29b-41d4-a716-446655440002',
        safraId: '550e8400-e29b-41d4-a716-446655440003',
        areaCultivada: 150.5,
      };

      const error = new Error('Propriedade não encontrada');
      mockCultivoService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Propriedade não encontrada');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all cultivos without filters', async () => {
      mockCultivoService.findAll.mockResolvedValue(mockCultivos);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByPropriedade).not.toHaveBeenCalled();
      expect(service.findBySafra).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(mockCultivos);
      expect(result).toHaveLength(2);
    });

    it('should return cultivos filtered by propriedade', async () => {
      const propriedadeId = '550e8400-e29b-41d4-a716-446655440001';
      const filteredCultivos = [mockCultivo];

      mockCultivoService.findByPropriedade.mockResolvedValue(filteredCultivos);

      const result = await controller.findAll(propriedadeId);

      expect(service.findByPropriedade).toHaveBeenCalledWith(propriedadeId);
      expect(service.findByPropriedade).toHaveBeenCalledTimes(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(service.findBySafra).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(filteredCultivos);
    });

    it('should return cultivos filtered by safra', async () => {
      const safraId = '550e8400-e29b-41d4-a716-446655440003';
      const filteredCultivos = mockCultivos;

      mockCultivoService.findBySafra.mockResolvedValue(filteredCultivos);

      const result = await controller.findAll(undefined, safraId);

      expect(service.findBySafra).toHaveBeenCalledWith(safraId);
      expect(service.findBySafra).toHaveBeenCalledTimes(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(service.findByPropriedade).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(filteredCultivos);
    });

    it('should return cultivos filtered by cultura', async () => {
      const culturaId = '550e8400-e29b-41d4-a716-446655440002';
      const filteredCultivos = [mockCultivo];

      mockCultivoService.findByCultura.mockResolvedValue(filteredCultivos);

      const result = await controller.findAll(undefined, undefined, culturaId);

      expect(service.findByCultura).toHaveBeenCalledWith(culturaId);
      expect(service.findByCultura).toHaveBeenCalledTimes(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(service.findByPropriedade).not.toHaveBeenCalled();
      expect(service.findBySafra).not.toHaveBeenCalled();
      expect(result).toEqual(filteredCultivos);
    });

    it('should prioritize propriedade filter when multiple filters provided', async () => {
      const propriedadeId = '550e8400-e29b-41d4-a716-446655440001';
      const safraId = '550e8400-e29b-41d4-a716-446655440003';
      const culturaId = '550e8400-e29b-41d4-a716-446655440002';
      const filteredCultivos = [mockCultivo];

      mockCultivoService.findByPropriedade.mockResolvedValue(filteredCultivos);

      const result = await controller.findAll(propriedadeId, safraId, culturaId);

      expect(service.findByPropriedade).toHaveBeenCalledWith(propriedadeId);
      expect(service.findBySafra).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(filteredCultivos);
    });

    it('should prioritize safra filter when propriedade not provided', async () => {
      const safraId = '550e8400-e29b-41d4-a716-446655440003';
      const culturaId = '550e8400-e29b-41d4-a716-446655440002';
      const filteredCultivos = mockCultivos;

      mockCultivoService.findBySafra.mockResolvedValue(filteredCultivos);

      const result = await controller.findAll(undefined, safraId, culturaId);

      expect(service.findBySafra).toHaveBeenCalledWith(safraId);
      expect(service.findByPropriedade).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(filteredCultivos);
    });

    it('should return empty array when no cultivos exist', async () => {
      mockCultivoService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockCultivoService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection error');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return a cultivo by id', async () => {
      mockCultivoService.findOne.mockResolvedValue(mockCultivo);

      const result = await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCultivo);
    });

    it('should handle not found error', async () => {
      const error = new Error('Cultivo not found');
      mockCultivoService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(validId)).rejects.toThrow('Cultivo not found');
      expect(service.findOne).toHaveBeenCalledWith(validId);
    });

    it('should return cultivo with detailed relationships', async () => {
      const detailedCultivo = {
        ...mockCultivo,
        propriedade: {
          ...mockCultivo.propriedade,
          cidade: 'Ribeirão Preto',
          estado: 'SP',
        },
      };
      mockCultivoService.findOne.mockResolvedValue(detailedCultivo);

      const result = await controller.findOne(validId);

      expect(result).toHaveProperty('propriedade');
      expect(result).toHaveProperty('cultura');
      expect(result).toHaveProperty('safra');
    });
  });

  describe('update', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a cultivo successfully', async () => {
      const updateDto: UpdateCultivoDto = {
        areaCultivada: 175.0,
      };

      const updatedCultivo = { ...mockCultivo, ...updateDto };
      mockCultivoService.update.mockResolvedValue(updatedCultivo);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedCultivo);
    });

    it('should update propriedade reference', async () => {
      const updateDto: UpdateCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440009',
      };

      const updatedCultivo = { ...mockCultivo };
      mockCultivoService.update.mockResolvedValue(updatedCultivo);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(updatedCultivo);
    });

    it('should update cultura reference', async () => {
      const updateDto: UpdateCultivoDto = {
        culturaId: '550e8400-e29b-41d4-a716-446655440009',
      };

      const updatedCultivo = { ...mockCultivo };
      mockCultivoService.update.mockResolvedValue(updatedCultivo);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(updatedCultivo);
    });

    it('should update safra reference', async () => {
      const updateDto: UpdateCultivoDto = {
        safraId: '550e8400-e29b-41d4-a716-446655440009',
      };

      const updatedCultivo = { ...mockCultivo };
      mockCultivoService.update.mockResolvedValue(updatedCultivo);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(updatedCultivo);
    });

    it('should update multiple fields', async () => {
      const updateDto: UpdateCultivoDto = {
        areaCultivada: 180.0,
        culturaId: '550e8400-e29b-41d4-a716-446655440009',
      };

      const updatedCultivo = { ...mockCultivo, ...updateDto };
      mockCultivoService.update.mockResolvedValue(updatedCultivo);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toHaveProperty('areaCultivada', updateDto.areaCultivada);
    });

    it('should handle not found error during update', async () => {
      const updateDto: UpdateCultivoDto = {
        areaCultivada: 175.0,
      };

      const error = new Error('Cultivo not found');
      mockCultivoService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Cultivo not found');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle area validation errors during update', async () => {
      const updateDto: UpdateCultivoDto = {
        areaCultivada: 5000.0, // Área maior que a propriedade
      };

      const error = new Error('Área cultivada excede a área agricultável da propriedade');
      mockCultivoService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow(
        'Área cultivada excede a área agricultável da propriedade',
      );
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle invalid reference errors during update', async () => {
      const updateDto: UpdateCultivoDto = {
        propriedadeId: 'invalid-uuid',
      };

      const error = new Error('Propriedade não encontrada');
      mockCultivoService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow(
        'Propriedade não encontrada',
      );
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle empty update object', async () => {
      const updateDto: UpdateCultivoDto = {};

      mockCultivoService.update.mockResolvedValue(mockCultivo);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(mockCultivo);
    });
  });

  describe('remove', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should remove a cultivo successfully', async () => {
      mockCultivoService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(service.remove).toHaveBeenCalledWith(validId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle not found error during removal', async () => {
      const error = new Error('Cultivo not found');
      mockCultivoService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Cultivo not found');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockCultivoService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Database error');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });
  });

  describe('service injection', () => {
    it('should have cultivoService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockCultivoService);
    });
  });

  describe('query parameter handling', () => {
    it('should handle undefined query parameters', async () => {
      mockCultivoService.findAll.mockResolvedValue(mockCultivos);

      const result = await controller.findAll(undefined, undefined, undefined);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByPropriedade).not.toHaveBeenCalled();
      expect(service.findBySafra).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(mockCultivos);
    });

    it('should handle empty string query parameters', async () => {
      mockCultivoService.findAll.mockResolvedValue(mockCultivos);

      const result = await controller.findAll('', undefined, undefined);

      // String vazia é falsy, então vai chamar findAll
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByPropriedade).not.toHaveBeenCalled();
      expect(service.findBySafra).not.toHaveBeenCalled();
      expect(service.findByCultura).not.toHaveBeenCalled();
      expect(result).toEqual(mockCultivos);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom service error');
      mockCultivoService.findAll.mockRejectedValue(customError);

      await expect(controller.findAll()).rejects.toThrow('Custom service error');
    });

    it('should handle async operation errors in all methods', async () => {
      const asyncError = new Error('Async operation failed');

      mockCultivoService.create.mockRejectedValue(asyncError);
      mockCultivoService.findAll.mockRejectedValue(asyncError);
      mockCultivoService.findOne.mockRejectedValue(asyncError);
      mockCultivoService.update.mockRejectedValue(asyncError);
      mockCultivoService.remove.mockRejectedValue(asyncError);

      const createDto: CreateCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440001',
        culturaId: '550e8400-e29b-41d4-a716-446655440002',
        safraId: '550e8400-e29b-41d4-a716-446655440003',
        areaCultivada: 150.5,
      };
      const updateDto: UpdateCultivoDto = { areaCultivada: 175.0 };
      const id = '550e8400-e29b-41d4-a716-446655440000';

      await expect(controller.create(createDto)).rejects.toThrow('Async operation failed');
      await expect(controller.findAll()).rejects.toThrow('Async operation failed');
      await expect(controller.findOne(id)).rejects.toThrow('Async operation failed');
      await expect(controller.update(id, updateDto)).rejects.toThrow('Async operation failed');
      await expect(controller.remove(id)).rejects.toThrow('Async operation failed');
    });
  });
});
