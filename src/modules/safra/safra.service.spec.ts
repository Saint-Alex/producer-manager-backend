import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Safra } from '../../database/entities/safra.entity';
import { CreateSafraDto } from './dto/create-safra.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';
import { SafraService } from './safra.service';

describe('SafraService', () => {
  let service: SafraService;
  let repository: jest.Mocked<Repository<Safra>>;

  const mockSafra: Safra = {
    id: '1',
    ano: 2024,
    nome: 'Safra 2024',
    dataInicio: new Date('2024-01-01'),
    dataFim: new Date('2024-12-31'),
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
        SafraService,
        {
          provide: getRepositoryToken(Safra),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<SafraService>(SafraService);
    repository = module.get(getRepositoryToken(Safra));
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new safra successfully', async () => {
      const createSafraDto: CreateSafraDto = {
        ano: 2025,
        nome: 'Safra 2025',
      };

      const newSafra = { ...mockSafra, ...createSafraDto, id: '2' };

      repository.findOne.mockResolvedValue(null); // Não há conflito
      repository.create.mockReturnValue(newSafra);
      repository.save.mockResolvedValue(newSafra);

      const result = await service.create(createSafraDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { ano: 2025 }
      });
      expect(repository.create).toHaveBeenCalledWith(createSafraDto);
      expect(repository.save).toHaveBeenCalledWith(newSafra);
      expect(result).toEqual(newSafra);
    });

    it('should throw ConflictException when safra for year already exists', async () => {
      const createSafraDto: CreateSafraDto = {
        ano: 2024,
        nome: 'Safra 2024 Duplicada',
      };

      repository.findOne.mockResolvedValue(mockSafra); // Já existe

      await expect(service.create(createSafraDto)).rejects.toThrow(ConflictException);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { ano: 2024 }
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all safras with relations and ordered by year desc', async () => {
      const safras = [mockSafra];
      repository.find.mockResolvedValue(safras);

      const result = await service.findAll();

      expect(repository.find).toHaveBeenCalledWith({
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural'],
        order: { ano: 'DESC' }
      });
      expect(result).toEqual(safras);
    });

    it('should return empty array when no safras exist', async () => {
      repository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return safra by id with relations', async () => {
      repository.findOne.mockResolvedValue(mockSafra);

      const result = await service.findOne('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural']
      });
      expect(result).toEqual(mockSafra);
    });

    it('should throw NotFoundException when safra not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByYear', () => {
    it('should return safra by year with relations', async () => {
      repository.findOne.mockResolvedValue(mockSafra);

      const result = await service.findByYear(2024);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { ano: 2024 },
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural']
      });
      expect(result).toEqual(mockSafra);
    });

    it('should throw NotFoundException when safra for year not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.findByYear(2025)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update safra successfully without year change', async () => {
      const updateSafraDto: UpdateSafraDto = {
        nome: 'Safra 2024 Atualizada',
      };

      const updatedSafra = { ...mockSafra, ...updateSafraDto };

      repository.findOne.mockResolvedValue(mockSafra);
      repository.save.mockResolvedValue(updatedSafra);

      const result = await service.update('1', updateSafraDto);

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural']
      });
      expect(repository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateSafraDto)
      );
      expect(result).toEqual(updatedSafra);
    });

    it('should update safra with new year when no conflict', async () => {
      const updateSafraDto: UpdateSafraDto = {
        ano: 2025,
        nome: 'Safra 2025',
      };

      const updatedSafra = { ...mockSafra, ...updateSafraDto };

      repository.findOne
        .mockResolvedValueOnce(mockSafra) // Para findOne do update
        .mockResolvedValueOnce(null); // Para verificação de conflito - não existe
      repository.save.mockResolvedValue(updatedSafra);

      const result = await service.update('1', updateSafraDto);

      expect(repository.findOne).toHaveBeenCalledTimes(2);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual(updatedSafra);
    });

    it('should throw ConflictException when updating year to existing year', async () => {
      const updateSafraDto: UpdateSafraDto = {
        ano: 2025,
        nome: 'Safra 2025',
      };

      // Mock safra atual com ano diferente
      const currentSafra = {
        ...mockSafra,
        ano: 2024 // Ano diferente do que estamos tentando atualizar
      };

      const existingSafra = {
        id: '2',
        ano: 2025,
        nome: 'Existing Safra',
        dataInicio: new Date(),
        dataFim: new Date(),
        cultivos: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      repository.findOne
        .mockResolvedValueOnce(currentSafra as any) // Para findOne do update
        .mockResolvedValueOnce(existingSafra as any); // Para verificação de conflito - existe

      await expect(service.update('1', updateSafraDto)).rejects.toThrow(
        'Safra para o ano 2025 já existe'
      );
    });

    it('should throw NotFoundException when safra to update not found', async () => {
      const updateSafraDto: UpdateSafraDto = {
        nome: 'Atualizada',
      };

      repository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateSafraDto)).rejects.toThrow(NotFoundException);

      expect(repository.save).not.toHaveBeenCalled();
    });

    it('should not check for year conflict when year is not being updated', async () => {
      const updateSafraDto: UpdateSafraDto = {
        nome: 'Safra Atualizada',
      };

      const updatedSafra = { ...mockSafra, ...updateSafraDto };

      repository.findOne.mockResolvedValue(mockSafra);
      repository.save.mockResolvedValue(updatedSafra);

      const result = await service.update('1', updateSafraDto);

      expect(repository.findOne).toHaveBeenCalledTimes(1); // Apenas o findOne do update
      expect(result).toEqual(updatedSafra);
    });
  });

  describe('remove', () => {
    it('should remove safra successfully', async () => {
      repository.findOne.mockResolvedValue(mockSafra);
      repository.remove.mockResolvedValue(mockSafra);

      await service.remove('1');

      expect(repository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural']
      });
      expect(repository.remove).toHaveBeenCalledWith(mockSafra);
    });

    it('should throw NotFoundException when safra to remove not found', async () => {
      repository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);

      expect(repository.remove).not.toHaveBeenCalled();
    });
  });
});
