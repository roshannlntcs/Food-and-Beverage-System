const router = require('express').Router();
const { PrismaClient, SupplierStatus, SupplierLogType } = require('@prisma/client');
const { z } = require('zod');
const { recordInventoryLog } = require('../lib/inventory');

const prisma = new PrismaClient();

const CreateSchema = z.object({
  name: z.string().trim().min(1),
  contactPerson: z.string().trim().optional().nullable(),
  phone: z.string().trim().optional().nullable(),
  email: z.string().email().optional().nullable(),
  address: z.string().trim().optional().nullable(),
  products: z.string().trim().optional().nullable(),
  notes: z.string().trim().optional().nullable(),
  status: z.nativeEnum(SupplierStatus).optional(),
});

const UpdateSchema = CreateSchema.partial();

const SupplierLogCreateSchema = z
  .object({
    type: z.nativeEnum(SupplierLogType),
    productId: z.string().trim().optional().nullable(),
    productName: z.string().trim().optional().nullable(),
    quantity: z.coerce.number().int().positive().optional(),
    unitCost: z.coerce.number().nonnegative().optional().nullable(),
    status: z.nativeEnum(SupplierStatus).optional(),
    notes: z.string().trim().optional().nullable(),
    metadata: z.record(z.any()).optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.type === SupplierLogType.DELIVERY) {
      if (!data.productId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'productId is required for delivery logs',
          path: ['productId'],
        });
      }
      if (typeof data.quantity !== 'number') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'quantity is required for delivery logs',
          path: ['quantity'],
        });
      }
    }

    if (data.type === SupplierLogType.STATUS_CHANGE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Status changes are recorded automatically when updating suppliers',
        path: ['type'],
      });
    }
  });

const SupplierLogListQuery = z.object({
  take: z.coerce.number().int().min(1).max(200).optional(),
  cursor: z.coerce.number().int().optional(),
  type: z.nativeEnum(SupplierLogType).optional(),
  productId: z.string().trim().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  search: z.string().trim().optional(),
});

const userSelect = { id: true, fullName: true, username: true };
const supplierSelect = { id: true, name: true, status: true };
const productSelect = { id: true, name: true };
const inventoryLogSelect = { id: true, action: true, detail: true, stock: true, createdAt: true };

const LOG_INCLUDE = {
  supplier: { select: supplierSelect },
  product: { select: productSelect },
  recordedBy: { select: userSelect },
  inventoryLog: { select: inventoryLogSelect },
};

const LOG_ORDER = { createdAt: 'desc' };

function shapeSupplierLog(log) {
  return {
    id: log.id,
    type: log.type,
    supplier: log.supplier,
    product: log.product || (log.productId || log.productName
      ? { id: log.productId || null, name: log.productName || null }
      : null),
    productName: log.productName || log.product?.name || null,
    quantity: log.quantity ?? null,
    unitCost: typeof log.unitCost === 'number' ? log.unitCost : null,
    totalCost:
      typeof log.quantity === 'number' && typeof log.unitCost === 'number'
        ? Number((log.quantity * log.unitCost).toFixed(2))
        : null,
    status: log.status || null,
    notes: log.notes || null,
    metadata: log.metadata || null,
    inventoryLog: log.inventoryLog || null,
    recordedBy: log.recordedBy || null,
    createdAt: log.createdAt,
  };
}

function buildLogWhere(query, supplierId) {
  const filters = [];

  if (supplierId) filters.push({ supplierId });
  if (query.type) filters.push({ type: query.type });
  if (query.productId) filters.push({ productId: query.productId });

  if (query.from || query.to) {
    const createdAt = {};
    if (query.from) createdAt.gte = query.from;
    if (query.to) createdAt.lte = query.to;
    filters.push({ createdAt });
  }

  if (query.search) {
    const term = query.search.trim();
    if (term) {
      filters.push({
        OR: [
          { productName: { contains: term, mode: 'insensitive' } },
          { notes: { contains: term, mode: 'insensitive' } },
          { supplier: { name: { contains: term, mode: 'insensitive' } } },
        ],
      });
    }
  }

  if (!filters.length) return undefined;
  if (filters.length === 1) return filters[0];
  return { AND: filters };
}

async function listLogs(req, res, supplierId) {
  try {
    const query = SupplierLogListQuery.parse(req.query || {});
    const take = query.take || 50;

    const logs = await prisma.supplierLog.findMany({
      where: buildLogWhere(query, supplierId),
      include: LOG_INCLUDE,
      orderBy: LOG_ORDER,
      take,
      ...(query.cursor
        ? {
            cursor: { id: query.cursor },
            skip: 1,
          }
        : {}),
    });

    const nextCursor = logs.length === take ? logs[logs.length - 1].id : null;

    res.json({
      data: logs.map(shapeSupplierLog),
      nextCursor,
    });
  } catch (error) {
    console.error('GET supplier logs failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid query' });
    }
    res.status(500).json({ error: 'Failed to fetch supplier logs' });
  }
}

router.get('/', async (_req, res) => {
  try {
    const list = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    res.json({ suppliers: list });
  } catch (error) {
    console.error('GET /suppliers failed:', error);
    res.status(500).json({ error: 'Failed to list suppliers' });
  }
});

