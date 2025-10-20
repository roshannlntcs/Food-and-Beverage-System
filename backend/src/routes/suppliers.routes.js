const router = require('express').Router();
const { PrismaClient, SupplierStatus } = require('@prisma/client');
const { z } = require('zod');

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
    const supplier = await prisma.supplier.create({ data });
    res.json({ supplier });
  } catch (error) {
    console.error('POST /suppliers failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid input' });
    }
    res.status(500).json({ error: 'Failed to create supplier' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid id' });
    const data = UpdateSchema.parse(req.body || {});
    const supplier = await prisma.supplier.update({ where: { id }, data });
    res.json({ supplier });
  } catch (error) {
    console.error('PUT /suppliers/:id failed:', error);
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
    res.status(500).json({ error: 'Failed to delete supplier' });
  }
});

module.exports = router;