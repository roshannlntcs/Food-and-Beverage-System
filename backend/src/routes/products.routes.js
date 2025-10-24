// backend/src/routes/products.routes.js
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const router = express.Router();
const DEFAULT_STOCK = 100;

// ---------- helpers
const slug = (s) =>
  String(s || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

async function resolveCategoryId({ categoryId, category }) {
  if (categoryId && Number.isFinite(Number(categoryId))) return Number(categoryId);
  const name = String(category || '').trim();
  if (!name) return null;
  // find or create by name (unique in schema)
  const existing = await prisma.category.findUnique({ where: { name } });
  if (existing) return existing.id;
  const created = await prisma.category.create({ data: { name } });
  return created.id;
}

async function recordInventoryLog(
  tx,
  {
    productId,
    productName,
    action,
    detail,
    stock,
    oldPrice,
    newPrice,
    category,
    userId,
  }
) {
  try {
    await tx.inventoryLog.create({
      data: {
        productId: productId || null,
        productName,
        action,
        detail: detail || null,
        stock: stock ?? null,
        oldPrice: oldPrice ?? null,
        newPrice: newPrice ?? null,
        category: category || null,
        userId: userId ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to record inventory log:', error);
  }
}

// Map DB product to response shape (include category name)
function shape(p) {
  if (!p) return p;
  const catName = p.category ? p.category.name : null;
  // strip circular refs
  const { category, ...rest } = p;
  return { ...rest, category: catName };
}

// ---------- validation
const ProductCreate = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  price: z.number(),
  imageUrl: z.string().optional().nullable(),
  quantity: z.number().int().nonnegative().default(DEFAULT_STOCK),
  status: z.string().default('Available'),
  allergens: z.string().optional().nullable(),
  sizes: z.any().optional().nullable(),     // array or json
  addons: z.any().optional().nullable(),    // array or json
  description: z.string().optional().nullable(),
  active: z.boolean().optional(),
  // Either categoryId (number) OR category (name string)
  categoryId: z.number().int().optional().nullable(),
  category: z.string().optional().nullable(),
});

const ProductUpdate = ProductCreate.partial();

// ---------- routes

// GET /products?search=&category=
router.get('/', async (req, res) => {
  try {
    const { search, category, includeInactive } = req.query;
    const where = {
      AND: [
        includeInactive ? undefined : { active: true },
        search
          ? { name: { contains: String(search), mode: 'insensitive' } }
          : undefined,
        category
          ? { category: { is: { name: String(category) } } }
          : undefined,
      ].filter(Boolean),
    };

    const list = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { name: 'asc' },
    });

    res.json(list.map(shape));
  } catch (e) {
    console.error('GET /products failed', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// POST /products
router.post('/', async (req, res) => {
  try {
    const data = ProductCreate.parse(req.body);

    const id = data.id && data.id.trim() ? data.id.trim() : slug(data.name);
    const catId = await resolveCategoryId({
      categoryId: data.categoryId,
      category: data.category,
    });
    const userId = req.user?.sub ? Number(req.user.sub) : null;

    const created = await prisma.$transaction(async (tx) => {
      const product = await tx.product.create({
        data: {
          id,
          name: data.name,
          price: data.price,
          imageUrl: data.imageUrl || null,
          quantity: Number.isFinite(data.quantity) ? data.quantity : DEFAULT_STOCK,
          status: data.status || 'Available',
          allergens: data.allergens || null,
          sizes: data.sizes ?? [],
          addons: data.addons ?? [],
          description: data.description || null,
          active: data.active ?? true,
          ...(catId ? { category: { connect: { id: catId } } } : {}),
        },
        include: { category: true },
      });

      await recordInventoryLog(tx, {
        productId: product.id,
        productName: product.name,
        action: 'ADD',
        detail: `Added new item: ${product.name}`,
        stock: product.quantity,
        oldPrice: null,
        newPrice: product.price,
        category: product.category?.name || null,
        userId,
      });

      return product;
    });

    res.status(201).json(shape(created));
  } catch (e) {
    if (e?.code === 'P2002') {
      return res.status(400).json({ error: 'Product with same name/sku/id already exists.' });
    }
    console.error('POST /products failed', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// PUT /products/:id
router.put('/:id', async (req, res) => {
  try {
    const pathId = String(req.params.id);
    const data = ProductUpdate.parse(req.body);

    const catId = await resolveCategoryId({
      categoryId: data.categoryId,
      category: data.category,
    });
    const userId = req.user?.sub ? Number(req.user.sub) : null;

    const updated = await prisma.$transaction(async (tx) => {
      const current = await tx.product.findUnique({
        where: { id: pathId },
        include: { category: true },
      });
      if (!current) {
        const error = new Error('Product not found');
        error.code = 'P2025';
        throw error;
      }

      const payload = {
        name: data.name,
        price: data.price,
        imageUrl: data.imageUrl ?? undefined,
        status: data.status,
        allergens: data.allergens,
        sizes: data.sizes,
        addons: data.addons,
        description: data.description,
        active: data.active,
      };

      if (data.quantity !== undefined && data.quantity !== null) {
        payload.quantity = Number.isFinite(Number(data.quantity))
          ? Number(data.quantity)
          : DEFAULT_STOCK;
      }

      if (catId) {
        payload.category = { connect: { id: catId } };
      }

      const product = await tx.product.update({
        where: { id: pathId },
        data: payload,
        include: { category: true },
      });

      const changes = [];
      if (current.name !== product.name) {
        changes.push(`name "${current.name}" -> "${product.name}"`);
      }
      if (current.price !== product.price) {
        changes.push(
          `price ₱${Number(current.price || 0).toFixed(2)} -> ₱${Number(product.price || 0).toFixed(2)}`
        );
      }
      if (current.quantity !== product.quantity) {
        changes.push(`quantity ${current.quantity} -> ${product.quantity}`);
      }
      const previousCategory = current.category?.name || '';
      const nextCategory = product.category?.name || '';
      if (previousCategory !== nextCategory) {
        changes.push(`category "${previousCategory}" -> "${nextCategory}"`);
      }
      if ((current.status || '') !== (product.status || '')) {
        changes.push(`status "${current.status || ''}" -> "${product.status || ''}"`);
      }
      if ((current.allergens || '') !== (product.allergens || '')) {
        changes.push('allergens updated');
      }
      if (JSON.stringify(current.addons) !== JSON.stringify(product.addons)) {
        changes.push('addons updated');
      }
      if (JSON.stringify(current.sizes) !== JSON.stringify(product.sizes)) {
        changes.push('sizes updated');
      }
      if ((current.description || '') !== (product.description || '')) {
        changes.push('description updated');
      }

      const detail =
        changes.length > 0
          ? `Updated ${changes.join(', ')}`
          : 'Updated product';

      await recordInventoryLog(tx, {
        productId: product.id,
        productName: product.name,
        action: 'UPDATE',
        detail,
        stock: product.quantity,
        oldPrice: current.price,
        newPrice: product.price,
        category: product.category?.name || null,
        userId,
      });

      return product;
    });

    res.json(shape(updated));
  } catch (e) {
    if (e?.code === 'P2025') {
      return res.status(404).json({ error: 'Product not found' });
    }
    if (e?.code === 'P2002') {
      return res.status(400).json({ error: 'Duplicate product fields' });
    }
    console.error('PUT /products/:id failed:', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// DELETE /products/:id
router.delete('/:id', async (req, res) => {
  try {
    const pathId = String(req.params.id);
    const userId = req.user?.sub ? Number(req.user.sub) : null;

    const archived = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findUnique({
        where: { id: pathId },
        include: { category: true },
      });

      if (!existing) {
        const error = new Error('Product not found');
        error.code = 'P2025';
        throw error;
      }

      const product = await tx.product.update({
        where: { id: pathId },
        data: {
          active: false,
        },
        include: { category: true },
      });

      await recordInventoryLog(tx, {
        productId: product.id,
        productName: product.name,
        action: 'DELETE',
        detail: `Archived product: ${product.name}`,
        stock: product.quantity,
        oldPrice: product.price,
        newPrice: null,
        category: product.category?.name || null,
        userId,
      });

      return product;
    });

    res.json(shape(archived));
  } catch (e) {
    if (e?.code === 'P2025') return res.status(404).json({ error: 'Product not found' });
    console.error('DELETE /products/:id failed', e);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
