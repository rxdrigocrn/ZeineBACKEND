import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    Req,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';
import { FindProductsQueryDto } from './dto/find-products-query.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import {
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { memoryStorage } from 'multer';
import * as fs from 'fs';

const BASE_URL = process.env.BASE_URL || '';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
    @Post()
    async create(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png)$/ }),
                ],
                fileIsRequired: true,
            }),
        )
        file: Express.Multer.File,
        @Body() createProductDto: CreateProductDto,
        @Req() req: Request,
    ) {
        const userId = (req.user as any).userId;

        fs.mkdirSync('./uploads/products', { recursive: true });

        const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
        const filename = `${Date.now()}-${safeName}`;
        const imagePath = `/uploads/products/${filename}`;

        fs.writeFileSync(`.${imagePath}`, file.buffer);
        const imageUrl = `${BASE_URL}${imagePath}`;

        return this.productsService.create(createProductDto, userId, imageUrl);
    }

    @UseGuards(JwtAuthGuard)
    @Get()
    findAll(@Query() query: FindProductsQueryDto, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.productsService.findAll(query, userId);
    }


    @Get(':id')
    findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.productsService.findOne(id);
    }

    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('image', { storage: memoryStorage() }))
    @Patch(':id')
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png)$/ }),
                ],
                fileIsRequired: false,
            }),
        )
        file: Express.Multer.File,
        @Body() updateProductDto: UpdateProductDto,
        @Req() req: Request,
    ) {
        const userId = (req.user as any).userId;

        let imageUrl: string | undefined;
        if (file) {
            fs.mkdirSync('./uploads/products', { recursive: true });

            const safeName = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_');
            const filename = `${Date.now()}-${safeName}`;
            const imagePath = `/uploads/products/${filename}`;

            fs.writeFileSync(`.${imagePath}`, file.buffer);
            imageUrl = `${BASE_URL}${imagePath}`;
        }

        return this.productsService.update(id, updateProductDto, userId, imageUrl);
    }


    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    remove(@Param('id', ParseUUIDPipe) id: string, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.productsService.remove(id, userId);
    }
    
    @UseGuards(JwtAuthGuard)
    @Get('slug/:slug')
    async findBySlug(@Param('slug') slug: string, @Req() req: Request) {
        const userId = (req.user as any).userId;
        return this.productsService.findBySlug(slug, userId);
    }


}
