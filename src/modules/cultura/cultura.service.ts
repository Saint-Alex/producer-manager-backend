import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cultura } from '../../database/entities/cultura.entity';
import { CreateCulturaDto } from './dto/create-cultura.dto';
import { UpdateCulturaDto } from './dto/update-cultura.dto';

@Injectable()
export class CulturaService {
  constructor(
    @InjectRepository(Cultura)
    private culturaRepository: Repository<Cultura>,
  ) {}

  async create(createCulturaDto: CreateCulturaDto): Promise<Cultura> {
    // Verificar se já existe uma cultura com o mesmo nome
    const existingCultura = await this.culturaRepository.findOne({
      where: { nome: createCulturaDto.nome }
    });

    if (existingCultura) {
      throw new ConflictException(`Cultura com nome '${createCulturaDto.nome}' já existe`);
    }

    const cultura = this.culturaRepository.create(createCulturaDto);
    return this.culturaRepository.save(cultura);
  }

  async findAll(): Promise<Cultura[]> {
    return this.culturaRepository.find({
      relations: ['cultivos', 'cultivos.propriedadeRural']
    });
  }

  async findOne(id: string): Promise<Cultura> {
    const cultura = await this.culturaRepository.findOne({
      where: { id },
      relations: ['cultivos', 'cultivos.propriedadeRural']
    });

    if (!cultura) {
      throw new NotFoundException(`Cultura com ID ${id} não encontrada`);
    }

    return cultura;
  }

  async update(id: string, updateCulturaDto: UpdateCulturaDto): Promise<Cultura> {
    const cultura = await this.findOne(id);

    // Se o nome está sendo atualizado, verificar se não há conflito
    if (updateCulturaDto.nome && updateCulturaDto.nome !== cultura.nome) {
      const existingCultura = await this.culturaRepository.findOne({
        where: { nome: updateCulturaDto.nome }
      });

      if (existingCultura) {
        throw new ConflictException(`Cultura com nome '${updateCulturaDto.nome}' já existe`);
      }
    }

    Object.assign(cultura, updateCulturaDto);
    return this.culturaRepository.save(cultura);
  }

  async remove(id: string): Promise<void> {
    const cultura = await this.findOne(id);
    await this.culturaRepository.remove(cultura);
  }
}
