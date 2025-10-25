import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropriedadeRural } from './propriedade-rural.entity';

@Entity('produtores')
export class Produtor {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'cpf_cnpj', unique: true, length: 14 })
  cpfCnpj: string;

  @Column({ name: 'nome', length: 255 })
  nome: string;

  @ManyToMany(() => PropriedadeRural, (propriedade) => propriedade.produtores)
  propriedades: PropriedadeRural[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
