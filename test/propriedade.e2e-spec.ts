import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Produtor } from '../src/database/entities/produtor.entity';
import { PropriedadeRural } from '../src/database/entities/propriedade-rural.entity';
import { PropriedadeController } from '../src/modules/propriedade/propriedade.controller';
import { PropriedadeService } from '../src/modules/propriedade/propriedade.service';

describe('PropriedadeController (e2e)', () => {
  let app: INestApplication;
  let _propriedadeRepository: Repository<PropriedadeRural>;
  let _produtorRepository: Repository<Produtor>;

  const mockPropriedadeRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockProdutorRepository = {
    findBy: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [PropriedadeController],
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    _propriedadeRepository = moduleFixture.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural),
    );
    _produtorRepository = moduleFixture.get<Repository<Produtor>>(getRepositoryToken(Produtor));

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /propriedades', () => {
    it('should create a propriedade successfully with valid data', async () => {
      const createPropriedadeDto = {
        nomeFazenda: 'Fazenda Boa Vista',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
      };

      const mockProdutor = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nome: 'João Silva',
        cpfCnpj: '11144477735',
      };

      const mockPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nomeFazenda: 'Fazenda Boa Vista',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
        produtores: [mockProdutor],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockProdutorRepository.findBy.mockResolvedValue([mockProdutor]);
      mockPropriedadeRepository.create.mockReturnValue(mockPropriedade);
      mockPropriedadeRepository.save.mockResolvedValue(mockPropriedade);

      const response = await request(app.getHttpServer())
        .post('/propriedades')
        .send(createPropriedadeDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440001',
        nomeFazenda: 'Fazenda Boa Vista',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
      });
      expect(mockProdutorRepository.findBy).toHaveBeenCalledWith({
        id: expect.anything(), // In(['550e8400-e29b-41d4-a716-446655440000'])
      });
      expect(mockPropriedadeRepository.create).toHaveBeenCalled();
      expect(mockPropriedadeRepository.save).toHaveBeenCalled();
    });

    it('should reject request with invalid area validation (sum > total)', async () => {
      const invalidDto = {
        nomeFazenda: 'Fazenda Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 70.0,
        areaVegetacao: 50.0, // 70 + 50 = 120 > 100 (total)
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
      };

      await request(app.getHttpServer())
        .post('/propriedades')
        .send(invalidDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain(
            'A soma da área agricultável e de vegetação não pode ser maior que a área total',
          );
        });

      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
      expect(mockPropriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request without required fields', async () => {
      const invalidDto = {
        nomeFazenda: 'Fazenda Teste',
        // Missing required fields
      };

      await request(app.getHttpServer()).post('/propriedades').send(invalidDto).expect(400);

      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
      expect(mockPropriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request with invalid UUID in produtorIds', async () => {
      const invalidDto = {
        nomeFazenda: 'Fazenda Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
        produtorIds: ['invalid-uuid'],
      };

      await request(app.getHttpServer()).post('/propriedades').send(invalidDto).expect(400);

      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
      expect(mockPropriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request with negative areas', async () => {
      const invalidDto = {
        nomeFazenda: 'Fazenda Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        areaTotal: -100.0, // Negative area
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
        produtorIds: ['550e8400-e29b-41d4-a716-446655440000'],
      };

      await request(app.getHttpServer()).post('/propriedades').send(invalidDto).expect(400);

      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
      expect(mockPropriedadeRepository.save).not.toHaveBeenCalled();
    });

    it('should reject request with empty produtorIds array', async () => {
      const invalidDto = {
        nomeFazenda: 'Fazenda Teste',
        cidade: 'São Paulo',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
        produtorIds: [], // Empty array
      };

      await request(app.getHttpServer()).post('/propriedades').send(invalidDto).expect(400);

      expect(mockPropriedadeRepository.create).not.toHaveBeenCalled();
      expect(mockPropriedadeRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('GET /propriedades', () => {
    it('should return all propriedades', async () => {
      const mockPropriedades = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nomeFazenda: 'Fazenda Boa Vista',
          cidade: 'Ribeirão Preto',
          estado: 'SP',
          areaTotal: 100.0,
          produtores: [],
          cultivos: [],
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          nomeFazenda: 'Fazenda Santa Helena',
          cidade: 'Sorriso',
          estado: 'MT',
          areaTotal: 5000.0,
          produtores: [],
          cultivos: [],
        },
      ];

      mockPropriedadeRepository.find.mockResolvedValue(mockPropriedades);

      const response = await request(app.getHttpServer()).get('/propriedades').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({ nomeFazenda: 'Fazenda Boa Vista' });
      expect(response.body[1]).toMatchObject({ nomeFazenda: 'Fazenda Santa Helena' });
      expect(mockPropriedadeRepository.find).toHaveBeenCalledWith({
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
    });

    it('should return propriedades filtered by produtorId', async () => {
      const produtorId = '550e8400-e29b-41d4-a716-446655440000';
      const mockPropriedades = [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          nomeFazenda: 'Fazenda do João',
          produtores: [{ id: produtorId }],
        },
      ];

      mockPropriedadeRepository.find.mockResolvedValue(mockPropriedades);

      const response = await request(app.getHttpServer())
        .get(`/propriedades?produtorId=${produtorId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ nomeFazenda: 'Fazenda do João' });
    });

    it('should return empty array when no propriedades exist', async () => {
      mockPropriedadeRepository.find.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get('/propriedades').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /propriedades/:id', () => {
    it('should return a specific propriedade', async () => {
      const mockPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nomeFazenda: 'Fazenda Boa Vista',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100.0,
        produtores: [],
        cultivos: [],
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);

      const response = await request(app.getHttpServer())
        .get('/propriedades/550e8400-e29b-41d4-a716-446655440001')
        .expect(200);

      expect(response.body).toMatchObject({ nomeFazenda: 'Fazenda Boa Vista' });
      expect(mockPropriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440001' },
        relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
      });
    });

    it('should return 404 when propriedade not found', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/propriedades/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });

  describe('PATCH /propriedades/:id', () => {
    it('should update a propriedade successfully', async () => {
      const updateDto = { nomeFazenda: 'Fazenda Boa Vista Updated' };
      const existingPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nomeFazenda: 'Fazenda Boa Vista',
        cidade: 'Ribeirão Preto',
        estado: 'SP',
        areaTotal: 100.0,
        areaAgricultavel: 60.0,
        areaVegetacao: 40.0,
        produtores: [],
        cultivos: [],
      };
      const updatedPropriedade = { ...existingPropriedade, ...updateDto };

      mockPropriedadeRepository.findOne.mockResolvedValue(existingPropriedade);
      mockPropriedadeRepository.save.mockResolvedValue(updatedPropriedade);

      const response = await request(app.getHttpServer())
        .patch('/propriedades/550e8400-e29b-41d4-a716-446655440001')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({ nomeFazenda: 'Fazenda Boa Vista Updated' });
    });

    it('should reject update with invalid area validation', async () => {
      const updateDto = {
        areaTotal: 50.0,
        areaAgricultavel: 60.0, // 60 > 50 (total)
      };

      await request(app.getHttpServer())
        .patch('/propriedades/550e8400-e29b-41d4-a716-446655440001')
        .send(updateDto)
        .expect(400);
    });

    it('should return 404 when trying to update non-existent propriedade', async () => {
      const updateDto = { nomeFazenda: 'Updated Name' };

      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/propriedades/550e8400-e29b-41d4-a716-446655440999')
        .send(updateDto)
        .expect(404);
    });
  });

  describe('DELETE /propriedades/:id', () => {
    it('should delete a propriedade successfully', async () => {
      const existingPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nomeFazenda: 'Fazenda Boa Vista',
        produtores: [],
        cultivos: [],
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(existingPropriedade);
      mockPropriedadeRepository.remove.mockResolvedValue(existingPropriedade);

      await request(app.getHttpServer())
        .delete('/propriedades/550e8400-e29b-41d4-a716-446655440001')
        .expect(200);

      expect(mockPropriedadeRepository.remove).toHaveBeenCalledWith(existingPropriedade);
    });

    it('should return 404 when trying to delete non-existent propriedade', async () => {
      mockPropriedadeRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/propriedades/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });
  });
});
