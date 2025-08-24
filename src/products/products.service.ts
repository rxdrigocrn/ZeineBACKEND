// src/products/products.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Prisma, Product } from '@prisma/client';
import { FindProductsQueryDto } from './dto/find-products-query.dto';

@Injectable()
export class ProductsService {
  private readonly baseUrl: string;

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  constructor(private prisma: PrismaService) {
    this.baseUrl = process.env.BASE_URL || 'http://localhost:5000';
  }

  async create(
    createProductDto: CreateProductDto,
    userId: string,
    imageUrl: string,
  ): Promise<Product> {
    if (!createProductDto.categoryId) {
      throw new BadRequestException('Categoria é obrigatória.');
    }

    const slug = this.generateSlug(createProductDto.title);

    const exists = await this.prisma.product.findUnique({ where: { slug_userId: { slug, userId } } });
    if (exists) {
      throw new BadRequestException(
        'Já existe um produto com esse título, escolha outro.',
      );
    }

    return this.prisma.product.create({
      data: {
        ...createProductDto,
        userId,
        image: imageUrl,
        categoryId: createProductDto.categoryId,
        slug,
      },
    });
  }

  async findAll(query: FindProductsQueryDto, userId: string) {
    const { search, status, page = '1', limit = '10' } = query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);

    if (isNaN(pageNumber) || pageNumber < 1) {
      throw new BadRequestException('Número de página inválido.');
    }
    if (isNaN(limitNumber) || limitNumber < 1) {
      throw new BadRequestException('Limite inválido.');
    }

    const skip = (pageNumber - 1) * limitNumber;
    const where: Prisma.ProductWhereInput = { userId };

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
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    const dataWithFullUrl = products.map((p) => ({
      ...p,
      image: p.image?.startsWith('http')
        ? p.image
        : `${this.baseUrl}${p.image.replace(/^\./, '')}`,
    }));

    return {
      data: dataWithFullUrl,
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
    return {
      ...product,
      image: product.image?.startsWith('http')
        ? product.image
        : `${this.baseUrl}${product.image.replace(/^\./, '')}`,
    };
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
    userId: string,
    imageUrl?: string,
  ): Promise<Product> {
    const product = await this.findOne(id);

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para editar este produto.',
      );
    }

    const updatedSlug = updateProductDto.title
      ? this.generateSlug(updateProductDto.title)
      : product.slug;

    return this.prisma.product.update({
      where: { id },
      data: {
        ...updateProductDto,
        ...(imageUrl ? { image: imageUrl } : {}),
        ...(updateProductDto.categoryId
          ? { categoryId: updateProductDto.categoryId }
          : {}),
        slug: updatedSlug,
      },
    });
  }

  async findBySlug(slug: string, userId: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { slug_userId: { slug, userId } },
    });
    if (!product) {
      throw new NotFoundException(`Produto com slug "${slug}" não encontrado.`);
    }
    return {
      ...product,
      image: product.image?.startsWith('http')
        ? product.image
        : `${this.baseUrl}${product.image.replace(/^\./, '')}`,
    };
  }

  async remove(id: string, userId: string): Promise<Product> {
    const product = await this.findOne(id);

    if (product.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este produto.',
      );
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async countByStatus(status: 'Vendido' | 'Anunciado' | 'Cancelado') {
    if (!status) {
      throw new BadRequestException('Status é obrigatório.');
    }
    return this.prisma.product.count({ where: { status } });
  }
}
