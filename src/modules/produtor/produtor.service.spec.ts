import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { CreateProdutorDto, UpdateProdutorDto } from './dto';
import { ProdutorService } from './produtor.service';

describe('ProdutorService', () => {
  let service: ProdutorService;
  let _repository: Repository<Produtor>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    manager: {
      connection: {
        createQueryRunner: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutorService,
        {
          provide: getRepositoryToken(Produtor),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<ProdutorService>(ProdutorService);
    _repository = module.get<Repository<Produtor>>(getRepositoryToken(Produtor));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createProdutorDto: CreateProdutorDto = {
      nome: 'João Silva',
      cpfCnpj: '12345678901',
    };

    it('should create a producer successfully', async () => {
      const expectedProdutor = { id: '1', ...createProdutorDto, createdAt: new Date() };

      mockRepository.findOne.mockResolvedValue(null); // No existing producer
      mockRepository.create.mockReturnValue(expectedProdutor);
      mockRepository.save.mockResolvedValue(expectedProdutor);

      const result = await service.create(createProdutorDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpfCnpj: createProdutorDto.cpfCnpj },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createProdutorDto);
      expect(mockRepository.save).toHaveBeenCalledWith(expectedProdutor);
      expect(result).toEqual(expectedProdutor);
    });

    it('should throw BadRequestException if CPF/CNPJ already exists', async () => {
      const existingProdutor = { id: '2', ...createProdutorDto };

      mockRepository.findOne.mockResolvedValue(existingProdutor);

      await expect(service.create(createProdutorDto)).rejects.toThrow(
        new BadRequestException('CPF/CNPJ já está cadastrado'),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpfCnpj: createProdutorDto.cpfCnpj },
      });
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of producers', async () => {
      const expectedProducers = [
        { id: '1', nome: 'João Silva', cpfCnpj: '12345678901' },
        { id: '2', nome: 'Maria Santos', cpfCnpj: '98765432100' },
      ];

      mockRepository.find.mockResolvedValue(expectedProducers);

      const result = await service.findAll();

      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['propriedades'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(expectedProducers);
    });

    it('should return empty array when no producers exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    const produtorId = '1';

    it('should return a producer when found', async () => {
      const expectedProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
        propriedades: [],
      };

      mockRepository.findOne.mockResolvedValue(expectedProdutor);

      const result = await service.findOne(produtorId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: produtorId },
        relations: ['propriedades'],
      });
      expect(result).toEqual(expectedProdutor);
    });

    it('should throw NotFoundException when producer not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(produtorId)).rejects.toThrow(
        new NotFoundException(`Produtor com ID ${produtorId} não encontrado`),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: produtorId },
        relations: ['propriedades'],
      });
    });
  });

  describe('update', () => {
    const produtorId = '1';
    const updateProdutorDto: UpdateProdutorDto = {
      nome: 'João Silva Updated',
    };

    it('should update a producer successfully', async () => {
      const existingProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
      };
      const updatedProdutor = { ...existingProdutor, ...updateProdutorDto };

      // Mock findOne for the update method
      jest.spyOn(service, 'findOne').mockResolvedValue(existingProdutor as Produtor);
      mockRepository.save.mockResolvedValue(updatedProdutor);

      const result = await service.update(produtorId, updateProdutorDto);

      expect(service.findOne).toHaveBeenCalledWith(produtorId);
      expect(mockRepository.save).toHaveBeenCalledWith({
        ...existingProdutor,
        ...updateProdutorDto,
      });
      expect(result).toEqual(updatedProdutor);
    });

    it('should throw NotFoundException when trying to update non-existent producer', async () => {
      jest
        .spyOn(service, 'findOne')
        .mockRejectedValue(new NotFoundException(`Produtor com ID ${produtorId} não encontrado`));

      await expect(service.update(produtorId, updateProdutorDto)).rejects.toThrow(
        new NotFoundException(`Produtor com ID ${produtorId} não encontrado`),
      );

      expect(service.findOne).toHaveBeenCalledWith(produtorId);
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when updating to existing CPF/CNPJ', async () => {
      const existingProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
      };
      const updateDto = {
        cpfCnpj: '98765432100', // Different CPF/CNPJ
      };
      const conflictingProdutor = {
        id: '2',
        nome: 'Maria Santos',
        cpfCnpj: '98765432100',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProdutor as Produtor);
      mockRepository.findOne.mockResolvedValue(conflictingProdutor);

      await expect(service.update(produtorId, updateDto)).rejects.toThrow(
        new BadRequestException('CPF/CNPJ já está cadastrado'),
      );

      expect(service.findOne).toHaveBeenCalledWith(produtorId);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpfCnpj: updateDto.cpfCnpj },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should update successfully when CPF/CNPJ is the same', async () => {
      const existingProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
      };
      const updateDto = {
        nome: 'João Silva Updated',
        cpfCnpj: '12345678901', // Same CPF/CNPJ
      };
      const updatedProdutor = { ...existingProdutor, ...updateDto };

      jest.spyOn(service, 'findOne').mockResolvedValue(existingProdutor as Produtor);
      mockRepository.save.mockResolvedValue(updatedProdutor);

      const result = await service.update(produtorId, updateDto);

      expect(service.findOne).toHaveBeenCalledWith(produtorId);
      expect(mockRepository.findOne).not.toHaveBeenCalled(); // Should not check for existing CPF/CNPJ
      expect(mockRepository.save).toHaveBeenCalledWith({ ...existingProdutor, ...updateDto });
      expect(result).toEqual(updatedProdutor);
    });
  });

  describe('remove', () => {
    const produtorId = '1';

    it('should remove a producer successfully', async () => {
      const existingProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
        propriedades: [],
      };

      // Mock findOne to return the producer
      mockRepository.findOne.mockResolvedValue(existingProdutor);

      // Mock queryBuilder
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      // Mock queryRunner and transaction methods
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          delete: jest.fn(),
          remove: jest.fn(),
          createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        },
      };

      // Configure the mock to return the mockQueryRunner
      mockRepository.manager.connection.createQueryRunner.mockReturnValue(mockQueryRunner);

      await service.remove(produtorId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: produtorId },
        relations: ['propriedades', 'propriedades.cultivos'],
      });
      expect(mockQueryRunner.connect).toHaveBeenCalled();
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it('should throw NotFoundException when trying to remove non-existent producer', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(produtorId)).rejects.toThrow(
        new NotFoundException(`Produtor com ID ${produtorId} não encontrado`),
      );

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: produtorId },
        relations: ['propriedades', 'propriedades.cultivos'],
      });
    });

    it('should handle removal of producer with propriedades and cultivos', async () => {
      const existingProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
        propriedades: [
          {
            id: 'prop1',
            nomeFazenda: 'Fazenda A',
            cultivos: [
              { id: 'cultivo1', areaPlantada: 50 },
              { id: 'cultivo2', areaPlantada: 30 },
            ],
          },
          {
            id: 'prop2',
            nomeFazenda: 'Fazenda B',
            cultivos: [],
          },
        ],
      };

      mockRepository.findOne.mockResolvedValue(existingProdutor);

      // Mock queryBuilder
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
        select: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ count: '0' }), // No other producers
      };

      // Mock queryRunner and transaction methods
      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          delete: jest.fn(),
          remove: jest.fn(),
          createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
        },
      };

      mockRepository.manager.connection.createQueryRunner.mockReturnValue(mockQueryRunner);

      await service.remove(produtorId);

      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith('Cultivo', {
        propriedadeRural: { id: 'prop1' },
      });
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith('PropriedadeRural', {
        id: 'prop1',
      });
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith('PropriedadeRural', {
        id: 'prop2',
      });
      expect(mockQueryRunner.manager.delete).toHaveBeenCalledWith('Produtor', { id: produtorId });
    });

    it('should rollback transaction on error during removal', async () => {
      const existingProdutor = {
        id: produtorId,
        nome: 'João Silva',
        cpfCnpj: '12345678901',
        propriedades: [],
      };

      mockRepository.findOne.mockResolvedValue(existingProdutor);

      const mockQueryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          delete: jest.fn().mockRejectedValue(new Error('Database error')),
          createQueryBuilder: jest.fn().mockReturnValue({
            delete: jest.fn().mockReturnThis(),
            from: jest.fn().mockReturnThis(),
            where: jest.fn().mockReturnThis(),
            execute: jest.fn().mockResolvedValue({ affected: 1 }),
          }),
        },
      };

      mockRepository.manager.connection.createQueryRunner.mockReturnValue(mockQueryRunner);

      await expect(service.remove(produtorId)).rejects.toThrow('Database error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('findByCpfCnpj', () => {
    const cpfCnpj = '12345678901';

    it('should return producer when found by CPF/CNPJ', async () => {
      const expectedProdutor = {
        id: '1',
        nome: 'João Silva',
        cpfCnpj: cpfCnpj,
        propriedades: [],
      };

      mockRepository.findOne.mockResolvedValue(expectedProdutor);

      const result = await service.findByCpfCnpj(cpfCnpj);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpfCnpj },
        relations: ['propriedades'],
      });
      expect(result).toEqual(expectedProdutor);
    });

    it('should return null when producer not found by CPF/CNPJ', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.findByCpfCnpj(cpfCnpj);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpfCnpj },
        relations: ['propriedades'],
      });
      expect(result).toBeNull();
    });
  });
});
