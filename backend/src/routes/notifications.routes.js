const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const router = express.Router();

const MAX_RETURN = 500;
const MAX_BATCH = 200;
const MAX_KEY_LENGTH = 255;

const getUserId = (req) => {
  const raw = Number(req.user?.sub);
  if (!Number.isFinite(raw) || raw <= 0) return null;
  return raw;
};

const MarkReadSchema = z.object({
  ids: z
    .array(z.union([z.string(), z.number()]))
    .min(1, 'At least one notification id is required')
    .max(MAX_BATCH, `Cannot mark more than ${MAX_BATCH} notifications at once`),
});

const normalizeIds = (ids = []) =>
  Array.from(
    new Set(
      ids
        .map((value) => {
          if (value === null || value === undefined) return null;
          const str = String(value).trim();
          if (!str) return null;
          return str.length > MAX_KEY_LENGTH ? str.slice(0, MAX_KEY_LENGTH) : str;
        })
        .filter(Boolean)
    )
  );

router.get('/read', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const records = await prisma.notificationRead.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: MAX_RETURN,
      select: { notificationKey: true },
    });

    res.json({ ids: records.map((record) => record.notificationKey) });
  } catch (error) {
    console.error('GET /notifications/read failed:', error);
    res.status(500).json({ error: 'Failed to load notification reads' });
  }
});

router.post('/mark-read', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const parsed = MarkReadSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res
        .status(400)
        .json({ error: parsed.error.issues[0]?.message || 'Invalid payload' });
    }

    const ids = normalizeIds(parsed.data.ids);
    if (!ids.length) {
      return res.status(400).json({ error: 'No notification ids provided' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.notificationRead.createMany({
        data: ids.map((notificationKey) => ({ userId, notificationKey })),
      });

      // keep table bounded per user (retain most recent MAX_RETURN entries)
      const total = await tx.notificationRead.count({ where: { userId } });
      if (total > MAX_RETURN) {
        const excess = total - MAX_RETURN;
        const toDelete = await tx.notificationRead.findMany({
          where: { userId },
          orderBy: { createdAt: 'asc' },
          take: excess,
          select: { id: true },
        });
        if (toDelete.length) {
          await tx.notificationRead.deleteMany({
            where: { id: { in: toDelete.map((item) => item.id) } },
          });
        }
      }
    });

    res.json({ ids });
  } catch (error) {
    console.error('POST /notifications/mark-read failed:', error);
    res.status(500).json({ error: 'Failed to mark notifications read' });
  }
});

module.exports = router;
