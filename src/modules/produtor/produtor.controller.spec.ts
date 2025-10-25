import { Test, TestingModule } from '@nestjs/testing';
import { CreateProdutorDto, UpdateProdutorDto } from './dto';
import { ProdutorController } from './produtor.controller';
import { ProdutorService } from './produtor.service';

describe('ProdutorController', () => {
  let controller: ProdutorController;
  let service: ProdutorService;

  const mockProdutorService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProdutor = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    nome: 'João Silva',
    cpfCnpj: '11144477735',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    propriedades: [],
  };

  const mockProdutores = [
    mockProdutor,
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      nome: 'Maria Santos',
      cpfCnpj: '11222333000181',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
      propriedades: [],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutorController],
      providers: [
        {
          provide: ProdutorService,
          useValue: mockProdutorService,
        },
      ],
    }).compile();

    controller = module.get<ProdutorController>(ProdutorController);
    service = module.get<ProdutorService>(ProdutorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a produtor successfully', async () => {
      const createDto: CreateProdutorDto = {
        nome: 'João Silva',
        cpfCnpj: '11144477735',
      };

      mockProdutorService.create.mockResolvedValue(mockProdutor);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(service.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProdutor);
    });

    it('should handle service errors during creation', async () => {
      const createDto: CreateProdutorDto = {
        nome: 'João Silva',
        cpfCnpj: '11144477735',
      };

      const error = new Error('CPF já cadastrado');
      mockProdutorService.create.mockRejectedValue(error);

      await expect(controller.create(createDto)).rejects.toThrow('CPF já cadastrado');
      expect(service.create).toHaveBeenCalledWith(createDto);
    });

    it('should create produtor with CNPJ', async () => {
      const createDto: CreateProdutorDto = {
        nome: 'Fazenda São José LTDA',
        cpfCnpj: '11222333000181',
      };

      const mockProdutorCnpj = { ...mockProdutor, ...createDto };
      mockProdutorService.create.mockResolvedValue(mockProdutorCnpj);

      const result = await controller.create(createDto);

      expect(service.create).toHaveBeenCalledWith(createDto);
      expect(result).toEqual(mockProdutorCnpj);
    });
  });

  describe('findAll', () => {
    it('should return all produtores', async () => {
      mockProdutorService.findAll.mockResolvedValue(mockProdutores);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProdutores);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no produtores exist', async () => {
      mockProdutorService.findAll.mockResolvedValue([]);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('should handle service errors during findAll', async () => {
      const error = new Error('Database connection error');
      mockProdutorService.findAll.mockRejectedValue(error);

      await expect(controller.findAll()).rejects.toThrow('Database connection error');
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should return a produtor by id', async () => {
      mockProdutorService.findOne.mockResolvedValue(mockProdutor);

      const result = await controller.findOne(validId);

      expect(service.findOne).toHaveBeenCalledWith(validId);
      expect(service.findOne).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProdutor);
    });

    it('should handle not found error', async () => {
      const error = new Error('Produtor not found');
      mockProdutorService.findOne.mockRejectedValue(error);

      await expect(controller.findOne(validId)).rejects.toThrow('Produtor not found');
      expect(service.findOne).toHaveBeenCalledWith(validId);
    });

    it('should handle different valid UUID', async () => {
      const anotherId = '550e8400-e29b-41d4-a716-446655440001';
      const anotherProdutor = { ...mockProdutor, id: anotherId };
      mockProdutorService.findOne.mockResolvedValue(anotherProdutor);

      const result = await controller.findOne(anotherId);

      expect(service.findOne).toHaveBeenCalledWith(anotherId);
      expect(result.id).toBe(anotherId);
    });
  });

  describe('update', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should update a produtor successfully', async () => {
      const updateDto: UpdateProdutorDto = {
        nome: 'João Silva Atualizado',
      };

      const updatedProdutor = { ...mockProdutor, ...updateDto };
      mockProdutorService.update.mockResolvedValue(updatedProdutor);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(service.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(updatedProdutor);
    });

    it('should update only cpfCnpj', async () => {
      const updateDto: UpdateProdutorDto = {
        cpfCnpj: '11222333000181',
      };

      const updatedProdutor = { ...mockProdutor, ...updateDto };
      mockProdutorService.update.mockResolvedValue(updatedProdutor);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.cpfCnpj).toBe(updateDto.cpfCnpj);
    });

    it('should update both fields', async () => {
      const updateDto: UpdateProdutorDto = {
        nome: 'Nome Completo Atualizado',
        cpfCnpj: '11222333000181',
      };

      const updatedProdutor = { ...mockProdutor, ...updateDto };
      mockProdutorService.update.mockResolvedValue(updatedProdutor);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result.nome).toBe(updateDto.nome);
      expect(result.cpfCnpj).toBe(updateDto.cpfCnpj);
    });

    it('should handle not found error during update', async () => {
      const updateDto: UpdateProdutorDto = {
        nome: 'João Silva Atualizado',
      };

      const error = new Error('Produtor not found');
      mockProdutorService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('Produtor not found');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle validation errors during update', async () => {
      const updateDto: UpdateProdutorDto = {
        cpfCnpj: '11222333000181',
      };

      const error = new Error('CPF/CNPJ já cadastrado');
      mockProdutorService.update.mockRejectedValue(error);

      await expect(controller.update(validId, updateDto)).rejects.toThrow('CPF/CNPJ já cadastrado');
      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
    });

    it('should handle empty update object', async () => {
      const updateDto: UpdateProdutorDto = {};

      mockProdutorService.update.mockResolvedValue(mockProdutor);

      const result = await controller.update(validId, updateDto);

      expect(service.update).toHaveBeenCalledWith(validId, updateDto);
      expect(result).toEqual(mockProdutor);
    });
  });

  describe('remove', () => {
    const validId = '550e8400-e29b-41d4-a716-446655440000';

    it('should remove a produtor successfully', async () => {
      mockProdutorService.remove.mockResolvedValue(undefined);

      const result = await controller.remove(validId);

      expect(service.remove).toHaveBeenCalledWith(validId);
      expect(service.remove).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });

    it('should handle not found error during removal', async () => {
      const error = new Error('Produtor not found');
      mockProdutorService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Produtor not found');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle cascade deletion constraints', async () => {
      const error = new Error('Cannot delete produtor with associated properties');
      mockProdutorService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow(
        'Cannot delete produtor with associated properties',
      );
      expect(service.remove).toHaveBeenCalledWith(validId);
    });

    it('should handle database errors during removal', async () => {
      const error = new Error('Database error');
      mockProdutorService.remove.mockRejectedValue(error);

      await expect(controller.remove(validId)).rejects.toThrow('Database error');
      expect(service.remove).toHaveBeenCalledWith(validId);
    });
  });

  describe('service injection', () => {
    it('should have produtorService injected', () => {
      expect(service).toBeDefined();
      expect(service).toBe(mockProdutorService);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors without modification', async () => {
      const customError = new Error('Custom service error');
      mockProdutorService.findAll.mockRejectedValue(customError);

      await expect(controller.findAll()).rejects.toThrow('Custom service error');
    });

    it('should handle async operation errors in all methods', async () => {
      const asyncError = new Error('Async operation failed');

      // Test each method handles async errors
      mockProdutorService.create.mockRejectedValue(asyncError);
      mockProdutorService.findAll.mockRejectedValue(asyncError);
      mockProdutorService.findOne.mockRejectedValue(asyncError);
      mockProdutorService.update.mockRejectedValue(asyncError);
      mockProdutorService.remove.mockRejectedValue(asyncError);

      const createDto: CreateProdutorDto = { nome: 'Test', cpfCnpj: '11144477735' };
      const updateDto: UpdateProdutorDto = { nome: 'Test' };
      const id = '550e8400-e29b-41d4-a716-446655440000';

      await expect(controller.create(createDto)).rejects.toThrow('Async operation failed');
      await expect(controller.findAll()).rejects.toThrow('Async operation failed');
      await expect(controller.findOne(id)).rejects.toThrow('Async operation failed');
      await expect(controller.update(id, updateDto)).rejects.toThrow('Async operation failed');
      await expect(controller.remove(id)).rejects.toThrow('Async operation failed');
    });
  });
});
