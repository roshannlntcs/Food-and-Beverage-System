const router = require('express').Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

function parseDate(input) {
  if (!input) return null;
  const dt = new Date(input);
  return Number.isNaN(+dt) ? null : dt;
}

// Admin dashboard summary
router.get('/admin', async (req, res) => {
  try {
    const Query = z.object({
      from: z.string().optional(),
      to: z.string().optional(),
    });
    const q = Query.parse(req.query || {});
    const from = parseDate(q.from);
    const to = parseDate(q.to);

    const whereOrder = {
      ...(from ? { createdAt: { gte: from } } : {}),
      ...(to ? { createdAt: { lte: to } } : {}),
    };

    const [orders, payments, items, lowStockCount, activeProducts] = await Promise.all([
      prisma.order.findMany({
        where: whereOrder,
        include: { items: true, payments: true },
      }),
      prisma.payment.findMany({
        where: { order: whereOrder },
        select: { method: true, amount: true },
      }),
      prisma.orderItem.findMany({
        where: { order: whereOrder, voided: false },
        select: { name: true, qty: true, lineTotal: true },
      }),
      prisma.product.count({ where: { quantity: { lte: 5 } } }),
      prisma.product.count({ where: { active: true } }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const totalOrders = orders.length;
    const avgOrderValue = totalOrders ? +(totalRevenue / totalOrders).toFixed(2) : 0;

    const paymentBreakdown = payments.reduce((acc, payment) => {
      const key = payment.method || 'UNKNOWN';
      acc[key] = (acc[key] || 0) + Number(payment.amount || 0);
      return acc;
    }, {});

    const itemMap = new Map();
    for (const item of items) {
      const key = item.name || 'Unknown';
      const record = itemMap.get(key) || { name: key, qty: 0, revenue: 0 };
      record.qty += Number(item.qty || 0);
      record.revenue += Number(item.lineTotal || 0);
      itemMap.set(key, record);
    }
    const topItems = Array.from(itemMap.values())
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 10);

    res.json({
      totalRevenue,
      totalOrders,
      avgOrderValue,
      paymentBreakdown,
      lowStockCount,
      activeProducts,
      topItems,
    });
  } catch (error) {
    console.error('GET /analytics/admin failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid query' });
    }
    res.status(500).json({ error: 'Failed to compute admin analytics' });
  }
});

// Cashier summary
router.get('/cashier/:id', async (req, res) => {
  try {
    const Params = z.object({ id: z.coerce.number().int().positive() });
    const Query = z.object({ from: z.string().optional(), to: z.string().optional() });
    const p = Params.parse(req.params);
    const q = Query.parse(req.query || {});
    const from = parseDate(q.from);
    const to = parseDate(q.to);

    const where = {
      cashierId: p.id,
      ...(from ? { createdAt: { gte: from } } : {}),
      ...(to ? { createdAt: { lte: to } } : {}),
    };

    const [orders, items, voids] = await Promise.all([
      prisma.order.findMany({ where, include: { items: true } }),
      prisma.orderItem.findMany({ where: { order: where, voided: false } }),
      prisma.voidLog.findMany({ where: { cashierId: p.id } }),
    ]);

    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const transactions = orders.length;
    const voidCount = voids.length;
    const itemsSold = items.reduce((sum, item) => sum + Number(item.qty || 0), 0);
    const avgPerTransaction = transactions ? totalRevenue / transactions : 0;

    const tally = new Map();
    for (const item of items) {
      const key = item.name || 'Unknown';
      const record = tally.get(key) || { name: key, qty: 0 };
      record.qty += Number(item.qty || 0);
      tally.set(key, record);
    }
    const topItem = Array.from(tally.values()).sort((a, b) => b.qty - a.qty)[0] || null;

    res.json({
      cashierId: p.id,
      transactions,
      totalRevenue,
      voidCount,
      itemsSold,
      avgPerTransaction,
      topItem,
    });
  } catch (error) {
    console.error('GET /analytics/cashier/:id failed:', error);
    res.status(500).json({ error: 'Failed to compute cashier analytics' });
  }
});

module.exports = router;

