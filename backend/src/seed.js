require('dotenv').config();
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const {
  PrismaClient,
  Role,
  SupplierStatus,
  SupplierLogType,
} = require('@prisma/client');

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

  console.log('✓ Default categories and menu items ensured.');
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
    `✓ Superadmin ensured (username: ${username}, default password: ${password})`
  );
}

async function seedSuppliersWithLogs() {
  const samples = [
    {
      name: 'Davao Fresh Supplies',
      status: SupplierStatus.ACTIVE,
      contactPerson: 'Maria Santos',
      phone: '09171234567',
      email: 'davaofresh@example.com',
      address: 'Davao City',
      products: 'Chicken, Eggs',
      notes: 'Primary poultry supplier.',
      deliveries: [
        {
          productId: 'chicken-adobo',
          quantity: 30,
          unitCost: 145,
          notes: 'Initial chicken shipment for reopening.',
        },
        {
          productId: 'plain-rice',
          quantity: 80,
          unitCost: 45,
          notes: 'Seed batch of rice packs for breakfast menu.',
        },
      ],
    },
    {
      name: 'Tagum Veggies Depot',
      status: SupplierStatus.ACTIVE,
      contactPerson: 'Rowena Lim',
      phone: '09173334455',
      email: 'tagumveggies@example.com',
      address: 'Tagum City',
      products: 'Vegetables, Spices',
      notes: 'Delivers greens twice a week.',
      deliveries: [
        {
          productId: 'laing',
          quantity: 40,
          unitCost: 55,
          notes: 'Mixed vegetable crate for stews.',
        },
      ],
    },
    {
      name: 'Panabo Cold Storage',
      status: SupplierStatus.INACTIVE,
      contactPerson: 'Dexter Lim',
      phone: '09334455667',
      email: 'panabocold@example.com',
      address: 'Panabo City',
      products: 'Frozen meats',
      notes: 'Paused while facility is under renovation.',
      deliveries: [],
      statusChange: {
        previousStatus: SupplierStatus.ACTIVE,
        nextStatus: SupplierStatus.INACTIVE,
        notes: 'Temporarily inactive for warehouse maintenance.',
      },
    },
  ];

  for (const sample of samples) {
    let supplier = await prisma.supplier.findFirst({
      where: { name: sample.name },
    });

    if (supplier) {
      supplier = await prisma.supplier.update({
        where: { id: supplier.id },
        data: {
          status: sample.status,
          contactPerson: sample.contactPerson,
          phone: sample.phone,
          email: sample.email,
          address: sample.address,
          products: sample.products,
          notes: sample.notes,
        },
      });
    } else {
      supplier = await prisma.supplier.create({
        data: {
          name: sample.name,
          status: sample.status,
          contactPerson: sample.contactPerson,
          phone: sample.phone,
          email: sample.email,
          address: sample.address,
          products: sample.products,
          notes: sample.notes,
        },
      });
    }

    const existingLogs = await prisma.supplierLog.count({
      where: { supplierId: supplier.id },
    });
    if (existingLogs > 0) continue;

    if (Array.isArray(sample.deliveries)) {
      for (const delivery of sample.deliveries) {
        let product = null;

        if (delivery.productId) {
          product = await prisma.product.findUnique({
            where: { id: delivery.productId },
            include: { category: true },
          });
        }

        if (!product && delivery.productNameContains) {
          product = await prisma.product.findFirst({
            where: {
              active: true,
              name: {
                contains: delivery.productNameContains,
              },
            },
            include: { category: true },
          });
        }

        if (!product) {
          product = await prisma.product.findFirst({
            where: { active: true },
            include: { category: true },
          });
        }

        if (!product) continue;

        await prisma.$transaction(async (tx) => {
          const current = await tx.product.findUnique({
            where: { id: product.id },
            include: { category: true },
          });
          if (!current) return;

          const updated = await tx.product.update({
            where: { id: current.id },
            data: { quantity: current.quantity + delivery.quantity },
            include: { category: true },
          });

          const inventoryLog = await tx.inventoryLog.create({
            data: {
              productId: updated.id,
              productName: updated.name,
              action: 'SUPPLIER_DELIVERY',
              detail: `${delivery.quantity} units from ${supplier.name}`,
              stock: updated.quantity,
              oldPrice: current.price,
              newPrice: updated.price,
              category: updated.category?.name || null,
              userId: null,
            },
          });

          await tx.supplierLog.create({
            data: {
              supplierId: supplier.id,
              type: SupplierLogType.DELIVERY,
              productId: updated.id,
              productName: updated.name,
              quantity: delivery.quantity,
              unitCost: delivery.unitCost,
              status: supplier.status,
              notes: delivery.notes || null,
              metadata: {
                previousStock: current.quantity,
                newStock: updated.quantity,
                receivedQuantity: delivery.quantity,
                unitCost: delivery.unitCost,
              },
              inventoryLogId: inventoryLog.id,
              recordedById: null,
            },
          });
        });
      }
    }

    if (sample.statusChange) {
      const metadata = {
        previousStatus: sample.statusChange.previousStatus,
        nextStatus: sample.statusChange.nextStatus,
      };

      await prisma.supplierLog.create({
        data: {
          supplierId: supplier.id,
          type: SupplierLogType.STATUS_CHANGE,
          status: sample.statusChange.nextStatus,
          notes: sample.statusChange.notes || null,
          metadata,
          recordedById: null,
        },
      });

      await prisma.inventoryLog.create({
        data: {
          productId: null,
          productName: `Supplier: ${supplier.name}`,
          action: 'SUPPLIER_STATUS',
          detail: `Supplier marked as ${sample.statusChange.nextStatus}`,
          stock: null,
          oldPrice: null,
          newPrice: null,
          category: null,
          userId: null,
        },
      });
    }

    console.log(`✓ Sample logs seeded for supplier: ${sample.name}`);
  }
}

async function main() {
  await seedDefaultMenu();
  await seedSuperAdmin();
  await seedSuppliersWithLogs();
}

main()
  .then(() => {
    console.log('✓ Seed complete.');
  })
  .catch((err) => {
    console.error('✗ Seed failed:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
