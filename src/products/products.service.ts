// src/products/products.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, Product } from '@prisma/client';
import { FindProductsQueryDto } from './dto/find-products-query.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(createProductDto: CreateProductDto, userId: string): Promise<Product> {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        userId,
      },
    });
  }

  async findAll(query: FindProductsQueryDto) {
    const { search, status, page = '1', limit = '10' } = query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const where: Prisma.ProductWhereInput = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.status = status;
    }

    const [products, total] = await this.prisma.$transaction([
        this.prisma.product.findMany({
            where,
            skip,
            take: limitNumber,
            orderBy: { createdAt: 'desc' },
        }),
        this.prisma.product.count({ where }),
    ]);

    return {
        data: products,
        total,
        page: pageNumber,
        totalPages: Math.ceil(total / limitNumber),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Produto com ID "${id}" não encontrado.`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto, userId: string): Promise<Product> {
    const product = await this.findOne(id);

    if (product.userId !== userId) {
        throw new ForbiddenException('Você não tem permissão para editar este produto.');
    }

    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async remove(id: string, userId: string): Promise<Product> {
    const product = await this.findOne(id);

    if (product.userId !== userId) {
        throw new ForbiddenException('Você não tem permissão para remover este produto.');
    }

    return this.prisma.product.delete({
      where: { id },
    });
  }
}