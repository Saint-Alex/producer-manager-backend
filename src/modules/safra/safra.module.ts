import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { PropriedadeRural } from '../../database/entities/propriedade-rural.entity';
import { Safra } from '../../database/entities/safra.entity';
import { SafraController } from './safra.controller';
import { SafraService } from './safra.service';

@Module({
  imports: [TypeOrmModule.forFeature([Safra, PropriedadeRural, Cultivo])],
  controllers: [SafraController],
  providers: [SafraService],
  exports: [SafraService],
})
export class SafraModule {}
