import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Safra } from '../src/database/entities/safra.entity';
import { SafraController } from '../src/modules/safra/safra.controller';
import { SafraService } from '../src/modules/safra/safra.service';

describe('SafraController (e2e)', () => {
  let app: INestApplication;
  let safraRepository: Repository<Safra>;

  const mockSafraRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [SafraController],
      providers: [
        SafraService,
        {
          provide: getRepositoryToken(Safra),
          useValue: mockSafraRepository,
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

    safraRepository = moduleFixture.get<Repository<Safra>>(getRepositoryToken(Safra));

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /safras', () => {
    it('should create a safra successfully with valid data', async () => {
      const createSafraDto = {
        nome: 'Safra 2025',
        ano: 2025,
      };

      const mockSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockSafraRepository.findOne.mockResolvedValue(null); // Não existe safra para o ano
      mockSafraRepository.create.mockReturnValue(mockSafra);
      mockSafraRepository.save.mockResolvedValue(mockSafra);

      const response = await request(app.getHttpServer())
        .post('/safras')
        .send(createSafraDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
      });
      expect(mockSafraRepository.findOne).toHaveBeenCalledWith({
        where: { ano: 2025 },
      });
      expect(mockSafraRepository.create).toHaveBeenCalledWith(createSafraDto);
      expect(mockSafraRepository.save).toHaveBeenCalled();
    });

    it('should reject request with invalid year (below minimum)', async () => {
      const invalidDto = {
        nome: 'Safra Antiga',
        ano: 1999, // Below minimum
      };

      await request(app.getHttpServer()).post('/safras').send(invalidDto).expect(400);

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request with invalid year (above maximum)', async () => {
      const invalidDto = {
        nome: 'Safra Futuro',
        ano: 2051, // Above maximum
      };

      await request(app.getHttpServer()).post('/safras').send(invalidDto).expect(400);

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request with empty name', async () => {
      const invalidDto = {
        nome: '', // Empty string
        ano: 2025,
      };

      await request(app.getHttpServer()).post('/safras').send(invalidDto).expect(400);

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request with very long name', async () => {
      const invalidDto = {
        nome: 'a'.repeat(101), // Exceeds 100 character limit
        ano: 2025,
      };

      await request(app.getHttpServer()).post('/safras').send(invalidDto).expect(400);

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request without required fields', async () => {
      const invalidDto = {
        nome: 'Safra 2025',
        // Missing ano field
      };

      await request(app.getHttpServer()).post('/safras').send(invalidDto).expect(400);

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request with non-numeric year', async () => {
      const invalidDto = {
        nome: 'Safra 2025',
        ano: 'not-a-number',
      };

      await request(app.getHttpServer()).post('/safras').send(invalidDto).expect(400);

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
    });

    it('should reject when safra for year already exists', async () => {
      const createSafraDto = {
        nome: 'Safra 2025',
        ano: 2025,
      };

      const existingSafra = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Safra 2025 Existente',
        ano: 2025,
      };

      mockSafraRepository.findOne.mockResolvedValue(existingSafra);

      await request(app.getHttpServer())
        .post('/safras')
        .send(createSafraDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Safra para o ano 2025 já existe');
        });

      expect(mockSafraRepository.create).not.toHaveBeenCalled();
      expect(mockSafraRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('GET /safras', () => {
    it('should return all safras', async () => {
      const mockSafras = [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nome: 'Safra 2025',
          ano: 2025,
          cultivos: [],
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nome: 'Safra 2024',
          ano: 2024,
          cultivos: [],
        },
      ];

      mockSafraRepository.find.mockResolvedValue(mockSafras);

      const response = await request(app.getHttpServer()).get('/safras').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({ nome: 'Safra 2025', ano: 2025 });
      expect(response.body[1]).toMatchObject({ nome: 'Safra 2024', ano: 2024 });
      expect(mockSafraRepository.find).toHaveBeenCalledWith({
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural'],
        order: { ano: 'DESC' },
      });
    });

    it('should return empty array when no safras exist', async () => {
      mockSafraRepository.find.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get('/safras').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /safras/:id', () => {
    it('should return a specific safra', async () => {
      const mockSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        cultivos: [],
      };

      mockSafraRepository.findOne.mockResolvedValue(mockSafra);

      const response = await request(app.getHttpServer())
        .get('/safras/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(response.body).toMatchObject({ nome: 'Safra 2025', ano: 2025 });
      expect(mockSafraRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural'],
      });
    });

    it('should return 404 when safra not found', async () => {
      mockSafraRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/safras/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer()).get('/safras/invalid-uuid').expect(400);
    });
  });

  describe('GET /safras/year/:year', () => {
    it('should return safra for specific year', async () => {
      const mockSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        cultivos: [],
      };

      mockSafraRepository.findOne.mockResolvedValue(mockSafra);

      const response = await request(app.getHttpServer()).get('/safras/year/2025').expect(200);

      expect(response.body).toMatchObject({ nome: 'Safra 2025', ano: 2025 });
      expect(mockSafraRepository.findOne).toHaveBeenCalledWith({
        where: { ano: 2025 },
        relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural'],
      });
    });

    it('should return 404 when safra for year not found', async () => {
      mockSafraRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/safras/year/2020')
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain('Safra para o ano 2020 não encontrada');
        });
    });

    it('should return 400 for invalid year format', async () => {
      await request(app.getHttpServer()).get('/safras/year/invalid-year').expect(400);
    });
  });

  describe('PATCH /safras/:id', () => {
    it('should update a safra successfully', async () => {
      const updateDto = { nome: 'Safra 2025 Atualizada' };
      const existingSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        cultivos: [],
      };
      const updatedSafra = { ...existingSafra, ...updateDto };

      // Mock para findOne usado no service.findOne()
      mockSafraRepository.findOne.mockResolvedValue(existingSafra);
      mockSafraRepository.save.mockResolvedValue(updatedSafra);

      const response = await request(app.getHttpServer())
        .patch('/safras/550e8400-e29b-41d4-a716-446655440000')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({ nome: 'Safra 2025 Atualizada' });
    });

    it('should update safra year successfully when no conflict', async () => {
      const updateDto = { ano: 2026 };
      const existingSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        cultivos: [],
      };
      const updatedSafra = { ...existingSafra, ano: 2026 };

      // Primeira chamada para findOne busca a safra existente
      // Segunda chamada verifica se existe safra para o novo ano (retorna null = não existe)
      mockSafraRepository.findOne.mockResolvedValueOnce(existingSafra).mockResolvedValueOnce(null);
      mockSafraRepository.save.mockResolvedValue(updatedSafra);

      const response = await request(app.getHttpServer())
        .patch('/safras/550e8400-e29b-41d4-a716-446655440000')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({ ano: 2026 });
    });

    it('should reject update when new year conflicts with existing safra', async () => {
      const updateDto = { ano: 2024 };
      const existingSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        cultivos: [],
      };
      const conflictingSafra = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Safra 2024',
        ano: 2024,
      };

      // Primeira chamada para findOne busca a safra existente
      // Segunda chamada verifica se existe safra para o novo ano (retorna conflito)
      mockSafraRepository.findOne
        .mockResolvedValueOnce(existingSafra)
        .mockResolvedValueOnce(conflictingSafra);

      await request(app.getHttpServer())
        .patch('/safras/550e8400-e29b-41d4-a716-446655440000')
        .send(updateDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Safra para o ano 2024 já existe');
        });

      expect(mockSafraRepository.save).not.toHaveBeenCalled();
    });

    it('should reject update with invalid year range', async () => {
      const updateDto = { ano: 1999 };

      await request(app.getHttpServer())
        .patch('/safras/550e8400-e29b-41d4-a716-446655440000')
        .send(updateDto)
        .expect(400);

      expect(mockSafraRepository.save).not.toHaveBeenCalled();
    });

    it('should return 404 when trying to update non-existent safra', async () => {
      const updateDto = { nome: 'Updated Name' };

      mockSafraRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/safras/550e8400-e29b-41d4-a716-446655440999')
        .send(updateDto)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const updateDto = { nome: 'Updated Name' };

      await request(app.getHttpServer()).patch('/safras/invalid-uuid').send(updateDto).expect(400);
    });
  });

  describe('DELETE /safras/:id', () => {
    it('should delete a safra successfully', async () => {
      const existingSafra = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'Safra 2025',
        ano: 2025,
        cultivos: [],
      };

      mockSafraRepository.findOne.mockResolvedValue(existingSafra);
      mockSafraRepository.remove.mockResolvedValue(existingSafra);

      await request(app.getHttpServer())
        .delete('/safras/550e8400-e29b-41d4-a716-446655440000')
        .expect(200);

      expect(mockSafraRepository.remove).toHaveBeenCalledWith(existingSafra);
    });

    it('should return 404 when trying to delete non-existent safra', async () => {
      mockSafraRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/safras/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer()).delete('/safras/invalid-uuid').expect(400);
    });
  });
});
