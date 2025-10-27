import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cultivo } from './cultivo.entity';
import { PropriedadeRural } from './propriedade-rural.entity';

@Entity('safras')
export class Safra {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome', length: 100 })
  nome: string;

  @Column({ name: 'ano', type: 'int' })
  ano: number;

  @Column({ name: 'data_inicio', type: 'date', nullable: true })
  dataInicio: Date;

  @Column({ name: 'data_fim', type: 'date', nullable: true })
  dataFim: Date;

  @ManyToOne(() => PropriedadeRural, (propriedade) => propriedade.safras, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propriedade_rural_id' })
  propriedadeRural: PropriedadeRural;

  @OneToMany(() => Cultivo, (cultivo) => cultivo.safra, { cascade: ['remove'] })
  cultivos: Cultivo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
