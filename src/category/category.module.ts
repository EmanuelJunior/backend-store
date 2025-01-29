import { forwardRef, Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { ProductModule } from 'src/product/product.module';

@Module({
  imports: [
    forwardRef(() =>ProductModule),
    TypeOrmModule.forFeature([ Category ])
  ],
  controllers: [CategoryController],
  providers: [CategoryService],
  exports: [TypeOrmModule],
})
export class CategoryModule {}
