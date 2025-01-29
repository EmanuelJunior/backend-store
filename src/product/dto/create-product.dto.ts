import { IsNotEmpty, IsNumber, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateProductDto {
    
    @IsString()
    @IsNotEmpty()
    @MinLength(3)
    name: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(25)
    @MaxLength(255)
    description: string;

    @IsNumber()
    price: number;

    @IsUUID()
    @IsNotEmpty()
    categoryId: string;
}
