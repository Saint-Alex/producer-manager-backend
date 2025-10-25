import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as request from 'supertest';
import { Repository } from 'typeorm';
import { Cultivo } from '../src/database/entities/cultivo.entity';
import { Cultura } from '../src/database/entities/cultura.entity';
import { PropriedadeRural } from '../src/database/entities/propriedade-rural.entity';
import { Safra } from '../src/database/entities/safra.entity';
import { CultivoController } from '../src/modules/cultivo/cultivo.controller';
import { CultivoService } from '../src/modules/cultivo/cultivo.service';

describe('CultivoController (e2e)', () => {
  let app: INestApplication;
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
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CultivoController],
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

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    _cultivoRepository = moduleFixture.get<Repository<Cultivo>>(getRepositoryToken(Cultivo));
    _propriedadeRepository = moduleFixture.get<Repository<PropriedadeRural>>(
      getRepositoryToken(PropriedadeRural),
    );
    _culturaRepository = moduleFixture.get<Repository<Cultura>>(getRepositoryToken(Cultura));
    _safraRepository = moduleFixture.get<Repository<Safra>>(getRepositoryToken(Safra));

    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /cultivos', () => {
    it('should create a cultivo successfully with valid data', async () => {
      const createCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 50.5,
      };

      const mockPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Boa Vista',
        areaAgricultavel: 100.0,
      };

      const mockCultura = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Soja',
      };

      const mockSafra = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        ano: 2025,
      };

      const mockCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 50.5,
        propriedadeRural: mockPropriedade,
        cultura: mockCultura,
        safra: mockSafra,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);
      mockCultivoRepository.findOne.mockResolvedValue(null); // Não existe cultivo duplicado
      mockCultivoRepository.find.mockResolvedValue([]); // Nenhum cultivo existente na propriedade
      mockCultivoRepository.create.mockReturnValue(mockCultivo);
      mockCultivoRepository.save.mockResolvedValue(mockCultivo);

      const response = await request(app.getHttpServer())
        .post('/cultivos')
        .send(createCultivoDto)
        .expect(201);

      expect(response.body).toMatchObject({
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 50.5,
      });
      expect(mockPropriedadeRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440000' },
      });
      expect(mockCulturaRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440001' },
      });
      expect(mockSafraRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440002' },
      });
    });

    it('should reject request with invalid UUID', async () => {
      const invalidDto = {
        propriedadeId: 'invalid-uuid',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 50.5,
      };

      await request(app.getHttpServer()).post('/cultivos').send(invalidDto).expect(400);

      expect(mockCultivoRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request with negative area', async () => {
      const invalidDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: -10.5,
      };

      await request(app.getHttpServer()).post('/cultivos').send(invalidDto).expect(400);

      expect(mockCultivoRepository.create).not.toHaveBeenCalled();
    });

    it('should reject request without required fields', async () => {
      const invalidDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        // Missing required fields
      };

      await request(app.getHttpServer()).post('/cultivos').send(invalidDto).expect(400);

      expect(mockCultivoRepository.create).not.toHaveBeenCalled();
    });

    it('should reject when propriedade not found', async () => {
      const createCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 50.5,
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(null);
      mockCulturaRepository.findOne.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Soja',
      });
      mockSafraRepository.findOne.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440002',
        ano: 2025,
      });

      await request(app.getHttpServer())
        .post('/cultivos')
        .send(createCultivoDto)
        .expect(404)
        .expect((res) => {
          expect(res.body.message).toContain(
            'Propriedade com ID 550e8400-e29b-41d4-a716-446655440000 não encontrada',
          );
        });
    });

    it('should reject when area exceeds propriedade limit', async () => {
      const createCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 150.0, // Excede limite
      };

      const mockPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Boa Vista',
        areaAgricultavel: 100.0,
      };

      const mockExistingCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440004',
        areaPlantada: 30.0,
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Soja',
      });
      mockSafraRepository.findOne.mockResolvedValue({
        id: '550e8400-e29b-41d4-a716-446655440002',
        ano: 2025,
      });
      mockCultivoRepository.findOne.mockResolvedValue(null); // Não existe cultivo duplicado
      mockCultivoRepository.find.mockResolvedValue([mockExistingCultivo]); // Já tem 30ha cultivados

      await request(app.getHttpServer())
        .post('/cultivos')
        .send(createCultivoDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('excederia a área agricultável');
        });
    });

    it('should reject when cultivo already exists', async () => {
      const createCultivoDto = {
        propriedadeId: '550e8400-e29b-41d4-a716-446655440000',
        culturaId: '550e8400-e29b-41d4-a716-446655440001',
        safraId: '550e8400-e29b-41d4-a716-446655440002',
        areaCultivada: 50.5,
      };

      const mockPropriedade = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        nomeFazenda: 'Fazenda Boa Vista',
        areaAgricultavel: 100.0,
      };

      const mockCultura = {
        id: '550e8400-e29b-41d4-a716-446655440001',
        nome: 'Soja',
      };

      const mockSafra = {
        id: '550e8400-e29b-41d4-a716-446655440002',
        ano: 2025,
      };

      const mockExistingCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 40.0,
      };

      mockPropriedadeRepository.findOne.mockResolvedValue(mockPropriedade);
      mockCulturaRepository.findOne.mockResolvedValue(mockCultura);
      mockSafraRepository.findOne.mockResolvedValue(mockSafra);
      mockCultivoRepository.findOne.mockResolvedValue(mockExistingCultivo); // Já existe cultivo

      await request(app.getHttpServer())
        .post('/cultivos')
        .send(createCultivoDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toContain('Já existe um cultivo de Soja');
        });
    });
  });

  describe('GET /cultivos', () => {
    it('should return all cultivos', async () => {
      const mockCultivos = [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          areaPlantada: 50.5,
          propriedadeRural: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            nomeFazenda: 'Fazenda Boa Vista',
          },
          cultura: { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Soja' },
          safra: { id: '550e8400-e29b-41d4-a716-446655440002', ano: 2025 },
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440004',
          areaPlantada: 30.0,
          propriedadeRural: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            nomeFazenda: 'Fazenda Boa Vista',
          },
          cultura: { id: '550e8400-e29b-41d4-a716-446655440005', nome: 'Milho' },
          safra: { id: '550e8400-e29b-41d4-a716-446655440002', ano: 2025 },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const response = await request(app.getHttpServer()).get('/cultivos').expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toMatchObject({ areaPlantada: 50.5 });
      expect(response.body[1]).toMatchObject({ areaPlantada: 30.0 });
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return cultivos filtered by propriedadeId', async () => {
      const propriedadeId = '550e8400-e29b-41d4-a716-446655440000';
      const mockCultivos = [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          areaPlantada: 50.5,
          propriedadeRural: { id: propriedadeId, nomeFazenda: 'Fazenda Boa Vista' },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const response = await request(app.getHttpServer())
        .get(`/cultivos?propriedadeId=${propriedadeId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ areaPlantada: 50.5 });
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        where: { propriedadeRural: { id: propriedadeId } },
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return cultivos filtered by safraId', async () => {
      const safraId = '550e8400-e29b-41d4-a716-446655440002';
      const mockCultivos = [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          areaPlantada: 50.5,
          safra: { id: safraId, ano: 2025 },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const response = await request(app.getHttpServer())
        .get(`/cultivos?safraId=${safraId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ areaPlantada: 50.5 });
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        where: { safra: { id: safraId } },
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return cultivos filtered by culturaId', async () => {
      const culturaId = '550e8400-e29b-41d4-a716-446655440001';
      const mockCultivos = [
        {
          id: '550e8400-e29b-41d4-a716-446655440003',
          areaPlantada: 50.5,
          cultura: { id: culturaId, nome: 'Soja' },
        },
      ];

      mockCultivoRepository.find.mockResolvedValue(mockCultivos);

      const response = await request(app.getHttpServer())
        .get(`/cultivos?culturaId=${culturaId}`)
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({ areaPlantada: 50.5 });
      expect(mockCultivoRepository.find).toHaveBeenCalledWith({
        where: { cultura: { id: culturaId } },
        relations: ['propriedadeRural', 'cultura', 'safra'],
        order: { createdAt: 'DESC' },
      });
    });

    it('should return empty array when no cultivos exist', async () => {
      mockCultivoRepository.find.mockResolvedValue([]);

      const response = await request(app.getHttpServer()).get('/cultivos').expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /cultivos/:id', () => {
    it('should return a specific cultivo', async () => {
      const mockCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 50.5,
        propriedadeRural: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nomeFazenda: 'Fazenda Boa Vista',
        },
        cultura: { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Soja' },
        safra: { id: '550e8400-e29b-41d4-a716-446655440002', ano: 2025 },
      };

      mockCultivoRepository.findOne.mockResolvedValue(mockCultivo);

      const response = await request(app.getHttpServer())
        .get('/cultivos/550e8400-e29b-41d4-a716-446655440003')
        .expect(200);

      expect(response.body).toMatchObject({ areaPlantada: 50.5 });
      expect(mockCultivoRepository.findOne).toHaveBeenCalledWith({
        where: { id: '550e8400-e29b-41d4-a716-446655440003' },
        relations: ['propriedadeRural', 'cultura', 'safra'],
      });
    });

    it('should return 404 when cultivo not found', async () => {
      mockCultivoRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/cultivos/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer()).get('/cultivos/invalid-uuid').expect(400);
    });
  });

  describe('PATCH /cultivos/:id', () => {
    it('should update a cultivo successfully', async () => {
      const updateDto = { areaCultivada: 40.0 };
      const existingCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 50.5,
        propriedadeRural: { id: '550e8400-e29b-41d4-a716-446655440000', areaAgricultavel: 100.0 },
        cultura: { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Soja' },
        safra: { id: '550e8400-e29b-41d4-a716-446655440002', ano: 2025 },
      };
      const updatedCultivo = { ...existingCultivo, areaPlantada: 40.0 };

      mockCultivoRepository.findOne.mockResolvedValue(existingCultivo);
      mockCultivoRepository.find.mockResolvedValue([]); // Nenhum outro cultivo
      mockCultivoRepository.save.mockResolvedValue(updatedCultivo);

      const response = await request(app.getHttpServer())
        .patch('/cultivos/550e8400-e29b-41d4-a716-446655440003')
        .send(updateDto)
        .expect(200);

      expect(response.body).toMatchObject({ areaPlantada: 40.0 });
    });

    it('should reject update with area exceeding limit', async () => {
      const updateDto = { areaCultivada: 150.0 };
      const existingCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 50.5,
        propriedadeRural: { id: '550e8400-e29b-41d4-a716-446655440000', areaAgricultavel: 100.0 },
        cultura: { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Soja' },
        safra: { id: '550e8400-e29b-41d4-a716-446655440002', ano: 2025 },
      };

      mockCultivoRepository.findOne.mockResolvedValue(existingCultivo);
      mockCultivoRepository.find.mockResolvedValue([
        { id: '550e8400-e29b-41d4-a716-446655440004', areaPlantada: 30.0 },
      ]);

      await request(app.getHttpServer())
        .patch('/cultivos/550e8400-e29b-41d4-a716-446655440003')
        .send(updateDto)
        .expect(400)
        .expect((res) => {
          expect(res.body.message).toContain('excederia a área agricultável');
        });
    });

    it('should return 404 when trying to update non-existent cultivo', async () => {
      const updateDto = { areaCultivada: 40.0 };

      mockCultivoRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .patch('/cultivos/550e8400-e29b-41d4-a716-446655440999')
        .send(updateDto)
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      const updateDto = { areaCultivada: 40.0 };

      await request(app.getHttpServer())
        .patch('/cultivos/invalid-uuid')
        .send(updateDto)
        .expect(400);
    });
  });

  describe('DELETE /cultivos/:id', () => {
    it('should delete a cultivo successfully', async () => {
      const existingCultivo = {
        id: '550e8400-e29b-41d4-a716-446655440003',
        areaPlantada: 50.5,
        propriedadeRural: {
          id: '550e8400-e29b-41d4-a716-446655440000',
          nomeFazenda: 'Fazenda Boa Vista',
        },
        cultura: { id: '550e8400-e29b-41d4-a716-446655440001', nome: 'Soja' },
        safra: { id: '550e8400-e29b-41d4-a716-446655440002', ano: 2025 },
      };

      mockCultivoRepository.findOne.mockResolvedValue(existingCultivo);
      mockCultivoRepository.remove.mockResolvedValue(existingCultivo);

      await request(app.getHttpServer())
        .delete('/cultivos/550e8400-e29b-41d4-a716-446655440003')
        .expect(200);

      expect(mockCultivoRepository.remove).toHaveBeenCalledWith(existingCultivo);
    });

    it('should return 404 when trying to delete non-existent cultivo', async () => {
      mockCultivoRepository.findOne.mockResolvedValue(null);

      await request(app.getHttpServer())
        .delete('/cultivos/550e8400-e29b-41d4-a716-446655440999')
        .expect(404);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer()).delete('/cultivos/invalid-uuid').expect(400);
    });
  });
});
