const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { z } = require('zod');

const CategoryInput = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
  iconUrl: z.string().trim().optional().nullable(),
});

router.get('/', async (_req, res) => {
  const rows = await prisma.category.findMany({ where: { active: true }, orderBy: { name: 'asc' } });
  res.json(rows);
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
  await prisma.category.update({ where: { id }, data: { active: false } });
  res.json({ ok: true });
});

module.exports = router;
