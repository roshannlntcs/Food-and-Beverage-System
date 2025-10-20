const router = require("express").Router();
const { PrismaClient, Role, VoidType } = require("@prisma/client");
const { z } = require("zod");
const crypto = require("crypto");

const prisma = new PrismaClient();

const sanitizeUser = (user) =>
  user
    ? {
        id: user.id,
        fullName: user.fullName,
        schoolId: user.schoolId,
        role: user.role,
      }
    : null;

const VOID_INCLUDE = {
  cashier: true,
  manager: true,
  order: {
    include: {
      cashier: true,
    },
  },
};

const shapeVoidLog = (log) => ({
  id: log.id,
  voidId: log.voidId,
  transactionId: log.transactionId,
  orderId: log.orderId,
  voidType: log.voidType,
  items: log.items,
  amount: log.amount,
  cashier: sanitizeUser(log.cashier),
  manager: sanitizeUser(log.manager),
  reason: log.reason,
  notes: log.notes,
  requestedAt: log.requestedAt,
  approvedAt: log.approvedAt,
  order: log.order
    ? {
        id: log.order.id,
        orderCode: log.order.orderCode,
        total: log.order.total,
        cashier: sanitizeUser(log.order.cashier),
      }
    : null,
});

const QuerySchema = z.object({
  type: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined))
    .refine(
      (val) => !val || Object.values(VoidType).includes(val),
      { message: "Invalid void type" }
    ),
  cashierId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => !val || Number.isInteger(val), {
      message: "Invalid cashier id",
    }),
  managerId: z
    .string()
    .optional()
    .transform((val) => (val ? Number(val) : undefined))
    .refine((val) => !val || Number.isInteger(val), {
      message: "Invalid manager id",
    }),
  from: z.string().optional(),
  to: z.string().optional(),
  search: z.string().optional(),
  take: z.coerce.number().int().positive().max(100).optional(),
  cursor: z.coerce.number().int().positive().optional(),
});

const CreateVoidSchema = z.object({
  transactionId: z.string(),
  orderId: z.coerce.number().int().positive().optional(),
  voidType: z.nativeEnum(VoidType),
  items: z.any().optional(),
  amount: z.coerce.number().min(0).default(0),
  cashierId: z.coerce.number().int().positive().optional(),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const requireManager = (req, res, next) => {
  try {
    if (!req.user || ![Role.ADMIN, Role.SUPER_ADMIN].includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden" });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ error: "Authorization failed" });
  }
};

const randomToken = () =>
  crypto.randomBytes(4).toString("hex").toUpperCase();

const generateVoidId = () => `VOID-${randomToken()}`;

router.get("/", async (req, res) => {
  try {
    const query = QuerySchema.parse(req.query || {});
    const where = {};

    if (query.type) where.voidType = query.type;
    if (query.cashierId) where.cashierId = query.cashierId;
    if (query.managerId) where.managerId = query.managerId;
    if (query.search) {
      where.transactionId = {
        contains: query.search,
        mode: "insensitive",
      };
    }
    if (query.from || query.to) {
      where.requestedAt = {};
      if (query.from) where.requestedAt.gte = new Date(query.from);
      if (query.to) where.requestedAt.lte = new Date(query.to);
    }

    const take = query.take || 50;

    const findOptions = {
      where,
      orderBy: { requestedAt: "desc" },
      take,
      include: VOID_INCLUDE,
    };

    if (query.cursor) {
      findOptions.cursor = { id: query.cursor };
      findOptions.skip = 1;
    }

    const logs = await prisma.voidLog.findMany(findOptions);
    const nextCursor = logs.length === take ? logs[logs.length - 1].id : null;

    res.json({ data: logs.map(shapeVoidLog), nextCursor });
  } catch (error) {
    console.error("GET /voids failed:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || "Invalid query" });
    }
    res.status(500).json({ error: "Failed to fetch void logs" });
  }
});

router.post("/", requireManager, async (req, res) => {
  try {
    const input = CreateVoidSchema.parse(req.body || {});

    const voidId = generateVoidId();

    const log = await prisma.voidLog.create({
      data: {
        voidId,
        transactionId: input.transactionId,
        orderId: input.orderId || null,
        voidType: input.voidType,
        items: input.items || null,
        amount: input.amount,
        cashierId: input.cashierId || null,
        managerId: Number(req.user.sub),
        reason: input.reason || null,
        notes: input.notes || null,
        approvedAt: new Date(),
      },
      include: VOID_INCLUDE,
    });

    res.status(201).json({ voidLog: shapeVoidLog(log) });
  } catch (error) {
    console.error("POST /voids failed:", error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || "Invalid payload" });
    }
    res.status(500).json({ error: "Failed to create void log" });
  }
});

module.exports = router;


