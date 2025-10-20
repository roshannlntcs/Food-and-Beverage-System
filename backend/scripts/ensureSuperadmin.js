// backend/scripts/ensureSuperadmin.js
require('dotenv').config();
const { PrismaClient, Role } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

(async () => {
  const username = process.env.SUPERADMIN_USERNAME || 'superadmin';
  const schoolId = process.env.SUPERADMIN_SCHOOL_ID || 'ADMIN-0000';
  const fullName = process.env.SUPERADMIN_NAME || 'Super Administrator';
  const password = process.env.SUPERADMIN_PASSWORD || 'superadmin';

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.upsert({
      where: { username },
      update: {
        schoolId,
        fullName,
        role: Role.SUPER_ADMIN,
        passwordHash,
      },
      create: {
        schoolId,
        username,
        fullName,
        role: Role.SUPER_ADMIN,
        passwordHash,
        program: null,
        section: null,
        sex: null,
      },
    });

    console.log('Superadmin ensured:', user.username);
    process.exit(0);
  } catch (err) {
    console.error('ensureSuperadmin failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
