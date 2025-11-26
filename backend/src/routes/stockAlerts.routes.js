const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const StockAlertPayload = z.object({
  signature: z.string().max(2048).optional().nullable(),
});

function getUserId(req) {
  const rawId = Number(req.user?.sub);
  if (!Number.isFinite(rawId) || rawId <= 0) {
    return null;
  }
  return rawId;
}

router.get('/state', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user context' });
  }
  try {
    const state = await prisma.$transaction(async (tx) => {
      const existing = await tx.stockAlertState.findUnique({
        where: { userId },
      });
      if (existing) return existing;

      return tx.stockAlertState.create({
        data: {
          userId,
          signature: '',
        },
      });
    });
    res.json({
      signature: state?.signature || '',
      dismissedAt: state?.updatedAt || null,
    });
  } catch (error) {
    console.error('GET /stock-alerts/state failed:', error);
    res.status(500).json({ error: 'Failed to load stock alert state' });
  }
});

router.post('/state', async (req, res) => {
  const userId = getUserId(req);
  if (!userId) {
    return res.status(400).json({ error: 'Invalid user context' });
  }
  try {
    const { signature } = StockAlertPayload.parse(req.body || {});
    const normalizedSignature = (signature || '').trim();
    const state = await prisma.$transaction(async (tx) => {
      await tx.stockAlertState.upsert({
        where: { userId },
        update: { signature: normalizedSignature },
        create: { userId, signature: normalizedSignature },
      });

      return tx.stockAlertState.findUnique({
        where: { userId },
      });
    });
    res.json({
      signature: state?.signature || '',
      dismissedAt: state?.updatedAt || null,
    });
  } catch (error) {
    console.error('POST /stock-alerts/state failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    res.status(500).json({ error: 'Failed to persist stock alert state' });
  }
});

module.exports = router;
