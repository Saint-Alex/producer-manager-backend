import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Produtor } from '../../database/entities/produtor.entity';
import { ProdutorController } from './produtor.controller';
import { ProdutorService } from './produtor.service';

@Module({
  imports: [TypeOrmModule.forFeature([Produtor])],
  controllers: [ProdutorController],
  providers: [ProdutorService],
  exports: [ProdutorService],
})
export class ProdutorModule {}
