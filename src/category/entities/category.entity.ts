import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../product/entities/product.entity';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('varchar', { unique: true, nullable: false })
  name: string;

  @OneToMany(
    () => Product,
    (product) => product.category,
  )
  products: Product[];

  // Convertir en Capitalize el name antes de insertar
  @BeforeInsert()
  toCapitalize() {
    if (this.name && this.name.trim()) {
      this.name = 
        this.name.charAt(0).toUpperCase() + 
        this.name.slice(1).toLowerCase();
    } else {
      throw new Error('El nombre no puede estar vacío.');
    }
  }
}
