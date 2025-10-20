// backend/src/seed.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { PrismaClient, Role } = require('@prisma/client');

const prisma = new PrismaClient();
const DEFAULT_STOCK = 100;

const slug = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const toArray = (value) => {
  if (Array.isArray(value)) return value;
  if (value === null || value === undefined || value === '') return [];
  return [value];
};

const toNumber = (value, fallback = 0) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

async function seedDefaultMenu() {
  const menuPath = path.join(__dirname, '../prisma/defaultMenu.json');
  if (!fs.existsSync(menuPath)) {
    throw new Error(`Missing default menu file at ${menuPath}`);
  }

  const raw = fs.readFileSync(menuPath, 'utf8');
  const menu = JSON.parse(raw);

  for (const categoryData of menu.categories || []) {
    const category = await prisma.category.upsert({
      where: { name: categoryData.name },
      update: { active: true },
      create: { name: categoryData.name, active: true },
    });

    for (const productData of categoryData.products || []) {
      const productId =
        String(productData.id || productData.sku || slug(productData.name));

      await prisma.product.upsert({
        where: { id: productId },
        update: {
          name: productData.name,
          sku: productData.sku || null,
          price: toNumber(productData.price),
          imageUrl: productData.imageUrl || null,
          active: productData.active ?? true,
          quantity: Number.isInteger(productData.quantity)
            ? productData.quantity
            : DEFAULT_STOCK,
          status: productData.status || 'Available',
          allergens: productData.allergens || null,
          sizes: toArray(productData.sizes),
          addons: toArray(productData.addons),
          description: productData.description || null,
          category: { connect: { id: category.id } },
        },
        create: {
          id: productId,
          name: productData.name,
          sku: productData.sku || null,
          price: toNumber(productData.price),
          imageUrl: productData.imageUrl || null,
          active: productData.active ?? true,
          quantity: Number.isInteger(productData.quantity)
            ? productData.quantity
            : DEFAULT_STOCK,
          status: productData.status || 'Available',
          allergens: productData.allergens || null,
          sizes: toArray(productData.sizes),
          addons: toArray(productData.addons),
          description: productData.description || null,
          category: { connect: { id: category.id } },
        },
      });
    }
  }

  console.log('▶ Default categories and menu items ensured.');
}

async function seedSuperAdmin() {
  const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
  const schoolId = process.env.SUPERADMIN_SCHOOL_ID || 'ADMIN-0000';
  const fullName = process.env.SUPERADMIN_NAME || 'Super Administrator';
  const password = process.env.SUPERADMIN_PASSWORD || 'superadmin';

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.upsert({
    where: { username },
    update: {
      schoolId,
      fullName,
      role: Role.SUPER_ADMIN,
      passwordHash,
    },
    create: {
      schoolId,
      username,
      fullName,
      role: Role.SUPER_ADMIN,
      passwordHash,
      program: null,
      section: null,
      sex: null,
    },
  });

  console.log(
    `▶ Superadmin ensured (username: ${username}, default password: ${password})`
  );
}

async function main() {
  await seedDefaultMenu();
  await seedSuperAdmin();
}

main()
  .then(() => {
    console.log('✅ Seed complete.');
  })
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
