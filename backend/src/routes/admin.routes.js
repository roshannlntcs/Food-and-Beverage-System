const router = require('express').Router();
const { PrismaClient, Role } = require('@prisma/client');
const { z } = require('zod');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { recordInventoryLog } = require('../lib/inventory');

const prisma = new PrismaClient();
const DEFAULT_STOCK = 100;

function assertSuperAdmin(req, res, next) {
  try {
    if (!req.user || req.user.role !== Role.SUPER_ADMIN) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  } catch (e) {
    return res.status(403).json({ error: 'Forbidden' });
  }
}

const ScopeEnum = z.enum([
  'transactions','voids','users','categories','products','all','stock'
]);

const ResetPayload = z.object({
  scope: z
    .union([ScopeEnum, z.array(ScopeEnum).nonempty()])
    .optional(),
  qty: z.coerce.number().int().min(0).max(9999).optional(), // for stock reset override; optional
});

// Reset subsets of data (transactions, voids, users, categories, products)
router.post('/reset', assertSuperAdmin, async (req, res) => {
  try {
    const { scope, qty } = ResetPayload.parse(req.body || {});

    let scopes = [];
    if (!scope) {
      scopes = ['all'];
    } else if (Array.isArray(scope)) {
      scopes = scope;
    } else {
      scopes = [scope];
    }

    if (scopes.includes('all')) {
      scopes = ['transactions', 'voids', 'users', 'categories', 'products'];
    }

    const applied = Array.from(new Set(scopes));
    const defaultQty = Number.isFinite(qty) ? qty : DEFAULT_STOCK;

    const resetTransactions =
      applied.includes('transactions') ||
      applied.includes('products') ||
      applied.includes('categories');
    const resetVoidLogs = applied.includes('voids') || resetTransactions;
    const resetProducts = applied.includes('products') || applied.includes('categories');
    const resetCategories = applied.includes('categories');
    const resetUsers = applied.includes('users');

    const menuPath = path.join(__dirname, '..', '..', 'prisma', 'defaultMenu.json');
    const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf8'));

    await prisma.$transaction(async (tx) => {
      if (resetVoidLogs) {
        await tx.voidLog.deleteMany({});
      }

      if (resetTransactions) {
        await tx.payment.deleteMany({});
        await tx.orderItem.deleteMany({});
        await tx.order.deleteMany({});
      }

      if (resetProducts) {
        await tx.inventoryLog.deleteMany({});
        await tx.product.deleteMany({});
      }

      if (resetCategories) {
        await tx.category.deleteMany({});
      }

      if (resetUsers) {
        const currentUserIdRaw = Number(req.user?.sub);
        await tx.user.deleteMany({
          where: {
            AND: [
              ...(Number.isFinite(currentUserIdRaw) ? [{ id: { not: currentUserIdRaw } }] : []),
              { role: { not: Role.SUPER_ADMIN } },
            ],
          },
        });
      }

      if (resetCategories) {
        for (const c of menuData.categories || []) {
          const category = await tx.category.create({
            data: {
              name: c.name,
              active: true,
              iconUrl: c.iconUrl || c.icon || null,
            },
          });
          for (const p of c.products || []) {
            await tx.product.create({
              data: {
                id: String(
                  p.id || p.sku || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
                ),
                name: p.name,
                sku: p.sku || null,
                price: Number(p.price || 0),
                imageUrl: p.imageUrl || null,
                active: p.active ?? true,
                quantity: Number.isFinite(p.quantity) ? p.quantity : DEFAULT_STOCK,
                status: p.status || 'Available',
                allergens: p.allergens || null,
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
                addons: Array.isArray(p.addons) ? p.addons : [],
                description: p.description || null,
                categoryId: category.id,
              },
            });
          }
        }
      } else if (resetProducts) {
        for (const c of menuData.categories || []) {
          const category = await tx.category.upsert({
            where: { name: c.name },
            update: {
              active: true,
              iconUrl: c.iconUrl || c.icon || null,
            },
            create: {
              name: c.name,
              active: true,
              iconUrl: c.iconUrl || c.icon || null,
            },
          });
          for (const p of c.products || []) {
            await tx.product.create({
              data: {
                id: String(
                  p.id || p.sku || (p.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')
                ),
                name: p.name,
                sku: p.sku || null,
                price: Number(p.price || 0),
                imageUrl: p.imageUrl || null,
                active: p.active ?? true,
                quantity: Number.isFinite(p.quantity) ? p.quantity : DEFAULT_STOCK,
                status: p.status || 'Available',
                allergens: p.allergens || null,
                sizes: Array.isArray(p.sizes) ? p.sizes : [],
                addons: Array.isArray(p.addons) ? p.addons : [],
                description: p.description || null,
                categoryId: category.id,
              },
            });
          }
        }
      }
      if (applied.includes('stock')) {
        await tx.product.updateMany({ data: { quantity: DEFAULT_STOCK } });
        await recordInventoryLog(tx, {
          productId: null,
          productName: 'BULK',
          action: 'RESET_QUANTITY',
          detail:`Set all product quantities to ${defaultQty}`,
          stock: defaultQty,
          category: null,
          userId: Number(req.user?.sub) || null,
        });
      }
    });

    res.json({ ok: true, scopes: applied });
  } catch (error) {
    console.error('POST /admin/reset failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    res.status(500).json({ error: error?.message || 'Reset failed' });
  }
});

// Batch import users (CSV-parsed on frontend -> JSON here)
router.post('/import-users', assertSuperAdmin, async (req, res) => {
  try {
    const Input = z.object({
      users: z.array(z.object({
        schoolId: z.string().trim().min(1),
        username: z.string().trim().min(1),
        fullName: z.string().trim().min(1),
        role: z.nativeEnum(Role),
        password: z.string().min(6),
        program: z.string().trim().optional().nullable(),
        section: z.string().trim().optional().nullable(),
        sex: z.string().trim().optional().nullable(),
      }))
    });
    const { users } = Input.parse(req.body || {});

    const created = [];
    for (const u of users) {
      const passwordHash = await bcrypt.hash(u.password, 10);
      const user = await prisma.user.upsert({
        where: { username: u.username.toLowerCase() },
        update: {
          schoolId: u.schoolId.toLowerCase(),
          fullName: u.fullName.trim(),
          role: u.role,
          program: u.program || null,
          section: u.section || null,
          sex: u.sex || null,
          passwordHash,
        },
        create: {
          schoolId: u.schoolId.toLowerCase(),
          username: u.username.toLowerCase(),
          fullName: u.fullName.trim(),
          role: u.role,
          program: u.program || null,
          section: u.section || null,
          sex: u.sex || null,
          passwordHash,
        }
      });
      created.push({ id: user.id, schoolId: user.schoolId, username: user.username, fullName: user.fullName, role: user.role });
    }

    res.json({ users: created });
  } catch (error) {
    console.error('POST /admin/import-users failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid input' });
    }
    res.status(500).json({ error: 'Import failed' });
  }
});

module.exports = router;
