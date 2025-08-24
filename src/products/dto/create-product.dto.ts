import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductCategory } from '@prisma/client';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @Transform(({ value }) => parseFloat(value)) // converte string para number
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    price: number;

    @IsString()
    @IsNotEmpty()
    categoryId: string;  
}