router.post('/', async (req, res) => {
  try {
    const data = CreateSchema.parse(req.body || {});
    const userId = req.user?.sub ? Number(req.user.sub) : null;

    const supplier = await prisma.$transaction(async (tx) => {
      const created = await tx.supplier.create({ data });

      await tx.supplierLog.create({
        data: {
          supplierId: created.id,
          type: SupplierLogType.NOTE,
          status: created.status,
          notes: 'Supplier created',
          metadata: data.products ? { products: data.products } : null,
          recordedById: userId,
        },
      });

      return created;
    });

    res.json({ supplier });
  } catch (error) {
    console.error('POST /suppliers failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid input' });
    }
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });

    const data = UpdateSchema.parse(req.body || {});
    const userId = req.user?.sub ? Number(req.user.sub) : null;

    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.supplier.findUnique({ where: { id } });
      if (!existing) {
        const notFound = new Error('Supplier not found');
        notFound.code = 'NOT_FOUND';
        throw notFound;
      }

      const updated = await tx.supplier.update({ where: { id }, data });

      const changeDetails = [];
      ['name', 'contactPerson', 'phone', 'email', 'address', 'products', 'notes'].forEach((field) => {
        if ((existing[field] || '') !== (updated[field] || '')) {
          changeDetails.push({
            field,
            previous: existing[field] || null,
            next: updated[field] || null,
          });
        }
      });

      if (changeDetails.length) {
        await tx.supplierLog.create({
          data: {
            supplierId: id,
            type: SupplierLogType.NOTE,
            status: updated.status,
            notes: `Updated supplier information (${changeDetails.map((c) => c.field).join(', ')})`,
            metadata: { changes: changeDetails },
            recordedById: userId,
          },
        });
      }

      if (data.status && data.status !== existing.status) {
        const metadata = {
          previousStatus: existing.status,
          nextStatus: data.status,
        };

        await tx.supplierLog.create({
          data: {
            supplierId: id,
            type: SupplierLogType.STATUS_CHANGE,
            status: data.status,
            notes: `Status changed from ${existing.status} to ${data.status}`,
            metadata,
            recordedById: userId,
          },
        });

        await recordInventoryLog(tx, {
          productId: null,
          productName: `Supplier: ${updated.name}`,
          action: 'SUPPLIER_STATUS',
          detail: `Supplier ${updated.name} marked as ${data.status}`,
          stock: null,
          oldPrice: null,
          newPrice: null,
          category: null,
          userId,
        });
      }

      return updated;
    });

    res.json({ supplier: result });
  } catch (error) {
    console.error('PUT /suppliers/:id failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid input' });
    }
    if (error.code === 'NOT_FOUND' || error.code === 'P2025') {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(500).json({ error: 'Failed to update supplier' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    await prisma.supplier.delete({ where: { id } });
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /suppliers/:id failed:', error);
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

router.get('/logs', async (req, res) => listLogs(req, res, undefined));

router.get('/:id/logs', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(400).json({ error: 'Invalid id' });
  }
  return listLogs(req, res, id);
});

router.post('/:id/logs', async (req, res) => {
  try {
    const supplierId = Number(req.params.id);
    if (!Number.isInteger(supplierId)) return res.status(400).json({ error: 'Invalid id' });

    const payload = SupplierLogCreateSchema.parse(req.body || {});
    const userId = req.user?.sub ? Number(req.user.sub) : null;

    const result = await prisma.$transaction(async (tx) => {
      const supplier = await tx.supplier.findUnique({ where: { id: supplierId } });
      if (!supplier) {
        const notFound = new Error('Supplier not found');
        notFound.code = 'NOT_FOUND';
        throw notFound;
      }

      let inventoryLog = null;
      let product = null;
      let productName = payload.productName || null;
      const baseMetadata =
        payload.metadata && typeof payload.metadata === 'object' && !Array.isArray(payload.metadata)
          ? { ...payload.metadata }
          : {};

      if (payload.type === SupplierLogType.DELIVERY) {
        const productRecord = await tx.product.findUnique({
          where: { id: payload.productId },
          include: { category: true },
        });
        if (!productRecord) {
          const notFound = new Error('Product not found');
          notFound.code = 'PRODUCT_NOT_FOUND';
          throw notFound;
        }

        const previousQuantity = productRecord.quantity;
        const updatedProduct = await tx.product.update({
          where: { id: productRecord.id },
          data: { quantity: previousQuantity + payload.quantity },
          include: { category: true },
        });

        product = updatedProduct;
        productName = updatedProduct.name;

        inventoryLog = await recordInventoryLog(tx, {
          productId: updatedProduct.id,
          productName: updatedProduct.name,
          action: 'SUPPLIER_DELIVERY',
          detail: `Received ${payload.quantity} units from ${supplier.name}`,
          stock: updatedProduct.quantity,
          oldPrice: productRecord.price,
          newPrice: updatedProduct.price,
          category: updatedProduct.category?.name || null,
          userId,
        });

        baseMetadata.previousStock = previousQuantity;
        baseMetadata.newStock = updatedProduct.quantity;
        baseMetadata.receivedQuantity = payload.quantity;
        if (payload.unitCost !== null && payload.unitCost !== undefined) {
          baseMetadata.unitCost = payload.unitCost;
        }
      }

      const log = await tx.supplierLog.create({
        data: {
          supplierId,
          type: payload.type,
          productId: product?.id || payload.productId || null,
          productName: productName || product?.name || null,
          quantity: payload.quantity ?? null,
          unitCost: payload.unitCost ?? null,
          status: supplier.status,
          notes: payload.notes || null,
          metadata: Object.keys(baseMetadata).length ? baseMetadata : null,
          inventoryLogId: inventoryLog?.id || null,
          recordedById: userId,
        },
        include: LOG_INCLUDE,
      });

      return log;
    });

    res.status(201).json({ log: shapeSupplierLog(result) });
  } catch (error) {
    console.error('POST /suppliers/:id/logs failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid input' });
    }
    if (error.code === 'NOT_FOUND' || error.code === 'PRODUCT_NOT_FOUND') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: 'Failed to record supplier log' });
  }
});

module.exports = router;

