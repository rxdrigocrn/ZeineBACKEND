import { IsString, IsNotEmpty, IsNumber, IsEnum, Min } from 'class-validator';
import {  ProductCategory } from '@prisma/client';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    price: number;

    @IsEnum(ProductCategory )
    category: ProductCategory;
}