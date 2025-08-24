import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { CategoriesModule } from './categories/categories.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), 
    PrismaModule,
    AuthModule,
    UsersModule,
    ProductsModule,
    DashboardModule,
    CategoriesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}