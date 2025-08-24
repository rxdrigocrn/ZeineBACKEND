import { IsString, IsOptional, IsNumber, IsEnum, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ProductStatus } from '@prisma/client';

export class UpdateProductDto {
    @IsString()
    @IsOptional()
    title?: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsOptional()
    @Transform(({ value }) => (value !== undefined ? parseFloat(value) : value))
    @IsNumber({ maxDecimalPlaces: 2 })
    @Min(0.01)
    price?: number;

    @IsString()
    @IsOptional()
    categoryId?: string;

    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;
}
