import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';

import { Product } from './entities/product.entity';
import { Category } from 'src/category/entities/category.entity';

@Injectable()
export class ProductService {

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ){}

  async create(createProductDto: CreateProductDto): Promise<Product> {

    const { name, description, price, categoryId } = createProductDto;

    const existingProduct = await this.productRepository.findOne({
      where: [{ name }, { description }],
    });

    if (existingProduct) {
      throw new BadRequestException('El producto con ese nombre o descripción ya existe');
    }

    const category = await this.categoryRepository.findOne({ where: { id: categoryId } });

    if (!category) {
      throw new NotFoundException(`Categoría con ID "${categoryId}" no encontrada`);
    }

    const product = this.productRepository.create({
      name,
      description,
      price,
      category,
    });

    return this.productRepository.save(product);
  }

  async findAll(filterDto: FilterProductDto): Promise<Product[]> {
  
    const query = this.productRepository.createQueryBuilder('product');
  
    query.leftJoinAndSelect('product.category', 'category');
  
    const filters = await this.filterOperations(query);
  
    Object.entries( filterDto ).forEach( ([key, value]) => {
      if ( value ) filters[key](value);
    });

    return await query.getMany();
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });

    if (!product)
      throw new NotFoundException(`Producto no encontrado`);

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto): Promise<Product> {

    const product = await this.productRepository.findOne({ where: { id } }); 
    const { categoryId, ...toUpdate } = updateProductDto;

    if (categoryId) {
      const category = await this.categoryRepository.findOne({ where: { id: categoryId } });
      
      if (!category) {
        throw new NotFoundException(`Categoría con ID "${categoryId}" no encontrada`);
      }
      product.category = category;
    }

    Object.assign(product, toUpdate);

    if (toUpdate.name || toUpdate.description) {

      const conflictProduct = await this.productRepository.findOne({
        where: [
          { name: product.name },
          { description: product.description },
        ],
      });

      if (conflictProduct && conflictProduct.id !== product.id) {
        throw new BadRequestException('Otro producto con ese nombre o descripción ya existe');
      }
    }

    return this.productRepository.save(product);
  }

  async remove(id: string): Promise<{ message: string }> {

    const product = await this.productRepository.findOne({ where: { id } });
    await this.productRepository.remove(product);

    return { message: 'Producto eliminado correctamente' };
  }


  async filterOperations(
    query: SelectQueryBuilder<Product>,
  ) {

    return {
      search: (text: string) => {
        const lowerText = text.toLowerCase();
        return query.andWhere(
          '(LOWER(product.name) LIKE :text OR LOWER(product.description) LIKE :text)',
          { text: `%${lowerText}%` },
        );
      },
  
      minPrice: (value: number) => {
        return query.andWhere('product.price >= :minPrice', { minPrice: value });
      },
  
      maxPrice: (value: number) => {
        return query.andWhere('product.price <= :maxPrice', { maxPrice: value });
      },
  
      categoryId: (categoryId: string) => {
        return query.andWhere('product.category = :categoryId', { categoryId });
      },
  
      orderByPrice: (order: 'ASC' | 'DESC') => {
        return query.addOrderBy('product.price', order);
      },
    };
  }
}
