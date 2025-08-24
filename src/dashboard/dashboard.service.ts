import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class DashboardService {

    constructor(private productsService: ProductsService) { }

    async getKpis(userId: string) {
        const productsData = await this.productsService.findAll(
            { page: '1', limit: '1000' },
            userId
        );

        const productsSold = productsData.data.filter(p => p.status === 'Vendido').length;
        const productsAnnounced = productsData.data.filter(p => p.status === 'Anunciado').length;
        const productsCanceled = productsData.data.filter(p => p.status === 'Cancelado').length;

        const visitors = Array.from({ length: 30 }, () => Math.floor(Math.random() * 150 + 20));

        return {
            productsSold,
            productsAnnounced,
            productsCanceled,
            visitors,
        };
    }


}
