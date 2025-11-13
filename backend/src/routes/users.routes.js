const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient, Role } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const router = express.Router();

const ALLOWED_ADMIN_ROLES = new Set([Role.SUPER_ADMIN, Role.ADMIN]);

function assertAdmin(req, res, next) {
  try {
    if (!req.user || !ALLOWED_ADMIN_ROLES.has(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    return next();
  } catch (err) {
    return res.status(500).json({ error: 'Authorization failed' });
  }
}

const ListQuerySchema = z.object({
  role: z
    .string()
    .optional()
    .transform((val) => (val ? val.toUpperCase() : undefined))
    .refine((val) => !val || Object.values(Role).includes(val), {
      message: 'Invalid role',
    }),
});

const CreateUserSchema = z.object({
  schoolId: z.string().trim().min(1, 'School ID is required'),
  username: z.string().trim().min(1, 'Username is required'),
  fullName: z.string().trim().min(1, 'Full name is required'),
  role: z.nativeEnum(Role).optional().default(Role.CASHIER),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  program: z.string().trim().optional().nullable(),
  section: z.string().trim().optional().nullable(),
  sex: z.string().trim().optional().nullable(),
});

const UpdateUserSchema = z.object({
  schoolId: z.string().trim().optional(),
  username: z.string().trim().optional(),
  fullName: z.string().trim().optional(),
  role: z.nativeEnum(Role).optional(),
  program: z.string().trim().optional().nullable(),
  section: z.string().trim().optional().nullable(),
  sex: z.string().trim().optional().nullable(),
  resetPassword: z.string().min(6, 'Password must be at least 6 characters').optional(),
  avatarUrl: z.string().trim().optional().nullable(),
});

const ChangePasswordSchema = z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  });

router.get('/', assertAdmin, async (req, res) => {
  try {
    const query = ListQuerySchema.parse(req.query || {});

    const users = await prisma.user.findMany({
      where: query.role ? { role: query.role } : undefined,
      orderBy: { fullName: 'asc' },
    });

    res.json({ users: users.map(({ passwordHash, password, ...rest }) => rest) });
  } catch (error) {
    console.error('GET /users failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid query' });
    }
    res.status(500).json({ error: 'Failed to list users' });
  }
});

router.post('/', assertAdmin, async (req, res) => {
  try {
    const input = CreateUserSchema.parse(req.body || {});

    const schoolId = input.schoolId.toLowerCase();
    const username = input.username.toLowerCase();

    const duplicate = await prisma.user.findFirst({
      where: {
        OR: [
          { schoolId },
          { username },
        ],
      },
    });

    if (duplicate) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await prisma.user.create({
      data: {
        schoolId,
        username,
        fullName: input.fullName.trim(),
        role: input.role,
        passwordHash,
        program: input.program || null,
        section: input.section || null,
        sex: input.sex || null,
      },
    });

    const { passwordHash: _, password, ...clean } = created;
    res.status(201).json({ user: clean });
  } catch (error) {
    console.error('POST /users failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Failed to create user' });
  }
});

router.put('/:id/password', async (req, res) => {
    try {
      const userId = Number(req.params.id);
      if (!Number.isInteger(userId)) {
        return res.status(400).json({ error: 'Invalid user id' });
      }
  
  const requesterRole = req.user?.role;
  const requesterId = Number(req.user?.sub);

  // Allow admins or the user themselves to change the password
  if (!ALLOWED_ADMIN_ROLES.has(requesterRole) && requesterId !== userId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
  
      const { oldPassword, newPassword } = ChangePasswordSchema.parse(req.body || {});
  
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({ error: 'Invalid old password' });
      }
  
      const passwordHash = await bcrypt.hash(newPassword, 10);
  
      await prisma.user.update({
        where: { id: userId },
        data: {
          passwordHash,
          passwordChangedAt: new Date(),
        },
      });
  
      res.json({ ok: true });
    } catch (error) {
      console.error('PUT /users/:id/password failed:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.issues[0]?.message || 'Invalid payload' });
      }
      res.status(500).json({ error: 'Failed to change password' });
    }
  });

router.put('/:id', assertAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const input = UpdateUserSchema.parse(req.body || {});
    const data = {};

    if (input.schoolId) data.schoolId = input.schoolId.toLowerCase();
    if (input.username) data.username = input.username.toLowerCase();
    if (input.fullName) data.fullName = input.fullName.trim();
    if (input.role) data.role = input.role;
    if ('program' in input) data.program = input.program || null;
    if ('section' in input) data.section = input.section || null;
    if ('sex' in input) data.sex = input.sex || null;
    if ('avatarUrl' in input) data.avatarUrl = input.avatarUrl || null;

    if (input.resetPassword) {
      data.passwordHash = await bcrypt.hash(input.resetPassword, 10);
      data.passwordChangedAt = new Date();
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
    });

    const { passwordHash, password, ...clean } = updated;
    res.json({ user: clean });
  } catch (error) {
    console.error('PUT /users/:id failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Duplicate schoolId/username' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update user' });
  }
});

router.delete('/:id', assertAdmin, async (req, res) => {
  try {
    const userId = Number(req.params.id);
    if (!Number.isInteger(userId)) {
      return res.status(400).json({ error: 'Invalid user id' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.role === Role.SUPER_ADMIN) {
      return res.status(400).json({ error: 'Cannot delete superadmin account' });
    }

    await prisma.user.delete({ where: { id: userId } });
    res.json({ ok: true });
  } catch (error) {
    console.error('DELETE /users/:id failed:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
