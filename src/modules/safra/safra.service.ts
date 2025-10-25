import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Safra } from '../../database/entities/safra.entity';
import { CreateSafraDto } from './dto/create-safra.dto';
import { UpdateSafraDto } from './dto/update-safra.dto';

@Injectable()
export class SafraService {
  constructor(
    @InjectRepository(Safra)
    private safraRepository: Repository<Safra>,
  ) {}

  async create(createSafraDto: CreateSafraDto): Promise<Safra> {
    // Verificar se já existe uma safra para o mesmo ano
    const existingSafra = await this.safraRepository.findOne({
      where: { ano: createSafraDto.ano }
    });

    if (existingSafra) {
      throw new ConflictException(`Safra para o ano ${createSafraDto.ano} já existe`);
    }

    const safra = this.safraRepository.create(createSafraDto);
    return this.safraRepository.save(safra);
  }

  async findAll(): Promise<Safra[]> {
    return this.safraRepository.find({
      relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural'],
      order: { ano: 'DESC' }
    });
  }

  async findOne(id: string): Promise<Safra> {
    const safra = await this.safraRepository.findOne({
      where: { id },
      relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural']
    });

    if (!safra) {
      throw new NotFoundException(`Safra com ID ${id} não encontrada`);
    }

    return safra;
  }

  async findByYear(ano: number): Promise<Safra> {
    const safra = await this.safraRepository.findOne({
      where: { ano },
      relations: ['cultivos', 'cultivos.cultura', 'cultivos.propriedadeRural']
    });

    if (!safra) {
      throw new NotFoundException(`Safra para o ano ${ano} não encontrada`);
    }

    return safra;
  }

  async update(id: string, updateSafraDto: UpdateSafraDto): Promise<Safra> {
    const safra = await this.findOne(id);

    // Se o ano está sendo atualizado, verificar se não há conflito
    if (updateSafraDto.ano && updateSafraDto.ano !== safra.ano) {
      const existingSafra = await this.safraRepository.findOne({
        where: { ano: updateSafraDto.ano }
      });

      if (existingSafra) {
        throw new ConflictException(`Safra para o ano ${updateSafraDto.ano} já existe`);
      }
    }

    Object.assign(safra, updateSafraDto);
    return this.safraRepository.save(safra);
  }

  async remove(id: string): Promise<void> {
    const safra = await this.findOne(id);
    await this.safraRepository.remove(safra);
  }
}
