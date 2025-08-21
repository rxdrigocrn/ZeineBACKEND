import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { ProductCategory, ProductStatus } from '@prisma/client';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    @IsOptional()
    price?: number;

    @IsEnum(ProductCategory)
    @IsOptional()
    category?: ProductCategory;

    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;
}