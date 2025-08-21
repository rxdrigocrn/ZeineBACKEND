import { IsOptional, IsString, IsIn, IsNumberString, IsEnum } from 'class-validator';
import { ProductStatus } from '@prisma/client';

export class FindProductsQueryDto {
    @IsOptional()
    @IsString()
    search?: string;

    @IsOptional()
    @IsEnum(ProductStatus)
    status?: ProductStatus;

    @IsOptional()
    @IsNumberString()
    page?: string;

    @IsOptional()
    @IsNumberString()
    limit?: string;
}