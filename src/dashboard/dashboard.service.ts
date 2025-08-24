import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';

@Injectable()
export class DashboardService {

    constructor(private productsService: ProductsService) { }


    async getKpis() {
        const productsData = await this.productsService.findAll({ page: '1', limit: '1000' });
        const totalActiveProducts = productsData.data.filter(product => product.status === 'Vendido').length;
        const totalInactiveProducts = productsData.data.filter(product => product.status === 'Cancelado').length;
        const visitors = Array.from({ length: 30 }, () => Math.floor(Math.random() * 150 + 20));

        return {
            totalActiveProducts,
            totalInactiveProducts,
            visitors,
        };
    }

}
