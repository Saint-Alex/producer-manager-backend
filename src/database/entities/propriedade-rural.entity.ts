import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cultivo } from './cultivo.entity';
import { Produtor } from './produtor.entity';
import { Safra } from './safra.entity';

@Entity('propriedades_rurais')
export class PropriedadeRural {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome_fazenda', length: 255 })
  nomeFazenda: string;

  @Column({ name: 'cidade', length: 100 })
  cidade: string;

  @Column({ name: 'estado', length: 2 })
  estado: string;

  @Column({ name: 'area_total', type: 'decimal', precision: 10, scale: 2 })
  areaTotal: number;

  @Column({ name: 'area_agricultavel', type: 'decimal', precision: 10, scale: 2 })
  areaAgricultavel: number;

  @Column({ name: 'area_vegetacao', type: 'decimal', precision: 10, scale: 2 })
  areaVegetacao: number;

  @ManyToMany(() => Produtor, (produtor) => produtor.propriedades)
  @JoinTable({
    name: 'produtor_propriedade',
    joinColumn: { name: 'propriedade_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'produtor_id', referencedColumnName: 'id' },
  })
  produtores: Produtor[];

  @OneToMany(() => Cultivo, (cultivo) => cultivo.propriedadeRural, { cascade: ['remove'] })
  cultivos: Cultivo[];

  @OneToMany(() => Safra, (safra) => safra.propriedadeRural, { cascade: ['remove'] })
  safras: Safra[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
