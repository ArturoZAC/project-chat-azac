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

  const createdUsers = await Promise.all(
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

  // Create DM conversations between first user and some others
  const dmPairs = [
    [createdUsers[0].id, createdUsers[1].id], // arturo <-> pedro
    [createdUsers[0].id, createdUsers[2].id], // arturo <-> maria
    [createdUsers[0].id, createdUsers[3].id], // arturo <-> carlos
    [createdUsers[1].id, createdUsers[2].id], // pedro <-> maria
  ];

  const dmMessages = [
    { conversationIdx: 0, senderIdx: 1, content: '¡Hola Arturo! ¿Cómo estás?' },
    { conversationIdx: 0, senderIdx: 0, content: 'Muy bien Pedro, ¿y tú?' },
    { conversationIdx: 0, senderIdx: 1, content: 'Genial, quería consultarte sobre el proyecto' },
    { conversationIdx: 0, senderIdx: 0, content: 'Claro, dime en qué puedo ayudarte' },
    { conversationIdx: 1, senderIdx: 2, content: 'Hola Arturo, ¿tienes un momento?' },
    { conversationIdx: 1, senderIdx: 0, content: 'Hola Maria, sí claro' },
    { conversationIdx: 1, senderIdx: 2, content: 'Te envié los documentos por correo' },
    { conversationIdx: 2, senderIdx: 0, content: 'Carlos, ¿revisaste el diseño?' },
    { conversationIdx: 2, senderIdx: 3, content: 'Sí, ya lo revisé, me gusta mucho' },
    { conversationIdx: 3, senderIdx: 1, content: 'Maria, ¿viste el último cambio?' },
    { conversationIdx: 3, senderIdx: 2, content: 'Sí, quedó muy bien' },
  ];

  const conversations = await Promise.all(
    dmPairs.map(([user1Id, user2Id]) =>
      prisma.conversation.create({
        data: {
          members: {
            create: [{ userId: user1Id }, { userId: user2Id }],
          },
        },
      }),
    ),
  );

  console.log(`✅ ${conversations.length} conversaciones creadas`);

  const messages = await Promise.all(
    dmMessages.map((msg) =>
      prisma.message.create({
        data: {
          content: msg.content,
          conversationId: conversations[msg.conversationIdx].id,
          senderId: createdUsers[msg.senderIdx].id,
        },
      }),
    ),
  );

  console.log(`✅ ${messages.length} mensajes DM creados`);
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
