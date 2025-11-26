const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

const FALLBACK_CATEGORY_NAME = 'Others';

const CategoryInput = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
  iconUrl: z.string().trim().optional().nullable(),
});
const DeleteCategoryPayload = z
  .object({
    behavior: z.enum(['delete-items', 'reassign']).optional(),
    fallbackName: z.string().trim().min(1).optional(),
  })
  .optional();

async function deactivateEmptyFallback(tx) {
  const fallback = await tx.category.findFirst({
    where: { name: FALLBACK_CATEGORY_NAME },
    select: { id: true, active: true },
  });
  if (!fallback || !fallback.active) return;
  const count = await tx.product.count({
    where: { categoryId: fallback.id },
  });
  if (count === 0) {
    await tx.category.update({
      where: { id: fallback.id },
      data: { active: false },
    });
  }
}

router.get('/', async (_req, res) => {
  try {
    const rows = await prisma.$transaction(async (tx) => {
      await deactivateEmptyFallback(tx);
      return tx.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
    });
    res.json(rows);
  } catch (err) {
    console.error('GET /categories failed:', err);
    res.status(500).json({ error: 'Failed to load categories' });
  }
});

router.post('/', async (req, res) => {
  const d = CategoryInput.parse(req.body);
  const row = await prisma.category.create({
    data: {
      name: d.name,
      active: d.active ?? true,
      iconUrl: d.iconUrl ?? null,
    },
  });
  res.json(row);
});

router.put('/:id', async (req, res) => {
  const id = Number(req.params.id);
  const d = CategoryInput.partial().parse(req.body);
  const row = await prisma.category.update({
    where: { id },
    data: {
      ...(d.name !== undefined ? { name: d.name } : {}),
      ...(d.active !== undefined ? { active: d.active } : {}),
      ...(d.iconUrl !== undefined ? { iconUrl: d.iconUrl ?? null } : {}),
    },
  });
  res.json(row);
});

router.delete('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Invalid category id' });
  }
  const payload = DeleteCategoryPayload.parse(req.body ?? {});
  const behavior = payload?.behavior || 'delete-items';
  const fallbackName =
    (payload?.fallbackName && payload.fallbackName.trim()) || FALLBACK_CATEGORY_NAME;
  try {
    await prisma.$transaction(async (tx) => {
      const existing = await tx.category.findUnique({
        where: { id },
        select: { id: true, name: true },
      });
      if (!existing) {
        const err = new Error('NOT_FOUND');
        throw err;
      }

      if (behavior === 'reassign') {
        const fallback = await tx.category.upsert({
          where: { name: fallbackName },
          update: { active: true },
          create: { name: fallbackName, active: true },
        });
        await tx.product.updateMany({
          where: { categoryId: id },
          data: { categoryId: fallback.id },
        });
      } else {
        await tx.product.updateMany({
          where: { categoryId: id },
          data: { active: false },
        });
      }

      await tx.category.update({ where: { id }, data: { active: false } });
    });
    res.json({ ok: true });
  } catch (err) {
    if (err?.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Category not found' });
    }
    console.error('DELETE /categories/:id failed', err);
    res.status(500).json({ error: 'Failed to remove category' });
  }
});

module.exports = router;
