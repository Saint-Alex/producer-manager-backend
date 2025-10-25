import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Cultura } from '../src/database/entities/cultura.entity';
import { CulturaController } from '../src/modules/cultura/cultura.controller';
import { CulturaService } from '../src/modules/cultura/cultura.service';

describe('CulturaController (e2e)', () => {
  let app: INestApplication;
  let culturaRepository: Repository<Cultura>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CulturaController],
      providers: [
        CulturaService,
        {
          provide: getRepositoryToken(Cultura),
          useValue: mockRepository,
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }));

    culturaRepository = moduleFixture.get<Repository<Cultura>>(getRepositoryToken(Cultura));

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /culturas', () => {
    it('should create a cultura successfully with valid data', async () => {
      const createCulturaDto = {
        nome: 'Soja',
      };

      const mockCultura = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Soja',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockRepository.create.mockReturnValue(mockCultura);
      mockRepository.save.mockResolvedValue(mockCultura);

      const response = await request(app.getHttpServer())
        .post('/culturas')
        .send(createCulturaDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Soja',
      });
      expect(mockRepository.create).toHaveBeenCalledWith(createCulturaDto);
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should reject request with extra properties (like empty descricao)', async () => {
      const invalidDto = {
        nome: 'Mamão',
        descricao: '', // This should be rejected
      };

      await request(app.getHttpServer())
        .post('/culturas')
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('property descricao should not exist');
        });

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request without required nome field', async () => {
      const invalidDto = {};

      await request(app.getHttpServer())
        .post('/culturas')
        .send(invalidDto)
        .expect(400);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request with invalid nome (empty string)', async () => {
      const invalidDto = {
        nome: '',
      };

      await request(app.getHttpServer())
        .post('/culturas')
        .send(invalidDto)
        .expect(400);

      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('GET /culturas', () => {
    it('should return all culturas', async () => {
      const mockCulturas = [
        { id: '550e8400-e29b-41d4-a716-446655440000', nome: 'Soja', createdAt: new Date() },
        { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Milho', createdAt: new Date() },
      ];

      mockRepository.find.mockResolvedValue(mockCulturas);

      const response = await request(app.getHttpServer())
        .get('/culturas')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({ nome: 'Soja' });
      expect(response.body[1]).toMatchObject({ nome: 'Milho' });
    });

    it('should return empty array when no culturas exist', async () => {
      mockRepository.find.mockResolvedValue([]);

      const response = await request(app.getHttpServer())
        .get('/culturas')
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /culturas/:id', () => {
    it('should return a specific cultura', async () => {
      const mockCultura = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Soja',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(mockCultura);

      const response = await request(app.getHttpServer())
        .get('/culturas/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body).toMatchObject({ nome: 'Soja' });
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
        relations: ['cultivos', 'cultivos.propriedadeRural'],
      });
    });

    it('should return 404 when cultura not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/culturas/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });

  describe('PATCH /culturas/:id', () => {
    it('should update a cultura successfully', async () => {
      const updateDto = { nome: 'Soja Editada' };
      const existingCultura = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Soja',
        createdAt: new Date(),
      };
      const updatedCultura = { ...existingCultura, ...updateDto };

      // Mock para findOne (verificar se cultura existe)
      mockRepository.findOne
        .mockResolvedValueOnce(existingCultura) // Para o findOne do update()
        .mockResolvedValueOnce(null); // Para verificar se nome já existe

      mockRepository.save.mockResolvedValue(updatedCultura);

      const response = await request(app.getHttpServer())
        .patch('/culturas/550e8400-e29b-41d4-a716-446655440000')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({ nome: 'Soja Editada' });
    });
  });

  describe('DELETE /culturas/:id', () => {
    it('should delete a cultura successfully', async () => {
      const existingCultura = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Soja',
        createdAt: new Date(),
      };

      mockRepository.findOne.mockResolvedValue(existingCultura);
      mockRepository.remove.mockResolvedValue(existingCultura);

      await request(app.getHttpServer())
        .delete('/culturas/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(mockRepository.remove).toHaveBeenCalledWith(existingCultura);
    });

    it('should return 404 when trying to delete non-existent cultura', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/culturas/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });
});
