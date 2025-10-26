import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';
import { PropriedadeService } from './propriedade.service';

describe('PropriedadeService', () => {
  let service: PropriedadeService;
  let propriedadeRepository: jest.Mocked<Repository<PropriedadeRural>>;
  let produtorRepository: jest.Mocked<Repository<Produtor>>;

  const mockProdutor: Produtor = {
    id: '1',
    cpfCnpj: '12345678901',
    nome: 'João Silva',
    propriedades: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPropriedade: PropriedadeRural = {
    id: '1',
    nomeFazenda: 'Fazenda São João',
    cidade: 'Ribeirão Preto',
    estado: 'SP',
    areaTotal: 1000,
    areaAgricultavel: 600,
    areaVegetacao: 400,
    produtores: [mockProdutor],
    cultivos: [],
    safras: [], // Propriedade pode ter múltiplas safras
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPropriedadeRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      remove: jest.fn(),
      findBy: jest.fn(),
    };

    const mockProdutorRepository = {
      findBy: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropriedadeService,
        {
          provide: getRepositoryToken(PropriedadeRural),
          useValue: mockPropriedadeRepository,
        },
        {
          provide: getRepositoryToken(Produtor),
          useValue: mockProdutorRepository,
        },
      ],
    }).compile();

    service = module.get<PropriedadeService>(PropriedadeService);
    propriedadeRepository = module.get(getRepositoryToken(PropriedadeRural));
    produtorRepository = module.get(getRepositoryToken(Produtor));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new propriedade', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda São João',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 1000,
        areaAgricultavel: 600,
        areaVegetacao: 400,
        produtorIds: ['1'],
      };

      const createdPropriedade = { ...mockPropriedade };
      produtorRepository.findBy.mockResolvedValue([mockProdutor]);
      propriedadeRepository.create.mockReturnValue(createdPropriedade);
      propriedadeRepository.save.mockResolvedValue(createdPropriedade);

      const result = await service.create(createDto);

      expect(produtorRepository.findBy).toHaveBeenCalledWith({
        id: In(['1']),
      });
      expect(propriedadeRepository.create).toHaveBeenCalledWith({
        nomeFazenda: 'Fazenda São João',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 1000,
        areaAgricultavel: 600,
        areaVegetacao: 400,
        produtores: [mockProdutor],
      });
      expect(propriedadeRepository.save).toHaveBeenCalledWith(createdPropriedade);
      expect(result).toEqual(createdPropriedade);
    });

    it('should throw BadRequestException when area validation fails', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda São João',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100,
        areaAgricultavel: 600,
        areaVegetacao: 400,
        produtorIds: ['1'],
      };

      // Mock para passar na validação de produtores
      produtorRepository.findBy.mockResolvedValue([mockProdutor]);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException when producers not found', async () => {
      const createDto: CreatePropriedadeDto = {
        nomeFazenda: 'Fazenda São João',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 1000,
        areaAgricultavel: 600,
        areaVegetacao: 400,
        produtorIds: ['1'],
      };

      produtorRepository.findBy.mockResolvedValue([]);

      await expect(service.create(createDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return all propriedades', async () => {
      const propriedades = [mockPropriedade];
      propriedadeRepository.find.mockResolvedValue(propriedades);

      const result = await service.findAll();

      expect(propriedadeRepository.find).toHaveBeenCalledWith({
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
      expect(result).toEqual(propriedades);
    });
  });

  describe('findOne', () => {
    it('should return a propriedade by id', async () => {
      propriedadeRepository.findOne.mockResolvedValue(mockPropriedade);

      const result = await service.findOne('1');

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
      expect(result).toEqual(mockPropriedade);
    });

    it('should throw NotFoundException when propriedade not found', async () => {
      propriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a propriedade', async () => {
      const updateDto: UpdatePropriedadeDto = {
        nomeFazenda: 'Fazenda Atualizada',
      };

      const updatedPropriedade = { ...mockPropriedade, ...updateDto };
      propriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      propriedadeRepository.save.mockResolvedValue(updatedPropriedade);

      const result = await service.update('1', updateDto);

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
      expect(propriedadeRepository.save).toHaveBeenCalledWith({
        ...mockPropriedade,
        ...updateDto,
      });
      expect(result).toEqual(updatedPropriedade);
    });

    it('should throw NotFoundException when propriedade not found', async () => {
      const updateDto: UpdatePropriedadeDto = {
        nomeFazenda: 'Fazenda Atualizada',
      };

      propriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.update('1', updateDto)).rejects.toThrow(NotFoundException);
    });

    it('should update propriedade with new producers', async () => {
      const updateDto: UpdatePropriedadeDto = {
        produtorIds: ['2'],
      };

      const newProdutor: Produtor = {
        id: '2',
        cpfCnpj: '98765432109',
        nome: 'Maria Silva',
        propriedades: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedPropriedade = { ...mockPropriedade, produtores: [newProdutor] };
      propriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      produtorRepository.findBy.mockResolvedValue([newProdutor]);
      propriedadeRepository.save.mockResolvedValue(updatedPropriedade);

      const result = await service.update('1', updateDto);

      expect(produtorRepository.findBy).toHaveBeenCalledWith({
        id: In(['2']),
      });
      expect(propriedadeRepository.save).toHaveBeenCalledWith({
        ...mockPropriedade,
        produtores: [newProdutor],
      });
      expect(result).toEqual(updatedPropriedade);
    });

    it('should throw BadRequestException when new producers not found', async () => {
      const updateDto: UpdatePropriedadeDto = {
        produtorIds: ['2'],
      };

      propriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      produtorRepository.findBy.mockResolvedValue([]);

      await expect(service.update('1', updateDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when area validation fails on update', async () => {
      const updateDto: UpdatePropriedadeDto = {
        areaTotal: 100,
        areaAgricultavel: 600,
        areaVegetacao: 400,
      };

      propriedadeRepository.findOne.mockResolvedValue(mockPropriedade);

      await expect(service.update('1', updateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    it('should remove a propriedade', async () => {
      propriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      propriedadeRepository.remove.mockResolvedValue(mockPropriedade);

      await service.remove('1');

      expect(propriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
      expect(propriedadeRepository.remove).toHaveBeenCalledWith(mockPropriedade);
    });

    it('should throw NotFoundException when propriedade not found', async () => {
      propriedadeRepository.findOne.mockResolvedValue(null);

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findByProdutor', () => {
    it('should return propriedades for a specific produtor', async () => {
      const mockPropriedades = [
        {
          id: '1',
          nomeFazenda: 'Fazenda 1',
          produtores: [{ id: 'produtor1', nome: 'João' }],
        },
        {
          id: '2',
          nomeFazenda: 'Fazenda 2',
          produtores: [{ id: 'produtor1', nome: 'João' }],
        },
      ];

      propriedadeRepository.find.mockResolvedValue(mockPropriedades as any);

      const result = await service.findByProdutor('produtor1');

      expect(result).toEqual(mockPropriedades);
      expect(propriedadeRepository.find).toHaveBeenCalledWith({
        where: {
          produtores: {
            id: 'produtor1',
          },
        },
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
    });
  });
});
