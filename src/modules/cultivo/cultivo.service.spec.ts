import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Cultura } from '../../database/entities/cultura.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { CultivoService } from './cultivo.service';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';

describe('CultivoService', () => {
  let service: CultivoService;
  let _cultivoRepository: Repository<Cultivo>;
  let _propriedadeRepository: Repository<PropriedadeRural>;
  let _culturaRepository: Repository<Cultura>;
  let _safraRepository: Repository<Safra>;

  const mockCultivoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockPropriedadeRepository = {
    findOne: jest.fn(),
  };

  const mockCulturaRepository = {
    findOne: jest.fn(),
  };

  const mockSafraRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CultivoService,
        {
          provide: getRepositoryToken(Cultivo),
          useValue: mockCultivoRepository,
        },
        {
          provide: getRepositoryToken(PropriedadeRural),
          useValue: mockPropriedadeRepository,
        },
        {
          provide: getRepositoryToken(Cultura),
          useValue: mockCulturaRepository,
        },
        {
          provide: getRepositoryToken(Safra),
          useValue: mockSafraRepository,
        },
      ],
    }).compile();

    service = module.get<CultivoService>(CultivoService);
    _cultivoRepository = module.get<Repository<Cultivo>>(getRepositoryToken(Cultivo));
    _propriedadeRepository = module.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural),
    );
    _culturaRepository = module.get<Repository<Cultura>>(getRepositoryToken(Cultura));
    _safraRepository = module.get<Repository<Safra>>(getRepositoryToken(Safra));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCultivoDto: CreateCultivoDto = {
      propriedadeId: 'prop-uuid',
      culturaId: 'cultura-uuid',
      safraId: 'safra-uuid',
      areaCultivada: 50.5,
    };

    const mockPropriedade = {
      id: 'prop-uuid',
      nomeFazenda: 'Fazenda Teste',
      areaAgricultavel: 100.0,
    };

    const mockCultura = {
      id: 'cultura-uuid',
      nome: 'Soja',
    };

    const mockSafra = {
      id: 'safra-uuid',
      ano: 2025,
    };

    it('should create a cultivo successfully', async () => {
      const mockCultivo = {
        id: 'cultivo-uuid',
        areaPlantada: 50.5,
        propriedadeRural: mockPropriedade,
        cultura: mockCultura,
        safra: mockSafra,
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);
      mockCultivoRepository.findOne.mockResolvedValue(null); // Não existe cultivo duplicado
      mockCultivoRepository.find.mockResolvedValue([]); // Nenhum cultivo existente
      mockCultivoRepository.create.mockReturnValue(mockCultivo);
      mockCultivoRepository.save.mockResolvedValue(mockCultivo);

      const result = await service.create(createCultivoDto);

      expect(result).toEqual(mockCultivo);
      expect(mockPropriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: createCultivoDto.propriedadeId },
      });
      expect(mockCulturaRepository.findOne).toHaveBeenCalledWith({
        where: { id: createCultivoDto.culturaId },
      });
      expect(mockSafraRepository.findOne).toHaveBeenCalledWith({
        where: { id: createCultivoDto.safraId },
      });
      expect(mockCultivoRepository.create).toHaveBeenCalledWith({
        areaPlantada: createCultivoDto.areaCultivada,
        propriedadeRural: mockPropriedade,
        cultura: mockCultura,
        safra: mockSafra,
      });
    });

    it('should throw NotFoundException when propriedade not found', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);

      await expect(service.create(createCultivoDto)).rejects.toThrow(
        new NotFoundException(
          `Propriedade com ID ${createCultivoDto.propriedadeId} não encontrada`,
        ),
      );
    });

    it('should throw NotFoundException when cultura not found', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(null);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);

      await expect(service.create(createCultivoDto)).rejects.toThrow(
        new NotFoundException(`Cultura com ID ${createCultivoDto.culturaId} não encontrada`),
      );
    });

    it('should throw NotFoundException when safra not found', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createCultivoDto)).rejects.toThrow(
        new NotFoundException(`Safra com ID ${createCultivoDto.safraId} não encontrada`),
      );
    });

    it('should throw ConflictException when cultivo already exists', async () => {
      const existingCultivo = {
        id: 'existing-cultivo-uuid',
        areaPlantada: 30.0,
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);
      mockCultivoRepository.findOne.mockResolvedValue(existingCultivo);

      await expect(service.create(createCultivoDto)).rejects.toThrow(
        new ConflictException(
          `Já existe um cultivo de ${mockCultura.nome} na propriedade ${mockPropriedade.nomeFazenda} para a safra ${mockSafra.ano}`,
        ),
      );
    });

    it('should throw BadRequestException when area exceeds propriedade limit', async () => {
      const existingCultivos = [
        { id: 'cultivo1', areaPlantada: 60.0 },
        { id: 'cultivo2', areaPlantada: 30.0 },
      ];

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);
      mockCultivoRepository.findOne.mockResolvedValue(null); // Não existe cultivo duplicado
      mockCultivoRepository.find.mockResolvedValue(existingCultivos); // Já tem 90ha cultivados

      await expect(service.create(createCultivoDto)).rejects.toThrow(
        new BadRequestException(
          'A área cultivada total (140.5ha) excederia a área agricultável da propriedade (100ha)',
        ),
      );
    });

    it('should throw NotFoundException when updating with invalid propriedade', async () => {
      const mockCultivo = {
        id: '1',
        areaCultivada: 100,
        propriedadeRural: { id: '1' },
        cultura: { id: '1' },
        safra: { id: '1' },
      };

      jest.spyOn(mockCultivoRepository, 'findOne').mockResolvedValue(mockCultivo as any);
      jest.spyOn(mockPropriedadeRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update('1', { propriedadeId: '999' })).rejects.toThrow(
        'Propriedade com ID 999 não encontrada',
      );
    });

    it('should throw NotFoundException when updating with invalid cultura', async () => {
      const mockCultivo = {
        id: '1',
        areaCultivada: 100,
        propriedadeRural: { id: '1' },
        cultura: { id: '1' },
        safra: { id: '1' },
      };

      jest.spyOn(mockCultivoRepository, 'findOne').mockResolvedValue(mockCultivo as any);
      jest.spyOn(mockCulturaRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update('1', { culturaId: '999' })).rejects.toThrow(
        'Cultura com ID 999 não encontrada',
      );
    });

    it('should throw NotFoundException when updating with invalid safra', async () => {
      const mockCultivo = {
        id: '1',
        areaCultivada: 100,
        propriedadeRural: { id: '1' },
        cultura: { id: '1' },
        safra: { id: '1' },
      };

      jest.spyOn(mockCultivoRepository, 'findOne').mockResolvedValue(mockCultivo as any);
      jest.spyOn(mockSafraRepository, 'findOne').mockResolvedValue(null);

      await expect(service.update('1', { safraId: '999' })).rejects.toThrow(
        'Safra com ID 999 não encontrada',
      );
    });

    it('should update cultivo with new propriedade when found', async () => {
      const mockCultivo = {
        id: '1',
        areaPlantada: 100,
        propriedadeRural: { id: '1' },
        cultura: { id: '1' },
        safra: { id: '1' },
      };

      const newPropriedade = { id: '2', nomeFazenda: 'Nova Fazenda' };
      const updatedCultivo = { ...mockCultivo, propriedadeRural: newPropriedade };

      jest.spyOn(mockCultivoRepository, 'findOne').mockResolvedValue(mockCultivo as any);
      jest.spyOn(mockPropriedadeRepository, 'findOne').mockResolvedValue(newPropriedade as any);
      jest.spyOn(mockCultivoRepository, 'save').mockResolvedValue(updatedCultivo as any);

      const result = await service.update('1', { propriedadeId: '2' });

      expect(result).toBeDefined();
      expect(mockPropriedadeRepository.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
    });

    it('should update cultivo with new cultura when found', async () => {
      const mockCultivo = {
        id: '1',
        areaPlantada: 100,
        propriedadeRural: { id: '1' },
        cultura: { id: '1' },
        safra: { id: '1' },
      };

      const newCultura = { id: '2', nome: 'Milho' };
      const updatedCultivo = { ...mockCultivo, cultura: newCultura };

      jest.spyOn(mockCultivoRepository, 'findOne').mockResolvedValue(mockCultivo as any);
      jest.spyOn(mockCulturaRepository, 'findOne').mockResolvedValue(newCultura as any);
      jest.spyOn(mockCultivoRepository, 'save').mockResolvedValue(updatedCultivo as any);

      const result = await service.update('1', { culturaId: '2' });

      expect(result).toBeDefined();
      expect(mockCulturaRepository.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
    });

    it('should update cultivo with new safra when found', async () => {
      const mockCultivo = {
        id: '1',
        areaPlantada: 100,
        propriedadeRural: { id: '1' },
        cultura: { id: '1' },
        safra: { id: '1' },
      };

      const newSafra = { id: '2', ano: 2025 };
      const updatedCultivo = { ...mockCultivo, safra: newSafra };

      jest.spyOn(mockCultivoRepository, 'findOne').mockResolvedValue(mockCultivo as any);
      jest.spyOn(mockSafraRepository, 'findOne').mockResolvedValue(newSafra as any);
      jest.spyOn(mockCultivoRepository, 'save').mockResolvedValue(updatedCultivo as any);

      const result = await service.update('1', { safraId: '2' });

      expect(result).toBeDefined();
      expect(mockSafraRepository.findOne).toHaveBeenCalledWith({ where: { id: '2' } });
    });
  });

  describe('findAll', () => {
    it('should return all cultivos with relations', async () => {
      const mockCultivos = [
        {
          id: 'cultivo1',
          areaPlantada: 50.5,
          propriedadeRural: { id: 'prop1', nomeFazenda: 'Fazenda A' },
          cultura: { id: 'cultura1', nome: 'Soja' },
          safra: { id: 'safra1', ano: 2025 },
        },
        {
          id: 'cultivo2',
          areaPlantada: 30.0,
          propriedadeRural: { id: 'prop2', nomeFazenda: 'Fazenda B' },
          cultura: { id: 'cultura2', nome: 'Milho' },
          safra: { id: 'safra1', ano: 2025 },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const result = await service.findAll();

      expect(result).toEqual(mockCultivos);
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no cultivos exist', async () => {
      mockCultivoRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return cultivo by id with relations', async () => {
      const mockCultivo = {
        id: 'cultivo-uuid',
        areaPlantada: 50.5,
        propriedadeRural: { id: 'prop1', nomeFazenda: 'Fazenda A' },
        cultura: { id: 'cultura1', nome: 'Soja' },
        safra: { id: 'safra1', ano: 2025 },
      };

      mockCultivoRepository.findOne.mockResolvedValue(mockCultivo);

      const result = await service.findOne('cultivo-uuid');

      expect(result).toEqual(mockCultivo);
      expect(mockCultivoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'cultivo-uuid' },
        relations: ['propriedadeRural', 'cultura', 'safra'],
      });
    });

    it('should throw NotFoundException when cultivo not found', async () => {
      mockCultivoRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent-uuid')).rejects.toThrow(
        new NotFoundException('Cultivo com ID non-existent-uuid não encontrado'),
      );
    });
  });

  describe('findByPropriedade', () => {
    it('should return cultivos by propriedade id', async () => {
      const mockCultivos = [
        {
          id: 'cultivo1',
          areaPlantada: 50.5,
          propriedadeRural: { id: 'prop-uuid', nomeFazenda: 'Fazenda A' },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const result = await service.findByPropriedade('prop-uuid');

      expect(result).toEqual(mockCultivos);
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        where: { propriedadeRural: { id: 'prop-uuid' } },
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findBySafra', () => {
    it('should return cultivos by safra id', async () => {
      const mockCultivos = [
        {
          id: 'cultivo1',
          areaPlantada: 50.5,
          safra: { id: 'safra-uuid', ano: 2025 },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const result = await service.findBySafra('safra-uuid');

      expect(result).toEqual(mockCultivos);
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        where: { safra: { id: 'safra-uuid' } },
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findByCultura', () => {
    it('should return cultivos by cultura id', async () => {
      const mockCultivos = [
        {
          id: 'cultivo1',
          areaPlantada: 50.5,
          cultura: { id: 'cultura-uuid', nome: 'Soja' },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const result = await service.findByCultura('cultura-uuid');

      expect(result).toEqual(mockCultivos);
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        where: { cultura: { id: 'cultura-uuid' } },
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('update', () => {
    const mockExistingCultivo = {
      id: 'cultivo-uuid',
      areaPlantada: 50.5,
      propriedadeRural: { id: 'prop-uuid', areaAgricultavel: 100.0 },
      cultura: { id: 'cultura-uuid', nome: 'Soja' },
      safra: { id: 'safra-uuid', ano: 2025 },
    };

    it('should update cultivo successfully with area change', async () => {
      const updateDto: UpdateCultivoDto = { areaCultivada: 40.0 };
      const updatedCultivo = { ...mockExistingCultivo, areaPlantada: 40.0 };

      mockCultivoRepository.findOne.mockResolvedValue(mockExistingCultivo);
      mockCultivoRepository.find.mockResolvedValue([]); // Nenhum outro cultivo
      mockCultivoRepository.save.mockResolvedValue(updatedCultivo);

      const result = await service.update('cultivo-uuid', updateDto);

      expect(result).toEqual(updatedCultivo);
      expect(mockCultivoRepository.save).toHaveBeenCalledWith({
        ...mockExistingCultivo,
        areaPlantada: 40.0,
      });
    });

    it('should throw NotFoundException when cultivo not found', async () => {
      const updateDto: UpdateCultivoDto = { areaCultivada: 40.0 };

      mockCultivoRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent-uuid', updateDto)).rejects.toThrow(
        new NotFoundException('Cultivo com ID non-existent-uuid não encontrado'),
      );
    });

    it('should throw NotFoundException when new propriedade not found', async () => {
      const updateDto: UpdateCultivoDto = { propriedadeId: 'new-prop-uuid' };

      mockCultivoRepository.findOne.mockResolvedValue(mockExistingCultivo);
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.update('cultivo-uuid', updateDto)).rejects.toThrow(
        new NotFoundException('Propriedade com ID new-prop-uuid não encontrada'),
      );
    });

    it('should throw NotFoundException when new cultura not found', async () => {
      const updateDto: UpdateCultivoDto = { culturaId: 'new-cultura-uuid' };

      mockCultivoRepository.findOne.mockResolvedValue(mockExistingCultivo);
      mockCulturaRepository.findOne.mockResolvedValue(null);

      await expect(service.update('cultivo-uuid', updateDto)).rejects.toThrow(
        new NotFoundException('Cultura com ID new-cultura-uuid não encontrada'),
      );
    });

    it('should throw NotFoundException when new safra not found', async () => {
      const updateDto: UpdateCultivoDto = { safraId: 'new-safra-uuid' };

      mockCultivoRepository.findOne.mockResolvedValue(mockExistingCultivo);
      mockSafraRepository.findOne.mockResolvedValue(null);

      await expect(service.update('cultivo-uuid', updateDto)).rejects.toThrow(
        new NotFoundException('Safra com ID new-safra-uuid não encontrada'),
      );
    });

    it('should throw BadRequestException when updated area exceeds limit', async () => {
      const updateDto: UpdateCultivoDto = { areaCultivada: 80.0 };
      const existingCultivos = [
        { id: 'other-cultivo', areaPlantada: 40.0 },
        mockExistingCultivo, // Will be excluded from calculation
      ];

      mockCultivoRepository.findOne.mockResolvedValue(mockExistingCultivo);
      mockCultivoRepository.find.mockResolvedValue(existingCultivos);

      await expect(service.update('cultivo-uuid', updateDto)).rejects.toThrow(
        new BadRequestException(
          'A área cultivada total (120ha) excederia a área agricultável da propriedade (100ha)',
        ),
      );
    });
  });

  describe('remove', () => {
    it('should remove cultivo successfully', async () => {
      const mockCultivo = {
        id: 'cultivo-uuid',
        areaPlantada: 50.5,
      };

      mockCultivoRepository.findOne.mockResolvedValue(mockCultivo);
      mockCultivoRepository.remove.mockResolvedValue(mockCultivo);

      await service.remove('cultivo-uuid');

      expect(mockCultivoRepository.remove).toHaveBeenCalledWith(mockCultivo);
    });

    it('should throw NotFoundException when cultivo not found', async () => {
      mockCultivoRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('non-existent-uuid')).rejects.toThrow(
        new NotFoundException('Cultivo com ID non-existent-uuid não encontrado'),
      );
    });
  });
});
