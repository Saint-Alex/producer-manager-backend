import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cultivo } from './cultivo.entity';

@Entity('culturas')
export class Cultura {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'nome', length: 100, unique: true })
  nome: string;

  @Column({ name: 'descricao', type: 'text', nullable: true })
  descricao: string;

  @OneToMany(() => Cultivo, (cultivo) => cultivo.cultura)
  cultivos: Cultivo[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
