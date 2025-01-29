import { IsIn, IsOptional, IsString } from "class-validator";

export class FilterCategoryDto {

  @IsIn(
    ['ASC', 'DESC'], 
    { message: 'El orden debe ser ASC o DESC.' }
  )
  @IsOptional()
  order?: 'ASC' | 'DESC';
}