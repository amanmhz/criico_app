/**
 * Single User Database Seeding Script
 *
 * Seeds or updates a single user using sequential positional CLI arguments:
 *   1st argument: Name
 *   2nd argument: Email
 *   3rd argument: Password
 *   4th argument: Role ("ADMIN" | "VIEWER", optional, defaults to "VIEWER")
 *
 * CLI Usage:
 *   node --experimental-strip-types prisma/seed.ts <name> <email> <password> [role]
 *
 * Examples:
 *   # Seed an Admin:
 *   node --experimental-strip-types prisma/seed.ts "System Administrator" "admin@cricket.com" "admin123" "ADMIN"
 *
 *   # Seed a Viewer:
 *   node --experimental-strip-types prisma/seed.ts "Standard Viewer" "viewer@cricket.com" "viewer123" "VIEWER"
 *
 *   # Seed with default role (VIEWER):
 *   node --experimental-strip-types prisma/seed.ts "John Doe" "john@example.com" "password123"
 */

import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Positional arguments: [0]=name, [1]=email, [2]=password, [3]=role
  const [name, email, password, roleArg] = process.argv.slice(2);

  if (!name || !email || !password) {
    console.error('Error: Missing required arguments.\n');
    console.error('Usage: node --experimental-strip-types prisma/seed.ts <name> <email> <password> [role]\n');
    console.error('Example: node --experimental-strip-types prisma/seed.ts "System Administrator" "admin@cricket.com" "admin123" "ADMIN"');
    process.exit(1);
  }

  // Validate or default role to VIEWER
  const role: UserRole = roleArg?.toUpperCase() === 'ADMIN' ? UserRole.ADMIN : UserRole.VIEWER;

  console.log(`Seeding user: ${email} (${name}) with role [${role}]...`);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: {
      name,
      password: passwordHash,
      role,
    },
    create: {
      name,
      email: email.toLowerCase(),
      password: passwordHash,
      role,
    },
  });

  console.log(`✓ User saved: ${user.email} (ID: ${user.id}, Role: ${user.role})`);
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
