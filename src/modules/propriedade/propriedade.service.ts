import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { CreatePropriedadeDto } from './dto/create-propriedade.dto';
import { UpdatePropriedadeDto } from './dto/update-propriedade.dto';

@Injectable()
export class PropriedadeService {
  constructor(
    @InjectRepository(PropriedadeRural)
    private propriedadeRepository: Repository<PropriedadeRural>,
    @InjectRepository(Produtor)
    private produtorRepository: Repository<Produtor>,
  ) {}

  async create(createPropriedadeDto: CreatePropriedadeDto): Promise<PropriedadeRural> {
    const { produtorIds, ...propriedadeData } = createPropriedadeDto;

    // Validar se todos os produtores existem
    const produtores = await this.produtorRepository.findBy({
      id: In(produtorIds),
    });

    if (produtores.length !== produtorIds.length) {
      throw new BadRequestException('Um ou mais produtores não foram encontrados');
    }

    // Validar áreas
    const { areaTotal, areaAgricultavel, areaVegetacao } = propriedadeData;
    if (areaAgricultavel + areaVegetacao > areaTotal) {
      throw new BadRequestException(
        'A soma da área agricultável e área de vegetação não pode ser maior que a área total',
      );
    }

    const propriedade = this.propriedadeRepository.create({
      ...propriedadeData,
      produtores,
    });

    return this.propriedadeRepository.save(propriedade);
  }

  async findAll(): Promise<PropriedadeRural[]> {
    return this.propriedadeRepository.find({
      relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
    });
  }

  async findOne(id: string): Promise<PropriedadeRural> {
    const propriedade = await this.propriedadeRepository.findOne({
      where: { id },
      relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
    });

    if (!propriedade) {
      throw new NotFoundException(`Propriedade com ID ${id} não encontrada`);
    }

    return propriedade;
  }

  async findByProdutor(produtorId: string): Promise<PropriedadeRural[]> {
    return this.propriedadeRepository.find({
      where: {
        produtores: {
          id: produtorId,
        },
      },
      relations: ['produtores', 'cultivos', 'cultivos.cultura', 'cultivos.safra'],
    });
  }

  async update(id: string, updatePropriedadeDto: UpdatePropriedadeDto): Promise<PropriedadeRural> {
    const propriedade = await this.findOne(id);
    const { produtorIds, ...updateData } = updatePropriedadeDto;

    // Se produtorIds foi fornecido, validar e atualizar
    if (produtorIds) {
      const produtores = await this.produtorRepository.findBy({
        id: In(produtorIds),
      });

      if (produtores.length !== produtorIds.length) {
        throw new BadRequestException('Um ou mais produtores não foram encontrados');
      }

      propriedade.produtores = produtores;
    }

    // Validar áreas se foram atualizadas
    const areaTotal = updateData.areaTotal || propriedade.areaTotal;
    const areaAgricultavel = updateData.areaAgricultavel || propriedade.areaAgricultavel;
    const areaVegetacao = updateData.areaVegetacao || propriedade.areaVegetacao;

    if (areaAgricultavel + areaVegetacao > areaTotal) {
      throw new BadRequestException(
        'A soma da área agricultável e área de vegetação não pode ser maior que a área total',
      );
    }

    Object.assign(propriedade, updateData);
    return this.propriedadeRepository.save(propriedade);
  }

  async remove(id: string): Promise<void> {
    const propriedade = await this.findOne(id);
    await this.propriedadeRepository.remove(propriedade);
  }
}
