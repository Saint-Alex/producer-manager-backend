import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { CreateProdutorDto, UpdateProdutorDto } from './dto';

@Injectable()
export class ProdutorService {
  constructor(
    @InjectRepository(Produtor)
    private readonly produtorRepository: Repository<Produtor>,
  ) {}

  async create(createProdutorDto: CreateProdutorDto): Promise<Produtor> {
    // Check if CPF/CNPJ already exists
    const existingProdutor = await this.produtorRepository.findOne({
      where: { cpfCnpj: createProdutorDto.cpfCnpj },
    });

    if (existingProdutor) {
      throw new BadRequestException('CPF/CNPJ já está cadastrado');
    }

    const produtor = this.produtorRepository.create(createProdutorDto);
    return await this.produtorRepository.save(produtor);
  }

  async findAll(): Promise<Produtor[]> {
    return this.produtorRepository.find({
      relations: ['propriedades'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Produtor> {
    const produtor = await this.produtorRepository.findOne({
      where: { id },
      relations: ['propriedades'],
    });

    if (!produtor) {
      throw new NotFoundException(`Produtor com ID ${id} não encontrado`);
    }

    return produtor;
  }

  async update(id: string, updateProdutorDto: UpdateProdutorDto): Promise<Produtor> {
    const produtor = await this.findOne(id);

    // Check if new CPF/CNPJ already exists (if being updated)
    if (updateProdutorDto.cpfCnpj && updateProdutorDto.cpfCnpj !== produtor.cpfCnpj) {
      const existingProdutor = await this.produtorRepository.findOne({
        where: { cpfCnpj: updateProdutorDto.cpfCnpj },
      });

      if (existingProdutor) {
        throw new BadRequestException('CPF/CNPJ já está cadastrado');
      }
    }

    Object.assign(produtor, updateProdutorDto);
    return await this.produtorRepository.save(produtor);
  }

  async remove(id: string): Promise<void> {
    const produtor = await this.produtorRepository.findOne({
      where: { id },
      relations: ['propriedades', 'propriedades.cultivos'],
    });

    if (!produtor) {
      throw new NotFoundException(`Produtor com ID ${id} não encontrado`);
    }

    // Delete em cascata: usar queryRunner para transação
    const queryRunner = this.produtorRepository.manager.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Deletar todos os cultivos das propriedades do produtor
      for (const propriedade of produtor.propriedades) {
        if (propriedade.cultivos && propriedade.cultivos.length > 0) {
          await queryRunner.manager.delete('Cultivo', {
            propriedadeRural: { id: propriedade.id },
          });
        }
      }

      // 2. Remover relacionamentos produtor-propriedade
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('produtor_propriedade')
        .where('produtor_id = :produtorId', { produtorId: id })
        .execute();

      // 3. Deletar propriedades que não têm outros produtores
      for (const propriedade of produtor.propriedades) {
        // Verificar se a propriedade tem outros produtores
        const propriedadeComProdutores = await queryRunner.manager
          .createQueryBuilder()
          .select('COUNT(*)', 'count')
          .from('produtor_propriedade', 'pp')
          .where('pp.propriedade_id = :propriedadeId', { propriedadeId: propriedade.id })
          .getRawOne();

        // Se não há outros produtores, deletar a propriedade
        if (parseInt(propriedadeComProdutores.count) === 0) {
          await queryRunner.manager.delete('PropriedadeRural', { id: propriedade.id });
        }
      }

      // 4. Deletar o produtor
      await queryRunner.manager.delete('Produtor', { id });

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findByCpfCnpj(cpfCnpj: string): Promise<Produtor | null> {
    return await this.produtorRepository.findOne({
      where: { cpfCnpj },
      relations: ['propriedades'],
    });
  }
}
