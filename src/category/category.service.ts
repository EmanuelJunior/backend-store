import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';
import { FilterCategoryDto } from './dto/filter-category.dto';

@Injectable()
export class CategoryService {

  constructor(
    @InjectRepository( Category )
    private readonly categoryRepository: Repository<Category>
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    try {
      const category = this.categoryRepository.create(createCategoryDto);
      return await this.categoryRepository.save(category);

    } catch(err) {

      if (err.code === 'ER_DUP_ENTRY') {
        throw new BadRequestException('El nombre de la categoría ya existe.');
      }

      throw err;
    }
  }

  async findAll({ order }: FilterCategoryDto) {

    if ( order && order !== 'ASC' && order !== 'DESC' ) {
      throw new Error('El orden de las categorias solo acepta "ASC" o "DESC"')
    }

    return await this.categoryRepository.createQueryBuilder('category')
      .orderBy('category.name', order)
      .getMany()
    ;
  }

  async findOne(id: string): Promise<Category> {

    const category = await this.categoryRepository.findOne({ where: { id } });

    if (!category)
      throw new NotFoundException(`No se encontró la categoría `);

    return category;
  }

  async update(id: string, { name }: UpdateCategoryDto) {

    try {
      const queryBuilder = await this.categoryRepository
        .createQueryBuilder()
        .update(Category)
        .set({ name })
        .where('id = :id', { id })
        .execute();
      
      if ( queryBuilder.affected === 0 ) {
        throw new NotFoundException(`Categoria no ha sido encontrada`)
      }

      return {
        message: "Se actualizo correctamente la categoria",
        category: { id, name }
      };

    } catch (err) {
      if ( err instanceof NotFoundException ) {
        throw err;
      } else {
        throw new InternalServerErrorException('No se pudo actualizar la categoria')
      }
    }
  }

  async remove(id: string) {

    const category = await this.categoryRepository.findOne({ where: {id} });

    if ( !category ) {
      throw new NotFoundException('Categoria no encontrada');
    }

    await this.categoryRepository.remove( category );

    return {
      message: 'Se elimino correctamente la categoria'
    }
  }
}
