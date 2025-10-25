import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Produtor } from '../src/database/entities/produtor.entity';
import { ProdutorController } from '../src/modules/produtor/produtor.controller';
import { ProdutorService } from '../src/modules/produtor/produtor.service';

describe('ProdutorController (e2e)', () => {
  let app: INestApplication;
  let produtorRepository: Repository<Produtor>;

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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [ProdutorController],
      providers: [
        ProdutorService,
        {
          provide: getRepositoryToken(Produtor),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    produtorRepository = moduleFixture.get<Repository<Produtor>>(getRepositoryToken(Produtor));

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /produtores', () => {
    it('should create a produtor successfully with valid CPF', async () => {
      const createProdutorDto = {
        nome: 'João Silva',
        cpfCnpj: '11144477735', // CPF válido para teste
      };

      const mockProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'João Silva',
        cpfCnpj: '11144477735',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null); // No existing producer
      mockRepository.create.mockReturnValue(mockProdutor);
      mockRepository.save.mockResolvedValue(mockProdutor);

      const response = await request(app.getHttpServer())
        .post('/produtores')
        .send(createProdutorDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'João Silva',
        cpfCnpj: '11144477735',
      });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { cpfCnpj: '11144477735' },
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createProdutorDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should create a produtor successfully with valid CNPJ', async () => {
      const createProdutorDto = {
        nome: 'Fazenda São José LTDA',
        cpfCnpj: '11222333000181', // CNPJ válido para teste
      };

      const mockProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Fazenda São José LTDA',
        cpfCnpj: '11222333000181',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockProdutor);
      mockRepository.save.mockResolvedValue(mockProdutor);

      const response = await request(app.getHttpServer())
        .post('/produtores')
        .send(createProdutorDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Fazenda São José LTDA',
        cpfCnpj: '11222333000181',
      });
    });

    it('should reject request with duplicate CPF/CNPJ', async () => {
      const createProdutorDto = {
        nome: 'João Silva',
        cpfCnpj: '11144477735',
      };

      const existingProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        nome: 'Existing Producer',
        cpfCnpj: '11144477735',
      };

      mockRepository.findOne.mockResolvedValue(existingProdutor);

      await request(app.getHttpServer())
        .post('/produtores')
        .send(createProdutorDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('CPF/CNPJ já está cadastrado');
        });

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request without required nome field', async () => {
      const invalidDto = {
        cpfCnpj: '11144477735',
      };

      await request(app.getHttpServer()).post('/produtores').send(invalidDto).expect(400);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request without required cpfCnpj field', async () => {
      const invalidDto = {
        nome: 'João Silva',
      };

      await request(app.getHttpServer()).post('/produtores').send(invalidDto).expect(400);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request with invalid CPF/CNPJ length', async () => {
      const invalidDto = {
        nome: 'João Silva',
        cpfCnpj: '123', // Too short
      };

      await request(app.getHttpServer()).post('/produtores').send(invalidDto).expect(400);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request with empty nome', async () => {
      const invalidDto = {
        nome: '',
        cpfCnpj: '11144477735',
      };

      await request(app.getHttpServer()).post('/produtores').send(invalidDto).expect(400);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('GET /produtores', () => {
    it('should return all produtores', async () => {
      const mockProdutores = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nome: 'João Silva',
          cpfCnpj: '11144477735',
          createdAt: new Date(),
          propriedades: [],
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nome: 'Maria Santos',
          cpfCnpj: '98765432100',
          createdAt: new Date(),
          propriedades: [],
        },
      ];

      mockRepository.find.mockResolvedValue(mockProdutores);

      const response = await request(app.getHttpServer()).get('/produtores').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({ nome: 'João Silva' });
      expect(response.body[1]).toMatchObject({ nome: 'Maria Santos' });
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['propriedades'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no produtores exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get('/produtores').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /produtores/:id', () => {
    it('should return a specific produtor', async () => {
      const mockProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'João Silva',
        cpfCnpj: '11144477735',
        createdAt: new Date(),
        propriedades: [],
      };

      mockRepository.findOne.mockResolvedValue(mockProdutor);

      const response = await request(app.getHttpServer())
        .get('/produtores/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body).toMatchObject({ nome: 'João Silva' });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
        relations: ['propriedades'],
      });
    });

    it('should return 404 when produtor not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/produtores/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });

  describe('PATCH /produtores/:id', () => {
    it('should update a produtor successfully', async () => {
      const updateDto = { nome: 'João Silva Updated' };
      const existingProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'João Silva',
        cpfCnpj: '11144477735',
        createdAt: new Date(),
        propriedades: [],
      };
      const updatedProdutor = { ...existingProdutor, ...updateDto };

      // Mock para findOne no update method
      mockRepository.findOne.mockResolvedValue(existingProdutor);
      mockRepository.save.mockResolvedValue(updatedProdutor);

      const response = await request(app.getHttpServer())
        .patch('/produtores/550e8400-e29b-41d4-a716-446655440000')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({ nome: 'João Silva Updated' });
    });

    it('should return 404 when trying to update non-existent produtor', async () => {
      const updateDto = { nome: 'João Silva Updated' };

      mockRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/produtores/550e8400-e29b-41d4-a716-446655440999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /produtores/:id', () => {
    it('should delete a produtor successfully', async () => {
      const existingProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'João Silva',
        cpfCnpj: '11144477735',
        createdAt: new Date(),
        propriedades: [],
      };

      // Mock para findOne
      mockRepository.findOne.mockResolvedValue(existingProdutor);

      // Mock queryBuilder para cascata de exclusão
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

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

      await request(app.getHttpServer())
        .delete('/produtores/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
        relations: ['propriedades', 'propriedades.cultivos'],
      });
    });

    it('should return 404 when trying to delete non-existent produtor', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/produtores/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });
});
