import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Cultura } from '../../database/entities/cultura.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { CreateCultivoDto } from './dto/create-cultivo.dto';
import { UpdateCultivoDto } from './dto/update-cultivo.dto';

@Injectable()
export class CultivoService {
  constructor(
    @InjectRepository(Cultivo)
    private cultivoRepository: Repository<Cultivo>,
    @InjectRepository(PropriedadeRural)
    private propriedadeRepository: Repository<PropriedadeRural>,
    @InjectRepository(Cultura)
    private culturaRepository: Repository<Cultura>,
    @InjectRepository(Safra)
    private safraRepository: Repository<Safra>,
  ) {}

  async create(createCultivoDto: CreateCultivoDto): Promise<Cultivo> {
    const { propriedadeId, culturaId, safraId, areaCultivada } = createCultivoDto;

    // Verificar se propriedade, cultura e safra existem
    const [propriedade, cultura, safra] = await Promise.all([
      this.propriedadeRepository.findOne({ where: { id: propriedadeId } }),
      this.culturaRepository.findOne({ where: { id: culturaId } }),
      this.safraRepository.findOne({ where: { id: safraId } }),
    ]);

    if (!propriedade) {
      throw new NotFoundException(`Propriedade com ID ${propriedadeId} não encontrada`);
    }
    if (!cultura) {
      throw new NotFoundException(`Cultura com ID ${culturaId} não encontrada`);
    }
    if (!safra) {
      throw new NotFoundException(`Safra com ID ${safraId} não encontrada`);
    }

    // Verificar se já existe um cultivo da mesma cultura na mesma propriedade e safra
    const existingCultivo = await this.cultivoRepository.findOne({
      where: {
        propriedadeRural: { id: propriedadeId },
        cultura: { id: culturaId },
        safra: { id: safraId },
      },
    });

    if (existingCultivo) {
      throw new ConflictException(
        `Já existe um cultivo de ${cultura.nome} na propriedade ${propriedade.nomeFazenda} para a safra ${safra.ano}`,
      );
    }

    // Validar se a área cultivada não excede a área agricultável da propriedade
    const cultivosExistentes = await this.cultivoRepository.find({
      where: {
        propriedadeRural: { id: propriedadeId },
        safra: { id: safraId },
      },
    });

    const areaJaCultivada = cultivosExistentes.reduce(
      (total, cultivo) => total + cultivo.areaPlantada,
      0,
    );
    const areaTotalComNovo = areaJaCultivada + areaCultivada;

    if (areaTotalComNovo > propriedade.areaAgricultavel) {
      throw new BadRequestException(
        `A área cultivada total (${areaTotalComNovo}ha) excederia a área agricultável da propriedade (${propriedade.areaAgricultavel}ha)`,
      );
    }

    const cultivo = this.cultivoRepository.create({
      areaPlantada: areaCultivada,
      propriedadeRural: propriedade,
      cultura,
      safra,
    });

    return this.cultivoRepository.save(cultivo);
  }

  async findAll(): Promise<Cultivo[]> {
    return this.cultivoRepository.find({
      relations: ['propriedadeRural', 'cultura', 'safra'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Cultivo> {
    const cultivo = await this.cultivoRepository.findOne({
      where: { id },
      relations: ['propriedadeRural', 'cultura', 'safra'],
    });

    if (!cultivo) {
      throw new NotFoundException(`Cultivo com ID ${id} não encontrado`);
    }

    return cultivo;
  }

  async findByPropriedade(propriedadeId: string): Promise<Cultivo[]> {
    return this.cultivoRepository.find({
      where: { propriedadeRural: { id: propriedadeId } },
      relations: ['propriedadeRural', 'cultura', 'safra'],
      order: { createdAt: 'DESC' },
    });
  }

  async findBySafra(safraId: string): Promise<Cultivo[]> {
    return this.cultivoRepository.find({
      where: { safra: { id: safraId } },
      relations: ['propriedadeRural', 'cultura', 'safra'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByCultura(culturaId: string): Promise<Cultivo[]> {
    return this.cultivoRepository.find({
      where: { cultura: { id: culturaId } },
      relations: ['propriedadeRural', 'cultura', 'safra'],
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateCultivoDto: UpdateCultivoDto): Promise<Cultivo> {
    const cultivo = await this.findOne(id);
    const { propriedadeId, culturaId, safraId, areaCultivada } = updateCultivoDto;

    // Se algum ID foi fornecido, validar entidades
    const updates: any = {};

    if (propriedadeId && propriedadeId !== cultivo.propriedadeRural.id) {
      const propriedade = await this.propriedadeRepository.findOne({
        where: { id: propriedadeId },
      });
      if (!propriedade) {
        throw new NotFoundException(`Propriedade com ID ${propriedadeId} não encontrada`);
      }
      updates.propriedadeRural = propriedade;
    }

    if (culturaId && culturaId !== cultivo.cultura.id) {
      const cultura = await this.culturaRepository.findOne({ where: { id: culturaId } });
      if (!cultura) {
        throw new NotFoundException(`Cultura com ID ${culturaId} não encontrada`);
      }
      updates.cultura = cultura;
    }

    if (safraId && safraId !== cultivo.safra.id) {
      const safra = await this.safraRepository.findOne({ where: { id: safraId } });
      if (!safra) {
        throw new NotFoundException(`Safra com ID ${safraId} não encontrada`);
      }
      updates.safra = safra;
    }

    // Validar área se foi atualizada
    if (areaCultivada && areaCultivada !== cultivo.areaPlantada) {
      const propriedadeParaValidacao = updates.propriedadeRural || cultivo.propriedadeRural;
      const safraParaValidacao = updates.safra || cultivo.safra;

      const cultivosExistentes = await this.cultivoRepository.find({
        where: {
          propriedadeRural: { id: propriedadeParaValidacao.id },
          safra: { id: safraParaValidacao.id },
        },
      });

      // Excluir o cultivo atual do cálculo
      const cultivosParaCalculo = cultivosExistentes.filter((c) => c.id !== cultivo.id);
      const areaJaCultivada = cultivosParaCalculo.reduce((total, c) => total + c.areaPlantada, 0);
      const areaTotalComNovo = areaJaCultivada + areaCultivada;

      if (areaTotalComNovo > propriedadeParaValidacao.areaAgricultavel) {
        throw new BadRequestException(
          `A área cultivada total (${areaTotalComNovo}ha) excederia a área agricultável da propriedade (${propriedadeParaValidacao.areaAgricultavel}ha)`,
        );
      }

      updates.areaPlantada = areaCultivada;
    }

    Object.assign(cultivo, updates);
    return this.cultivoRepository.save(cultivo);
  }

  async remove(id: string): Promise<void> {
    const cultivo = await this.findOne(id);
    await this.cultivoRepository.remove(cultivo);
  }
}
