import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Category } from '../../category/entities/category.entity';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true })
  name: string;

  @Column('varchar', { unique: true })
  description: string;

  @Column('float')
  price: number;

  @ManyToOne(
    () => Category, 
    (category) => category.products, 
    { eager: true }
  )
  category: Category;
}
