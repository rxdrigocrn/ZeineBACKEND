// prisma/seed.ts
import { PrismaClient, ProductStatus, Category } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')      
    .replace(/[^\w\-]+/g, '')   
    .replace(/\-\-+/g, '-');    
}

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);
  const user = await prisma.user.upsert({
    where: { email: 'admin@teste.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@teste.com',
      password: hashedPassword,
      phone: '11999999999',
    },
  });


  const categoriesData = [
    { name: 'Brinquedo', slug: 'brinquedo', icon: '🎲' },
    { name: 'Vestuário', slug: 'vestiario', icon: '👕' },
    { name: 'Móvel', slug: 'movel', icon: '🪑' },
    { name: 'Papelaria', slug: 'papelaria', icon: '✏️' },
    { name: 'Saúde e Beleza', slug: 'saude-e-beleza', icon: '💄' },
    { name: 'Utensílio', slug: 'utensilio', icon: '🍴' },
  ];


  const categories: Category[] = [];
  for (const cat of categoriesData) {
    const category = await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
    categories.push(category);
  }

  const productsData = [
    {
      title: 'Boneco articulado',
      description: 'Boneco colecionável com articulações',
      price: 150.0,
      image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb',
      status: ProductStatus.Anunciado,
      categoryName: 'Brinquedo',
    },
    {
      title: 'Camiseta básica',
      description: 'Camiseta 100% algodão',
      price: 49.9,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
      status: ProductStatus.Anunciado,
      categoryName: 'Vestuário',
    },
    {
      title: 'Mesa de madeira',
      description: 'Mesa de madeira maciça 1,80m',
      price: 1200.0,
      image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511',
      status: ProductStatus.Vendido,
      categoryName: 'Móvel',
    },
  ];

  for (const p of productsData) {
    const category = categories.find(c => c.name === p.categoryName)!;
    await prisma.product.create({
      data: {
        title: p.title,
        description: p.description,
        price: p.price,
        image: p.image,
        status: p.status,
        userId: user.id,
        categoryId: category.id,
        slug: slugify(p.title),
      },
    });
  }

  console.log('✅ Seed rodado com sucesso');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
