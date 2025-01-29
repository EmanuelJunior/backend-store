import { IsOptional, IsString, IsUUID, IsNumber, Min, IsIn } from 'class-validator';

export class FilterProductDto {

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @IsIn(
    ['ASC', 'DESC'], 
    { message: 'El orden debe ser ASC o DESC.' }
  )
  @IsOptional()
  orderByPrice?: 'ASC' | 'DESC';
}
