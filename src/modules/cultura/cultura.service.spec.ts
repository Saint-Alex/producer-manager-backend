import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultura } from '../../database/entities/cultura.entity';
import { CulturaService } from './cultura.service';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';

describe('CulturaService', () => {
  let service: CulturaService;
  let repository: jest.Mocked<Repository<Cultura>>;

  const mockCultura: Cultura = {
    id: '1',
    nome: 'Soja',
    descricao: 'Soja para grãos',
    cultivos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CulturaService,
        {
          provide: getRepositoryToken(Cultura),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<CulturaService>(CulturaService);
    repository = module.get(getRepositoryToken(Cultura));

    // Limpar todos os mocks entre os testes
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new cultura successfully', async () => {
      const createCulturaDto: CreateCulturaDto = {
        nome: 'Milho',
      };

      const newCultura = { ...mockCultura, ...createCulturaDto, id: '2' };

      repository.findOne.mockResolvedValue(null); // Não há conflito
      repository.create.mockReturnValue(newCultura);
      repository.save.mockResolvedValue(newCultura);

      const result = await service.create(createCulturaDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { nome: 'Milho' },
      });
      expect(repository.create).toHaveBeenCalledWith(createCulturaDto);
      expect(repository.save).toHaveBeenCalledWith(newCultura);
      expect(result).toEqual(newCultura);
    });

    it('should throw ConflictException when cultura with same name already exists', async () => {
      const createCulturaDto: CreateCulturaDto = {
        nome: 'Soja',
      };

      repository.findOne.mockResolvedValue(mockCultura); // Já existe

      await expect(service.create(createCulturaDto)).rejects.toThrow(ConflictException);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { nome: 'Soja' },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all culturas with relations', async () => {
      const culturas = [mockCultura];
      repository.find.mockResolvedValue(culturas);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['cultivos', 'cultivos.propriedadeRural'],
      });
      expect(result).toEqual(culturas);
    });

    it('should return empty array when no culturas exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return cultura by id with relations', async () => {
      repository.findOne.mockResolvedValue(mockCultura);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos', 'cultivos.propriedadeRural'],
      });
      expect(result).toEqual(mockCultura);
    });

    it('should throw NotFoundException when cultura not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update cultura successfully without name change', async () => {
      const updateCulturaDto: UpdateCulturaDto = {};

      const updatedCultura = { ...mockCultura };

      repository.findOne.mockResolvedValue(mockCultura);
      repository.save.mockResolvedValue(updatedCultura);

      const result = await service.update('1', updateCulturaDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos', 'cultivos.propriedadeRural'],
      });
      expect(repository.save).toHaveBeenCalledWith(mockCultura);
      expect(result).toEqual(updatedCultura);
    });

    it('should update cultura with new name when no conflict', async () => {
      const updateCulturaDto: UpdateCulturaDto = {
        nome: 'Milho',
      };

      const updatedCultura = { ...mockCultura, ...updateCulturaDto };

      repository.findOne
        .mockResolvedValueOnce(mockCultura) // Para findOne do update
        .mockResolvedValueOnce(null); // Para verificação de conflito - não existe
      repository.save.mockResolvedValue(updatedCultura);

      const result = await service.update('1', updateCulturaDto);

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedCultura);
    });

    it('should throw NotFoundException when cultura to update not found', async () => {
      const updateCulturaDto: UpdateCulturaDto = {
        nome: 'Atualizada',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateCulturaDto)).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should not check for name conflict when name is not being updated', async () => {
      const updateCulturaDto: UpdateCulturaDto = {};

      const updatedCultura = { ...mockCultura };

      repository.findOne.mockResolvedValue(mockCultura);
      repository.save.mockResolvedValue(updatedCultura);

      const result = await service.update('1', updateCulturaDto);

      expect(repository.findOne).toHaveBeenCalledTimes(1); // Apenas o findOne do update
      expect(result).toEqual(updatedCultura);
    });

    it('should throw ConflictException when updating to existing name', async () => {
      const updateCulturaDto: UpdateCulturaDto = {
        nome: 'Milho',
      };

      // Mock cultura atual com nome diferente
      const currentCultura = {
        ...mockCultura,
        nome: 'Soja', // Nome diferente do que estamos tentando atualizar
      };

      const existingCultura = {
        id: '2',
        nome: 'Milho',
        cultivos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      repository.findOne
        .mockResolvedValueOnce(currentCultura as any) // Para findOne do update
        .mockResolvedValueOnce(existingCultura as any); // Para verificação de conflito - existe

      await expect(service.update('1', updateCulturaDto)).rejects.toThrow(
        "Cultura com nome 'Milho' já existe",
      );
    });
  });

  describe('remove', () => {
    it('should remove cultura successfully', async () => {
      repository.findOne.mockResolvedValue(mockCultura);
      repository.remove.mockResolvedValue(mockCultura);

      await service.remove('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos', 'cultivos.propriedadeRural'],
      });
      expect(repository.remove).toHaveBeenCalledWith(mockCultura);
    });

    it('should throw NotFoundException when cultura to remove not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
