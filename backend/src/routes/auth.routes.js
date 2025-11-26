const express = require('express');
const bcrypt = require('bcryptjs');
const { PrismaClient, Role } = require('@prisma/client');
const { z } = require('zod');
const { signJwt } = require('../auth');
const { authRequired } = require('../middleware');

const prisma = new PrismaClient();
const router = express.Router();

const cookieSecureEnv = process.env.COOKIE_SECURE;
const cookieSecure =
  typeof cookieSecureEnv === 'string'
    ? cookieSecureEnv.toLowerCase() !== 'false'
    : process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: 'lax',
  secure: cookieSecure,
  maxAge: 1000 * 60 * 60 * 12, // 12 hours
};

const LoginSchema = z
  .object({
    username: z.string().trim().optional(),
    schoolId: z.string().trim().optional(),
    password: z.string().min(1, 'Password is required'),
  })
  .refine((data) => data.username || data.schoolId, {
    message: 'School ID or Username is required',
    path: ['username'],
  });

const RegisterSchema = z.object({
  schoolId: z.string().trim().min(1, 'School ID is required'),
  fullName: z.string().trim().min(1, 'Full name is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  username: z.string().trim().optional(),
  program: z.string().trim().optional().nullable(),
  section: z.string().trim().optional().nullable(),
  sex: z.string().trim().optional().nullable(),
});

const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

const UpdateProfileSchema = z.object({
  fullName: z.string().trim().min(1, 'Full name must not be empty').optional(),
  avatarUrl: z.string().trim().optional().nullable(),
});

const sanitizeUser = (user) => {
  if (!user) return null;
  const { passwordHash, password, ...rest } = user;
  return rest;
};

router.post('/login', async (req, res) => {
  try {
    const input = LoginSchema.parse(req.body || {});
    const credential = input.username?.toLowerCase() || input.schoolId?.toLowerCase();

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: credential },
          { schoolId: credential },
        ],
      },
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordOk = await bcrypt.compare(input.password, user.passwordHash || '');
    if (!passwordOk) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const refreshed = await tx.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
      await tx.stockAlertState.updateMany({
        where: { userId: refreshed.id },
        data: { signature: '' },
      });
      return refreshed;
    });

    const token = signJwt({
      sub: updated.id,
      role: updated.role,
      schoolId: updated.schoolId,
      username: updated.username,
    });

    res
      .cookie('auth_token', token, COOKIE_OPTIONS)
      .json({ token, user: sanitizeUser(updated) });
  } catch (error) {
    console.error('POST /auth/login failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    res.status(500).json({ error: 'Login failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const input = RegisterSchema.parse(req.body || {});
    const username = (input.username || input.schoolId).toLowerCase();
    const schoolId = input.schoolId.toLowerCase();

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { schoolId },
        ],
      },
    });

    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const created = await prisma.user.create({
      data: {
        schoolId,
        username,
        fullName: input.fullName.trim(),
        role: Role.CASHIER,
        passwordHash,
        program: input.program || null,
        section: input.section || null,
        sex: input.sex || null,
      },
    });

    const token = signJwt({
      sub: created.id,
      role: created.role,
      schoolId: created.schoolId,
      username: created.username,
    });

    res
      .cookie('auth_token', token, COOKIE_OPTIONS)
      .status(201)
      .json({ token, user: sanitizeUser(created) });
  } catch (error) {
    console.error('POST /auth/register failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'User already exists' });
    }
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('GET /auth/me failed:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

router.put('/me', authRequired, async (req, res) => {
  try {
    const input = UpdateProfileSchema.parse(req.body || {});
    if (!Object.keys(input).length) {
      return res.status(400).json({ error: 'No changes provided' });
    }

    const data = {};
    if (input.fullName !== undefined) data.fullName = input.fullName.trim();
    if ('avatarUrl' in input) data.avatarUrl = input.avatarUrl || null;

    const updated = await prisma.user.update({
      where: { id: req.user.sub },
      data,
    });

    res.json({ user: sanitizeUser(updated) });
  } catch (error) {
    console.error('PUT /auth/me failed:', error);
    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

router.post('/change-password', authRequired, async (req, res) => {
  try {
    const input = ChangePasswordSchema.parse(req.body || {});
    const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const currentOk = await bcrypt.compare(input.currentPassword, user.passwordHash || '');
    if (!currentOk) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(input.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordChangedAt: new Date(),
      },
    });

    res.json({ ok: true });
  } catch (error) {
    console.error('POST /auth/change-password failed:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Invalid payload' });
    }
    res.status(500).json({ error: 'Failed to change password' });
  }
});

router.post('/logout', (_req, res) => {
  res
    .clearCookie('auth_token', { ...COOKIE_OPTIONS, maxAge: undefined })
    .json({ ok: true });
});

module.exports = router;
