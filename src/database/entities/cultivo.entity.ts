import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cultura } from './cultura.entity';
import { PropriedadeRural } from './propriedade-rural.entity';
import { Safra } from './safra.entity';

@Entity('cultivos')
export class Cultivo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'area_plantada', type: 'decimal', precision: 10, scale: 2, nullable: true })
  areaPlantada: number;

  @ManyToOne(() => PropriedadeRural, (propriedade) => propriedade.cultivos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'propriedade_rural_id' })
  propriedadeRural: PropriedadeRural;

  @ManyToOne(() => Safra, (safra) => safra.cultivos, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'safra_id' })
  safra: Safra;

  @ManyToOne(() => Cultura, (cultura) => cultura.cultivos)
  @JoinColumn({ name: 'cultura_id' })
  cultura: Cultura;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
