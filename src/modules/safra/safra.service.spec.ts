import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { CreateSafraDto } from './dto/create-safra.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';
import { SafraService } from './safra.service';

describe('SafraService', () => {
  let service: SafraService;
  let safraRepository: jest.Mocked<Repository<Safra>>;
  let propriedadeRepository: jest.Mocked<Repository<PropriedadeRural>>;
  let cultivoRepository: jest.Mocked<Repository<Cultivo>>;

  const mockPropriedadeRural: PropriedadeRural = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nomeFazenda: 'Fazenda Teste',
    cidade: 'São Paulo',
    estado: 'SP',
    areaTotal: 1000.0,
    areaAgricultavel: 800.0,
    areaVegetacao: 200.0,
    createdAt: new Date(),
    updatedAt: new Date(),
    produtores: [],
    cultivos: [],
    safras: [],
  };

  const mockCultivo: Cultivo = {
    id: 'cultivo1',
    areaPlantada: 100,
    propriedadeRural: null,
    safra: null,
    cultura: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSafra: Safra = {
    id: '1',
    ano: 2024,
    nome: 'Safra 2024',
    dataInicio: new Date('2024-01-01'),
    dataFim: new Date('2024-12-31'),
    propriedadeRural: mockPropriedadeRural,
    cultivos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockSafraRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
    };

    const mockPropriedadeRepository = {
      findOne: jest.fn(),
    };

    const mockCultivoRepository = {
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SafraService,
        {
          provide: getRepositoryToken(Safra),
          useValue: mockSafraRepository,
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

    service = module.get<SafraService>(SafraService);
    safraRepository = module.get(getRepositoryToken(Safra));
    propriedadeRepository = module.get(getRepositoryToken(PropriedadeRural));
    cultivoRepository = module.get(getRepositoryToken(Cultivo));
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
        propriedadeRuralId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const propriedadeSemSafra = { ...mockPropriedadeRural, safra: null };
      const newSafra = {
        ...mockSafra,
        ...createSafraDto,
        id: '2',
        propriedadeRural: propriedadeSemSafra,
      };

      propriedadeRepository.findOne.mockResolvedValue(propriedadeSemSafra);
      safraRepository.create.mockReturnValue(newSafra);
      safraRepository.save.mockResolvedValue(newSafra);

      const result = await service.create(createSafraDto);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['safras'],
      });
      expect(safraRepository.create).toHaveBeenCalledWith({
        nome: createSafraDto.nome,
        ano: createSafraDto.ano,
        propriedadeRural: propriedadeSemSafra,
      });
      expect(safraRepository.save).toHaveBeenCalledWith(newSafra);
      expect(result).toEqual(newSafra);
    });

    it('should throw ConflictException when propriedade already has safra for the same year', async () => {
      const createSafraDto: CreateSafraDto = {
        ano: 2024,
        nome: 'Safra 2024 Duplicada',
        propriedadeRuralId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const propriedadeComSafra = { ...mockPropriedadeRural, safras: [mockSafra] };
      propriedadeRepository.findOne.mockResolvedValue(propriedadeComSafra);

      // Mock for the safra existence check by year
      safraRepository.findOne.mockResolvedValue(mockSafra);

      await expect(service.create(createSafraDto)).rejects.toThrow(ConflictException);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '123e4567-e89b-12d3-a456-426614174000' },
        relations: ['safras'],
      });
      expect(safraRepository.findOne).toHaveBeenCalledWith({
        where: {
          propriedadeRural: { id: '123e4567-e89b-12d3-a456-426614174000' },
          ano: 2024,
        },
      });
      expect(safraRepository.create).not.toHaveBeenCalled();
      expect(safraRepository.save).not.toHaveBeenCalled();
    });

    it('should allow creating multiple safras for same propriedade with different years', async () => {
      const createSafraDto: CreateSafraDto = {
        ano: 2025, // Different year
        nome: 'Safra 2025',
        propriedadeRuralId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const propriedadeComSafra = { ...mockPropriedadeRural, safras: [mockSafra] }; // Has 2024 safra
      propriedadeRepository.findOne.mockResolvedValue(propriedadeComSafra);

      // No existing safra for 2025
      safraRepository.findOne.mockResolvedValue(null);

      const newSafra = { ...mockSafra, ano: 2025, nome: 'Safra 2025' };
      safraRepository.create.mockReturnValue(newSafra);
      safraRepository.save.mockResolvedValue(newSafra);

      const result = await service.create(createSafraDto);

      expect(safraRepository.findOne).toHaveBeenCalledWith({
        where: {
          propriedadeRural: { id: '123e4567-e89b-12d3-a456-426614174000' },
          ano: 2025,
        },
      });
      expect(safraRepository.create).toHaveBeenCalledWith({
        nome: createSafraDto.nome,
        ano: createSafraDto.ano,
        propriedadeRural: propriedadeComSafra,
      });
      expect(result).toEqual(newSafra);
    });

    it('should throw NotFoundException when propriedade not found', async () => {
      const createSafraDto: CreateSafraDto = {
        ano: 2025,
        nome: 'Safra 2025',
        propriedadeRuralId: 'invalid-id',
      };

      propriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createSafraDto)).rejects.toThrow(NotFoundException);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'invalid-id' },
        relations: ['safras'],
      });
      expect(safraRepository.create).not.toHaveBeenCalled();
      expect(safraRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return all safras with relations and ordered by year desc', async () => {
      const safras = [mockSafra];
      safraRepository.find.mockResolvedValue(safras);

      const result = await service.findAll();

      expect(safraRepository.find).toHaveBeenCalledWith({
        relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
        order: { ano: 'DESC' },
      });
      expect(result).toEqual(safras);
    });

    it('should return empty array when no safras exist', async () => {
      safraRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return safra by id with relations', async () => {
      safraRepository.findOne.mockResolvedValue(mockSafra);

      const result = await service.findOne('1');

      expect(safraRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
      });
      expect(result).toEqual(mockSafra);
    });

    it('should throw NotFoundException when safra not found', async () => {
      safraRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('999')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByYear', () => {
    it('should return safras by year with relations', async () => {
      const safras = [mockSafra];
      safraRepository.find.mockResolvedValue(safras);

      const result = await service.findByYear(2024);

      expect(safraRepository.find).toHaveBeenCalledWith({
        where: { ano: 2024 },
        relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
      });
      expect(result).toEqual(safras);
    });

    it('should return empty array when no safras found for year', async () => {
      safraRepository.find.mockResolvedValue([]);

      const result = await service.findByYear(2025);

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update safra successfully', async () => {
      const updateSafraDto: UpdateSafraDto = {
        nome: 'Safra 2024 Atualizada',
      };

      const updatedSafra = { ...mockSafra, ...updateSafraDto };

      safraRepository.findOne.mockResolvedValue(mockSafra);
      safraRepository.save.mockResolvedValue(updatedSafra);

      const result = await service.update('1', updateSafraDto);

      expect(safraRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
      });
      expect(safraRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateSafraDto));
      expect(result).toEqual(updatedSafra);
    });

    it('should throw NotFoundException when safra to update not found', async () => {
      const updateSafraDto: UpdateSafraDto = {
        nome: 'Atualizada',
      };

      safraRepository.findOne.mockResolvedValue(null);

      await expect(service.update('999', updateSafraDto)).rejects.toThrow(NotFoundException);

      expect(safraRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove safra successfully', async () => {
      const mockCultivos = [mockCultivo];
      const safraWithCultivos = { ...mockSafra, cultivos: mockCultivos };

      safraRepository.findOne.mockResolvedValue(safraWithCultivos);
      cultivoRepository.remove.mockResolvedValue(undefined);
      safraRepository.remove.mockResolvedValue(safraWithCultivos);

      await service.remove('1');

      expect(safraRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos'],
      });
      expect(cultivoRepository.remove).toHaveBeenCalledWith(mockCultivos);
      expect(safraRepository.remove).toHaveBeenCalledWith(safraWithCultivos);
    });

    it('should remove safra without cultivos successfully', async () => {
      const safraWithoutCultivos = { ...mockSafra, cultivos: [] };

      safraRepository.findOne.mockResolvedValue(safraWithoutCultivos);
      safraRepository.remove.mockResolvedValue(safraWithoutCultivos);

      await service.remove('1');

      expect(safraRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['cultivos'],
      });
      expect(cultivoRepository.remove).not.toHaveBeenCalled();
      expect(safraRepository.remove).toHaveBeenCalledWith(safraWithoutCultivos);
    });

    it('should throw NotFoundException when safra to remove not found', async () => {
      safraRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('999')).rejects.toThrow(NotFoundException);

      expect(safraRepository.remove).not.toHaveBeenCalled();
      expect(cultivoRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe('findByPropriedade', () => {
    it('should return safras by propriedade id', async () => {
      safraRepository.find.mockResolvedValue([mockSafra]);

      const result = await service.findByPropriedade('123e4567-e89b-12d3-a456-426614174000');

      expect(safraRepository.find).toHaveBeenCalledWith({
        where: { propriedadeRural: { id: '123e4567-e89b-12d3-a456-426614174000' } },
        relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
        order: { ano: 'DESC' },
      });
      expect(result).toEqual([mockSafra]);
    });

    it('should return empty array when no safra found for propriedade', async () => {
      safraRepository.find.mockResolvedValue([]);

      const result = await service.findByPropriedade('invalid-id');

      expect(result).toEqual([]);
    });
  });
});
