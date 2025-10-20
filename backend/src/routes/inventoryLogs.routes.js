const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const InventoryLogQuery = z.object({
  take: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.coerce.number().int().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  userId: z.coerce.number().int().optional(),
  productId: z.string().optional(),
});

const shapeLog = (log) => ({
  id: log.id,
  action: log.action,
  productId: log.productId,
  productName: log.productName,
  detail: log.detail || null,
  stock: log.stock,
  oldPrice: log.oldPrice,
  newPrice: log.newPrice,
  category: log.category || null,
  createdAt: log.createdAt,
  user: log.user
    ? {
        id: log.user.id,
        fullName: log.user.fullName,
        username: log.user.username,
      }
    : null,
});

router.get('/', async (req, res) => {
  try {
    const query = InventoryLogQuery.parse(req.query || {});
    const where = {};

    if (query.from || query.to) {
      where.createdAt = {};
      if (query.from) where.createdAt.gte = new Date(query.from);
      if (query.to) where.createdAt.lte = new Date(query.to);
    }

    if (query.userId) {
      where.userId = query.userId;
    }

    if (query.productId) {
      where.productId = query.productId;
    }

    if (query.search) {
      const searchTerm = query.search.trim();
      where.OR = [
        { productName: { contains: searchTerm, mode: 'insensitive' } },
        { detail: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    const take = query.take || 50;

    const logs = await prisma.inventoryLog.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
    });

    const nextCursor =
      logs.length === take ? logs[logs.length - 1].id : null;

    res.json({
      data: logs.map(shapeLog),
      nextCursor,
    });
  } catch (error) {
    console.error('GET /inventory/logs failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid query' });
    }
    res.status(500).json({ error: 'Failed to fetch inventory logs' });
  }
});

module.exports = router;

