import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Cultivo } from '../../database/entities/cultivo.entity';
import { Cultura } from '../../database/entities/cultura.entity';
import { CulturaController } from './cultura.controller';
import { CulturaService } from './cultura.service';

@Module({
  imports: [TypeOrmModule.forFeature([Cultura, Cultivo])],
  controllers: [CulturaController],
  providers: [CulturaService],
  exports: [CulturaService],
})
export class CulturaModule {}
