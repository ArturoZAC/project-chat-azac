import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { envs } from '../src/config/envs';

const adapter = new PrismaPg({
  connectionString: envs.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

const users = [
  {
    username: 'arturo_admin',
    email: 'arturo@azacode.dev',
    role: 'ADMIN' as const,
    isOnline: true,
  },
  {
    username: 'pedro_garcia',
    email: 'pedro.garcia@gmail.com',
    isOnline: false,
  },
  { username: 'maria_lopez', email: 'maria.lopez@gmail.com', isOnline: true },
  { username: 'carlos_ruiz', email: 'carlos.ruiz@gmail.com', isOnline: false },
  { username: 'ana_torres', email: 'ana.torres@gmail.com', isOnline: true },
  {
    username: 'luis_mendoza',
    email: 'luis.mendoza@gmail.com',
    isOnline: false,
  },
  {
    username: 'sofia_castro',
    email: 'sofia.castro@gmail.com',
    isOnline: false,
  },
  { username: 'diego_vargas', email: 'diego.vargas@gmail.com', isOnline: true },
  {
    username: 'valentina_rios',
    email: 'valentina.rios@gmail.com',
    isOnline: false,
  },
  { username: 'jorge_silva', email: 'jorge.silva@gmail.com', isOnline: false },
];

async function main() {
  console.log('🌱 Seeding...');

  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  await Promise.all(
    users.map(async (user) => {
      const passwordHash = await bcrypt.hash('Password123!', 10);
      return prisma.user.create({
        data: {
          ...user,
          passwordHash,
          isEmailVerified: true,
        },
      });
    }),
  );

  console.log('✅ 10 usuarios creados');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
