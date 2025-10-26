import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { CreateSafraDto } from './dto/create-safra.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';

@Injectable()
export class SafraService {
  constructor(
    @InjectRepository(Safra)
    private safraRepository: Repository<Safra>,
    @InjectRepository(PropriedadeRural)
    private propriedadeRepository: Repository<PropriedadeRural>,
    @InjectRepository(Cultivo)
    private cultivoRepository: Repository<Cultivo>,
  ) {}

  async create(createSafraDto: CreateSafraDto): Promise<Safra> {
    // Verificar se a propriedade existe
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id: createSafraDto.propriedadeRuralId },
      relations: ['safras'],
    });

    if (!propriedade) {
      throw new NotFoundException(
        `Propriedade com ID ${createSafraDto.propriedadeRuralId} não encontrada`,
      );
    }

    // Verificar se já existe uma safra com o mesmo ano nesta propriedade
    const safraExistente = await this.safraRepository.findOne({
      where: {
        propriedadeRural: { id: createSafraDto.propriedadeRuralId },
        ano: createSafraDto.ano,
      },
    });

    if (safraExistente) {
      throw new ConflictException(
        `A propriedade "${propriedade.nomeFazenda}" já possui uma safra para o ano ${createSafraDto.ano}`,
      );
    }

    const safra = this.safraRepository.create({
      nome: createSafraDto.nome,
      ano: createSafraDto.ano,
      propriedadeRural: propriedade,
    });

    return this.safraRepository.save(safra);
  }

  async findAll(): Promise<Safra[]> {
    return this.safraRepository.find({
      relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
      order: { ano: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Safra> {
    const safra = await this.safraRepository.findOne({
      where: { id },
      relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
    });

    if (!safra) {
      throw new NotFoundException(`Safra com ID ${id} não encontrada`);
    }

    return safra;
  }

  async findByYear(ano: number): Promise<Safra[]> {
    const safras = await this.safraRepository.find({
      where: { ano },
      relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
    });

    return safras;
  }

  async findByPropriedade(propriedadeId: string): Promise<Safra[]> {
    const safras = await this.safraRepository.find({
      where: { propriedadeRural: { id: propriedadeId } },
      relations: ['propriedadeRural', 'cultivos', 'cultivos.cultura'],
      order: { ano: 'DESC' },
    });

    return safras;
  }

  async update(id: string, updateSafraDto: UpdateSafraDto): Promise<Safra> {
    const safra = await this.findOne(id);

    Object.assign(safra, updateSafraDto);
    return this.safraRepository.save(safra);
  }

  async remove(id: string): Promise<void> {
    const safra = await this.safraRepository.findOne({
      where: { id },
      relations: ['cultivos'],
    });

    if (!safra) {
      throw new NotFoundException(`Safra com ID ${id} não encontrada`);
    }

    // Delete cultivos first to avoid foreign key constraint violation
    if (safra.cultivos && safra.cultivos.length > 0) {
      await this.cultivoRepository.remove(safra.cultivos);
    }

    // Then delete the safra
    await this.safraRepository.remove(safra);
  }
}
