import { Test, TestingModule } from '@nestjs/testing';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';
import { PropriedadeController } from './propriedade.controller';
import { PropriedadeService } from './propriedade.service';

describe('PropriedadeController', () => {
  let controller: PropriedadeController;
  let service: PropriedadeService;

  const mockPropriedadeService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByProdutor: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockPropriedade = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nomeFazenda: 'Fazenda Boa Vista',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    areaTotal: 100.5,
    areaAgricultavel: 80.0,
    areaVegetacao: 20.5,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    produtores: [],
    cultivos: [],
  };

  const mockPropriedades = [
    mockPropriedade,
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nomeFazenda: 'Fazenda Santa Helena',
      cidade: 'Sorriso',
      estado: 'MT',
      areaTotal: 5000.0,
      areaAgricultavel: 4000.0,
      areaVegetacao: 1000.0,
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      produtores: [],
      cultivos: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PropriedadeController],
      providers: [
        {
          provide: PropriedadeService,
          useValue: mockPropriedadeService,
        },
      ],
    }).compile();

    controller = module.get<PropriedadeController>(PropriedadeController);
    service = module.get<PropriedadeService>(PropriedadeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a propriedade successfully', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda Boa Vista',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100.5,
        areaAgricultavel: 80.0,
        areaVegetacao: 20.5,
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
      };

      mockPropriedadeService.create.mockResolvedValue(mockPropriedade);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPropriedade);
    });

    it('should create propriedade with multiple produtores', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda Santa Helena',
        cidade: 'Sorriso',
        estado: 'MT',
        areaTotal: 5000.0,
        areaAgricultavel: 4000.0,
        areaVegetacao: 1000.0,
        produtorIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
      };

      const mockPropriedadeMultiple = { ...mockPropriedade, ...createDto };
      mockPropriedadeService.create.mockResolvedValue(mockPropriedadeMultiple);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockPropriedadeMultiple);
    });

    it('should handle area validation errors', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda Inválida',
        cidade: 'Cidade',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 80.0,
        areaVegetacao: 30.0, // Soma maior que areaTotal
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
      };

      const error = new Error('A soma das áreas não pode exceder a área total');
      mockPropriedadeService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow(
        'A soma das áreas não pode exceder a área total',
      );
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should handle invalid produtor id errors', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda Teste',
        cidade: 'Cidade',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 80.0,
        areaVegetacao: 20.0,
        produtorIds: ['invalid-uuid'],
      };

      const error = new Error('Produtor não encontrado');
      mockPropriedadeService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('Produtor não encontrado');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return all propriedades without filter', async () => {
      mockPropriedadeService.findAll.mockResolvedValue(mockPropriedades);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByProdutor).not.toHaveBeenCalled();
      expect(result).toEqual(mockPropriedades);
      expect(result).toHaveLength(2);
    });

    it('should return propriedades filtered by produtor', async () => {
      const produtorId = '550e8400-e29b-41d4-a716-446655440000';
      const filteredPropriedades = [mockPropriedade];

      mockPropriedadeService.findByProdutor.mockResolvedValue(filteredPropriedades);

      const result = await controller.findAll(produtorId);

      expect(service.findByProdutor).toHaveBeenCalledWith(produtorId);
      expect(service.findByProdutor).toHaveBeenCalledTimes(1);
      expect(service.findAll).not.toHaveBeenCalled();
      expect(result).toEqual(filteredPropriedades);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no propriedades exist', async () => {
      mockPropriedadeService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should return empty array when filtering by non-existent produtor', async () => {
      const produtorId = '550e8400-e29b-41d4-a716-446655440999';
      mockPropriedadeService.findByProdutor.mockResolvedValue([]);

      const result = await controller.findAll(produtorId);

      expect(service.findByProdutor).toHaveBeenCalledWith(produtorId);
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockPropriedadeService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection error');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });

    it('should handle service errors during findByProdutor', async () => {
      const produtorId = '550e8400-e29b-41d4-a716-446655440000';
      const error = new Error('Invalid produtor ID');
      mockPropriedadeService.findByProdutor.mockRejectedValue(error);

      await expect(controller.findAll(produtorId)).rejects.toThrow('Invalid produtor ID');
      expect(service.findByProdutor).toHaveBeenCalledWith(produtorId);
    });
  });

  describe('findOne', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return a propriedade by id', async () => {
      mockPropriedadeService.findOne.mockResolvedValue(mockPropriedade);

      const result = await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockPropriedade);
    });

    it('should handle not found error', async () => {
      const error = new Error('Propriedade not found');
      mockPropriedadeService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(validId)).rejects.toThrow('Propriedade not found');
      expect(service.findOne).toHaveBeenCalledWith(validId);
    });

    it('should return propriedade with detailed information', async () => {
      const detailedPropriedade = {
        ...mockPropriedade,
        produtores: [{ id: '123', nome: 'João' }],
        cultivos: [{ id: '456', nome: 'Soja' }],
      };
      mockPropriedadeService.findOne.mockResolvedValue(detailedPropriedade);

      const result = await controller.findOne(validId);

      expect(result.produtores).toBeDefined();
      expect(result.cultivos).toBeDefined();
    });
  });

  describe('update', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a propriedade successfully', async () => {
      const updateDto: UpdatePropriedadeDto = {
        nomeFazenda: 'Fazenda Boa Vista Atualizada',
      };

      const updatedPropriedade = { ...mockPropriedade, ...updateDto };
      mockPropriedadeService.update.mockResolvedValue(updatedPropriedade);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedPropriedade);
    });

    it('should update multiple fields', async () => {
      const updateDto: UpdatePropriedadeDto = {
        nomeFazenda: 'Fazenda Nova',
        cidade: 'São Paulo',
        estado: 'SP',
        areaTotal: 200.0,
      };

      const updatedPropriedade = { ...mockPropriedade, ...updateDto };
      mockPropriedadeService.update.mockResolvedValue(updatedPropriedade);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.nomeFazenda).toBe(updateDto.nomeFazenda);
      expect(result.cidade).toBe(updateDto.cidade);
      expect(result.areaTotal).toBe(updateDto.areaTotal);
    });

    it('should update area fields with validation', async () => {
      const updateDto: UpdatePropriedadeDto = {
        areaTotal: 150.0,
        areaAgricultavel: 120.0,
        areaVegetacao: 30.0,
      };

      const updatedPropriedade = { ...mockPropriedade, ...updateDto };
      mockPropriedadeService.update.mockResolvedValue(updatedPropriedade);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.areaTotal).toBe(updateDto.areaTotal);
      expect(result.areaAgricultavel).toBe(updateDto.areaAgricultavel);
      expect(result.areaVegetacao).toBe(updateDto.areaVegetacao);
    });

    it('should update produtorIds array', async () => {
      const updateDto: UpdatePropriedadeDto = {
        produtorIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
      };

      const updatedPropriedade = { ...mockPropriedade };
      mockPropriedadeService.update.mockResolvedValue(updatedPropriedade);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(updatedPropriedade);
    });

    it('should handle not found error during update', async () => {
      const updateDto: UpdatePropriedadeDto = {
        nomeFazenda: 'Fazenda Atualizada',
      };

      const error = new Error('Propriedade not found');
      mockPropriedadeService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Propriedade not found');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle area validation errors during update', async () => {
      const updateDto: UpdatePropriedadeDto = {
        areaTotal: 100.0,
        areaAgricultavel: 80.0,
        areaVegetacao: 30.0, // Soma maior que areaTotal
      };

      const error = new Error('A soma das áreas não pode exceder a área total');
      mockPropriedadeService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow(
        'A soma das áreas não pode exceder a área total',
      );
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle empty update object', async () => {
      const updateDto: UpdatePropriedadeDto = {};

      mockPropriedadeService.update.mockResolvedValue(mockPropriedade);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(mockPropriedade);
    });
  });

  describe('remove', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should remove a propriedade successfully', async () => {
      mockPropriedadeService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(service.remove).toHaveBeenCalledWith(validId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle not found error during removal', async () => {
      const error = new Error('Propriedade not found');
      mockPropriedadeService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Propriedade not found');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle cascade deletion constraints', async () => {
      const error = new Error('Cannot delete propriedade with associated cultivos');
      mockPropriedadeService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow(
        'Cannot delete propriedade with associated cultivos',
      );
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockPropriedadeService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Database error');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });
  });

  describe('service injection', () => {
    it('should have propriedadeService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockPropriedadeService);
    });
  });

  describe('query parameter handling', () => {
    it('should handle undefined produtorId parameter', async () => {
      mockPropriedadeService.findAll.mockResolvedValue(mockPropriedades);

      const result = await controller.findAll(undefined);

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByProdutor).not.toHaveBeenCalled();
      expect(result).toEqual(mockPropriedades);
    });

    it('should handle empty string produtorId parameter', async () => {
      mockPropriedadeService.findAll.mockResolvedValue(mockPropriedades);

      const result = await controller.findAll('');

      // String vazia é falsy, então vai chamar findAll
      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(service.findByProdutor).not.toHaveBeenCalled();
      expect(result).toEqual(mockPropriedades);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom service error');
      mockPropriedadeService.findAll.mockRejectedValue(customError);

      await expect(controller.findAll()).rejects.toThrow('Custom service error');
    });

    it('should handle async operation errors in all methods', async () => {
      const asyncError = new Error('Async operation failed');

      mockPropriedadeService.create.mockRejectedValue(asyncError);
      mockPropriedadeService.findAll.mockRejectedValue(asyncError);
      mockPropriedadeService.findOne.mockRejectedValue(asyncError);
      mockPropriedadeService.update.mockRejectedValue(asyncError);
      mockPropriedadeService.remove.mockRejectedValue(asyncError);

      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Test',
        cidade: 'Test',
        estado: 'SP',
        areaTotal: 100,
        areaAgricultavel: 80,
        areaVegetacao: 20,
        produtorIds: [],
      };
      const updateDto: UpdatePropriedadeDto = { nomeFazenda: 'Test' };
      const id = '550e8400-e29b-41d4-a716-446655440000';

      await expect(controller.create(createDto)).rejects.toThrow('Async operation failed');
      await expect(controller.findAll()).rejects.toThrow('Async operation failed');
      await expect(controller.findOne(id)).rejects.toThrow('Async operation failed');
      await expect(controller.update(id, updateDto)).rejects.toThrow('Async operation failed');
      await expect(controller.remove(id)).rejects.toThrow('Async operation failed');
    });
  });
});
