import { Test, TestingModule } from '@nestjs/testing';
import { CulturaController } from './cultura.controller';
import { CulturaService } from './cultura.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';

describe('CulturaController', () => {
  let controller: CulturaController;
  let service: CulturaService;

  const mockCulturaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockCultura = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'Soja',
    descricao: 'Cultura oleaginosa para produção de grãos e óleo',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    cultivos: []
  };

  const mockCulturas = [
    mockCultura,
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nome: 'Milho',
      descricao: 'Cereal para alimentação humana e animal',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      cultivos: []
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      nome: 'Café',
      descricao: 'Cultura permanente para produção de café arábica',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
      cultivos: []
    }
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CulturaController],
      providers: [
        {
          provide: CulturaService,
          useValue: mockCulturaService,
        },
      ],
    }).compile();

    controller = module.get<CulturaController>(CulturaController);
    service = module.get<CulturaService>(CulturaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a cultura successfully', async () => {
      const createDto: CreateCulturaDto = {
        nome: 'Soja'
      };

      mockCulturaService.create.mockResolvedValue(mockCultura);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCultura);
    });

    it('should create cultura with different data', async () => {
      const createDto: CreateCulturaDto = {
        nome: 'Algodão'
      };

      const mockAlgodao = {
        ...mockCultura,
        id: '550e8400-e29b-41d4-a716-446655440009',
        nome: 'Algodão',
        descricao: 'Fibra natural para produção têxtil'
      };
      mockCulturaService.create.mockResolvedValue(mockAlgodao);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockAlgodao);
      expect(result.nome).toBe(createDto.nome);
    });

    it('should create cultura without description', async () => {
      const createDto: CreateCulturaDto = {
        nome: 'Feijão'
      };

      const mockFeijao = {
        ...mockCultura,
        id: '550e8400-e29b-41d4-a716-446655440010',
        nome: 'Feijão',
        descricao: undefined
      };
      mockCulturaService.create.mockResolvedValue(mockFeijao);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.nome).toBe(createDto.nome);
    });

    it('should handle duplicate name errors', async () => {
      const createDto: CreateCulturaDto = {
        nome: 'Soja'
      };

      const error = new Error('Cultura com este nome já existe');
      mockCulturaService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Cultura com este nome já existe');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle validation errors', async () => {
      const createDto: CreateCulturaDto = {
        nome: '' // Nome vazio
      };

      const error = new Error('Nome é obrigatório');
      mockCulturaService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Nome é obrigatório');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle long name validation', async () => {
      const createDto: CreateCulturaDto = {
        nome: 'A'.repeat(101) // Nome muito longo
      };

      const error = new Error('Nome deve ter no máximo 100 caracteres');
      mockCulturaService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Nome deve ter no máximo 100 caracteres');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all culturas', async () => {
      mockCulturaService.findAll.mockResolvedValue(mockCulturas);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCulturas);
      expect(result).toHaveLength(3);
    });

    it('should return empty array when no culturas exist', async () => {
      mockCulturaService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should return culturas ordered by name', async () => {
      const orderedCulturas = [
        mockCulturas[2], // Café
        mockCulturas[1], // Milho
        mockCulturas[0]  // Soja
      ];
      mockCulturaService.findAll.mockResolvedValue(orderedCulturas);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(orderedCulturas);
      expect(result[0].nome).toBe('Café');
      expect(result[2].nome).toBe('Soja');
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockCulturaService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection error');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return a cultura by id', async () => {
      mockCulturaService.findOne.mockResolvedValue(mockCultura);

      const result = await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCultura);
    });

    it('should handle not found error', async () => {
      const error = new Error('Cultura not found');
      mockCulturaService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(validId)).rejects.toThrow('Cultura not found');
      expect(service.findOne).toHaveBeenCalledWith(validId);
    });

    it('should return cultura with cultivos information', async () => {
      const detailedCultura = {
        ...mockCultura,
        cultivos: [
          {
            id: '123',
            areaCultivada: 100,
            propriedade: { nomeFazenda: 'Fazenda A' },
            safra: { nome: '2025' }
          },
          {
            id: '456',
            areaCultivada: 200,
            propriedade: { nomeFazenda: 'Fazenda B' },
            safra: { nome: '2025' }
          }
        ]
      };
      mockCulturaService.findOne.mockResolvedValue(detailedCultura);

      const result = await controller.findOne(validId);

      expect(result).toHaveProperty('cultivos');
      expect(result.cultivos).toHaveLength(2);
      expect(result.cultivos[0]).toHaveProperty('areaCultivada');
      expect(result.cultivos[0]).toHaveProperty('propriedade');
      expect(result.cultivos[0]).toHaveProperty('safra');
    });

    it('should return different cultura by different id', async () => {
      const anotherId = '550e8400-e29b-41d4-a716-446655440001';
      const milho = mockCulturas[1];
      mockCulturaService.findOne.mockResolvedValue(milho);

      const result = await controller.findOne(anotherId);

      expect(service.findOne).toHaveBeenCalledWith(anotherId);
      expect(result.nome).toBe('Milho');
    });
  });

  describe('update', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a cultura successfully', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'Soja Transgênica'
      };

      const updatedCultura = { ...mockCultura, ...updateDto };
      mockCulturaService.update.mockResolvedValue(updatedCultura);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedCultura);
    });

    it('should update only nome', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'Soja Atualizada'
      };

      const updatedCultura = { ...mockCultura, ...updateDto };
      mockCulturaService.update.mockResolvedValue(updatedCultura);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toHaveProperty('nome', updateDto.nome);
    });

    it('should update nome with different value', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'Soja Orgânica'
      };

      const updatedCultura = { ...mockCultura, ...updateDto };
      mockCulturaService.update.mockResolvedValue(updatedCultura);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.nome).toBe(updateDto.nome);
    });

    it('should update nome to different culture type', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'Milho'
      };

      const updatedCultura = { ...mockCultura, nome: 'Milho' };
      mockCulturaService.update.mockResolvedValue(updatedCultura);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.nome).toBe('Milho');
    });

    it('should handle not found error during update', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'Cultura Atualizada'
      };

      const error = new Error('Cultura not found');
      mockCulturaService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Cultura not found');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle duplicate name errors during update', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'Milho' // Nome já existente
      };

      const error = new Error('Cultura com este nome já existe');
      mockCulturaService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Cultura com este nome já existe');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle validation errors during update', async () => {
      const updateDto: UpdateCulturaDto = {
        nome: 'A'.repeat(101) // Nome muito longo
      };

      const error = new Error('Nome deve ter no máximo 100 caracteres');
      mockCulturaService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Nome deve ter no máximo 100 caracteres');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle empty update object', async () => {
      const updateDto: UpdateCulturaDto = {};

      mockCulturaService.update.mockResolvedValue(mockCultura);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(mockCultura);
    });
  });

  describe('remove', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should remove a cultura successfully', async () => {
      mockCulturaService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(service.remove).toHaveBeenCalledWith(validId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle not found error during removal', async () => {
      const error = new Error('Cultura not found');
      mockCulturaService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Cultura not found');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle cascade deletion constraints', async () => {
      const error = new Error('Cannot delete cultura with associated cultivos');
      mockCulturaService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Cannot delete cultura with associated cultivos');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockCulturaService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Database error');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle removal of commonly used cultura', async () => {
      const error = new Error('Cannot delete cultura that is being used in active cultivos');
      mockCulturaService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Cannot delete cultura that is being used in active cultivos');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });
  });

  describe('service injection', () => {
    it('should have culturaService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockCulturaService);
    });
  });

  describe('parameter parsing', () => {
    it('should use ParseUUIDPipe for id parameters', async () => {
      mockCulturaService.findOne.mockResolvedValue(mockCultura);

      // Testamos apenas o comportamento, o pipe é testado pelo NestJS
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
    });
  });

  describe('business logic', () => {
    it('should handle creation of common agricultural cultures', async () => {
      const cultures = [
        { nome: 'Soja', descricao: 'Oleaginosa' },
        { nome: 'Milho', descricao: 'Cereal' },
        { nome: 'Café', descricao: 'Cultura permanente' },
        { nome: 'Algodão', descricao: 'Fibra' },
        { nome: 'Cana-de-açúcar', descricao: 'Sacarose' }
      ];

      for (const culture of cultures) {
        const mockResult = { ...mockCultura, ...culture, id: `uuid-${culture.nome}` };
        mockCulturaService.create.mockResolvedValue(mockResult);

        const result = await controller.create(culture);

        expect(service.create).toHaveBeenCalledWith(culture);
        expect(result.nome).toBe(culture.nome);
      }
    });

    it('should handle case sensitivity in names', async () => {
      const createDto: CreateCulturaDto = {
        nome: 'SOJA'
      };

      const mockSojaMaiuscula = { ...mockCultura, nome: 'SOJA' };
      mockCulturaService.create.mockResolvedValue(mockSojaMaiuscula);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result.nome).toBe('SOJA');
    });
  });

  describe('error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom service error');
      mockCulturaService.findAll.mockRejectedValue(customError);

      await expect(controller.findAll()).rejects.toThrow('Custom service error');
    });

    it('should handle async operation errors in all methods', async () => {
      const asyncError = new Error('Async operation failed');

      mockCulturaService.create.mockRejectedValue(asyncError);
      mockCulturaService.findAll.mockRejectedValue(asyncError);
      mockCulturaService.findOne.mockRejectedValue(asyncError);
      mockCulturaService.update.mockRejectedValue(asyncError);
      mockCulturaService.remove.mockRejectedValue(asyncError);

      const createDto: CreateCulturaDto = { nome: 'Test' };
      const updateDto: UpdateCulturaDto = { nome: 'Test' };
      const id = '550e8400-e29b-41d4-a716-446655440000';

      await expect(controller.create(createDto)).rejects.toThrow('Async operation failed');
      await expect(controller.findAll()).rejects.toThrow('Async operation failed');
      await expect(controller.findOne(id)).rejects.toThrow('Async operation failed');
      await expect(controller.update(id, updateDto)).rejects.toThrow('Async operation failed');
      await expect(controller.remove(id)).rejects.toThrow('Async operation failed');
    });
  });
});
