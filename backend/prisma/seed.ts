import { PrismaClient } from '../generated/prisma';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { envs } from '../src/config/envs';

const adapter = new PrismaPg({
  connectionString: envs.DATABASE_URL as string,
});

const prisma = new PrismaClient({ adapter });

// ─── HELPERS ────────────────────────────────────────────────────────
// Fecha en UTC, N días atrás, a una hora exacta. Usar UTC evita que
// DATE(created_at) agrupe mal por zona horaria en las métricas del admin.
function atUtc(daysAgo: number, hour: number, minute = 0): Date {
  const now = new Date();
  return new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() - daysAgo,
      hour,
      minute,
      0,
      0,
    ),
  );
}

type SenderKey = 'azac' | 'maria' | 'carlos' | 'pedro' | 'ana';

interface SeedMessage {
  sender: SenderKey;
  content: string;
  daysAgo: number;
  hour: number;
  minute?: number;
  isSystem?: boolean;
  isEdited?: boolean;
  editedAt?: Date;
}

function toMessageRows(
  messages: SeedMessage[],
  users: Record<SenderKey, { id: string }>,
  opts: { conversationId?: string; channelId?: string } = {},
) {
  return messages.map((message) => ({
    content: message.content,
    conversationId: opts.conversationId ?? null,
    channelId: opts.channelId ?? null,
    senderId: users[message.sender].id,
    isSystem: message.isSystem ?? false,
    isEdited: message.isEdited ?? false,
    editedAt: message.editedAt ?? null,
    createdAt: atUtc(message.daysAgo, message.hour, message.minute ?? 0),
  }));
}

// ─── DATOS DE USUARIOS ──────────────────────────────────────────────
const usersToCreate: Array<{
  key: SenderKey | 'others';
  username: string;
  email: string;
  role?: 'ADMIN';
}> = [
  { key: 'azac', username: 'arturo_admin', email: 'arturo@azacode.dev', role: 'ADMIN' },
  { key: 'maria', username: 'maria_lopez', email: 'maria.lopez@gmail.com' },
  { key: 'carlos', username: 'carlos_ruiz', email: 'carlos.ruiz@gmail.com' },
  { key: 'pedro', username: 'pedro_garcia', email: 'pedro.garcia@gmail.com' },
  { key: 'ana', username: 'ana_torres', email: 'ana.torres@gmail.com' },
  { key: 'others', username: 'luis_mendoza', email: 'luis.mendoza@gmail.com' },
  { key: 'others', username: 'sofia_castro', email: 'sofia.castro@gmail.com' },
  { key: 'others', username: 'diego_vargas', email: 'diego.vargas@gmail.com' },
  { key: 'others', username: 'valentina_rios', email: 'valentina.rios@gmail.com' },
  { key: 'others', username: 'jorge_silva', email: 'jorge.silva@gmail.com' },
];

// ─── DIÁLOGOS ───────────────────────────────────────────────────────
// DM: AZAC (arturo_admin) ↔ Maria
const dmAzacMaria: SeedMessage[] = [
  { sender: 'maria', content: '¡Hola Arturo! ¿Viste el avance del diseño del chat?', daysAgo: 9, hour: 10 },
  { sender: 'azac', content: '¡Hola Maria! Sí, lo vi. Me gusta mucho la paleta, quedó prolija 👌', daysAgo: 9, hour: 11 },
  { sender: 'maria', content: '¡Genial! ¿Le cambiamos algo o lo dejamos así?', daysAgo: 9, hour: 12 },
  { sender: 'azac', content: 'Yo lo dejaría así por ahora, ya habrá tiempo de pulir detalles.', daysAgo: 9, hour: 13 },
  { sender: 'maria', content: 'Arturo, ¿te sumás a la demo de las 15?', daysAgo: 8, hour: 10 },
  { sender: 'azac', content: 'Dale, ahí estoy. Preparo el entorno y te confirmo.', daysAgo: 8, hour: 11 },
  { sender: 'maria', content: 'Perfecto, te espero 🙌', daysAgo: 8, hour: 12 },
  { sender: 'azac', content: 'La demo salió bárbara, felicitaciones por la presentación 👏', daysAgo: 7, hour: 16 },
  { sender: 'maria', content: '¡Gracias! Fue en equipo, sin vos no salía', daysAgo: 7, hour: 17 },
  { sender: 'maria', content: '¿Viste el bug de las notificaciones en el panel?', daysAgo: 6, hour: 9 },
  { sender: 'azac', content: 'Sí, lo estoy viendo. Creo que es un tema del cache de TanStack Query.', daysAgo: 6, hour: 10 },
  { sender: 'maria', content: 'Ah, tiene sentido. ¿Lo podés fixear hoy?', daysAgo: 6, hour: 11 },
  { sender: 'azac', content: 'Sí, en un rato te aviso cuando esté subido.', daysAgo: 6, hour: 12 },
  { sender: 'azac', content: 'Listo, bug resuelto ✅ Ya está en producción', daysAgo: 5, hour: 15 },
  { sender: 'maria', content: '¡Espectacular! Sos un crack Arturo 🚀', daysAgo: 5, hour: 16 },
  { sender: 'maria', content: '¿Almorzamos juntos el viernes? 🍕', daysAgo: 4, hour: 10 },
  { sender: 'azac', content: '¡Dale! A las 13 en la oficina nueva', daysAgo: 4, hour: 11 },
  { sender: 'azac', content: 'Maria, ¿tenés un segundo para revisar el flujo de verificación de email?', daysAgo: 3, hour: 9 },
  { sender: 'maria', content: 'Dale, lo miro ahora y te digo', daysAgo: 3, hour: 10 },
  { sender: 'maria', content: 'Está todo bien, solo le pondría un texto más claro al botón.', daysAgo: 3, hour: 12 },
  { sender: 'azac', content: 'Anotado, lo ajusto hoy.', daysAgo: 3, hour: 13 },
  { sender: 'maria', content: '¿Y si hacemos una sesión de repaso del panel admin para la demo del cliente?', daysAgo: 2, hour: 10 },
  { sender: 'azac', content: 'Buenísima idea. ¿Jueves 17hs?', daysAgo: 2, hour: 11 },
  { sender: 'maria', content: 'Jueves 17hs anotado 📅', daysAgo: 2, hour: 12 },
  { sender: 'azac', content: '¿Me pasás el doc de métricas para adelantar la sesión?', daysAgo: 1, hour: 11 },
  { sender: 'maria', content: 'Te lo paso en un rato 👍', daysAgo: 1, hour: 12 },
  { sender: 'maria', content: '¡Buen día Arturo! ¿Viste que ya está el seed con los datos de prueba? 😄', daysAgo: 0, hour: 10 },
];

// DM: AZAC ↔ Carlos
const dmAzacCarlos: SeedMessage[] = [
  { sender: 'carlos', content: 'Bro, ¿compilás el backend con Node 20? 🛠️', daysAgo: 9, hour: 14 },
  { sender: 'azac', content: 'Sí, con pnpm workspaces anda perfecto.', daysAgo: 9, hour: 15 },
  { sender: 'carlos', content: '¿Revisaste el PR de los guards de roles?', daysAgo: 8, hour: 9 },
  { sender: 'azac', content: 'Lo vi anoche, está muy bueno. Solo un detalle en el DTO de actualizar canal.', daysAgo: 8, hour: 10 },
  { sender: 'carlos', content: 'Dale, lo corrijo hoy.', daysAgo: 8, hour: 11 },
  { sender: 'carlos', content: 'Se deployó la última versión ✅', daysAgo: 7, hour: 18 },
  { sender: 'azac', content: 'La probé, anda de diez. Sin dramas en los websockets 👌', daysAgo: 7, hour: 19 },
  { sender: 'carlos', content: '¿Pensás meter testing de integración en el backend?', daysAgo: 6, hour: 14 },
  { sender: 'azac', content: 'Sí, es el próximo paso. Con los casos de uso aislados va a ser fácil.', daysAgo: 6, hour: 15 },
  { sender: 'carlos', content: 'De una, así blindamos los endpoints de auth.', daysAgo: 6, hour: 16 },
  { sender: 'azac', content: 'Carlos, ¿viste el tema de las salas del socket para canales privados?', daysAgo: 5, hour: 9 },
  { sender: 'carlos', content: 'Sí, ya armé la sala por canal y por usuario 🚪', daysAgo: 5, hour: 10 },
  { sender: 'azac', content: 'Excelente. Eso permite notificaciones dirigidas.', daysAgo: 5, hour: 11 },
  { sender: 'carlos', content: '¿Jugamos una partidita esta noche? 🎮', daysAgo: 4, hour: 13 },
  { sender: 'azac', content: 'Jajaja dale, a las 21 como siempre.', daysAgo: 4, hour: 14 },
  { sender: 'azac', content: '¿Cómo venís con la migración de Prisma 7?', daysAgo: 3, hour: 9 },
  { sender: 'carlos', content: 'Lista, con el adapter pg anduvo sin problemas.', daysAgo: 3, hour: 10 },
  { sender: 'carlos', content: 'Ojo que encontré un bug con las fechas en el activity chart 📊', daysAgo: 2, hour: 11 },
  { sender: 'azac', content: 'Ah sí, era el DATE(created_at)::text. Ya está arreglado.', daysAgo: 2, hour: 12 },
  { sender: 'carlos', content: 'Sos máquina Arturo 💪', daysAgo: 1, hour: 10 },
  { sender: 'azac', content: '¡Gracias! Mañana mostramos el panel al cliente, cruzamos los dedos 🤞', daysAgo: 1, hour: 16 },
  { sender: 'carlos', content: '¡Éxitos con la demo hoy! 🙌', daysAgo: 0, hour: 9 },
];

// DM: Maria ↔ Carlos
const dmMariaCarlos: SeedMessage[] = [
  { sender: 'maria', content: 'Carlos, ¿tenés el archivo con los colores de la marca?', daysAgo: 8, hour: 10 },
  { sender: 'carlos', content: 'Sí, te lo mando por acá en un rato 🎨', daysAgo: 8, hour: 11 },
  { sender: 'carlos', content: '¿Ya viste el nuevo sidebar del chat?', daysAgo: 7, hour: 14 },
  { sender: 'maria', content: 'Sí, quedó hermoso. Se nota el laburo.', daysAgo: 7, hour: 15 },
  { sender: 'maria', content: '¿Le avisamos a Arturo sobre la reunión del lunes? 😅', daysAgo: 6, hour: 9 },
  { sender: 'carlos', content: 'Jaja sí, no se le olvide. Le escribo hoy.', daysAgo: 6, hour: 10 },
  { sender: 'maria', content: '¿Qué te pareció la demo del jueves?', daysAgo: 5, hour: 11 },
  { sender: 'carlos', content: 'Un lujo, la gente quedó muy contenta con el tiempo real.', daysAgo: 5, hour: 12 },
  { sender: 'maria', content: '¿Pedimos el café de la oficina? ☕', daysAgo: 4, hour: 10 },
  { sender: 'carlos', content: 'Dale, yo voy a las 16 a buscarlo.', daysAgo: 4, hour: 11 },
  { sender: 'carlos', content: 'Maria, ¿podés revisar los textos del mail de verificación?', daysAgo: 3, hour: 9 },
  { sender: 'maria', content: 'Dale, te los devuelvo corregidos hoy.', daysAgo: 3, hour: 10 },
  { sender: 'maria', content: '¡Carlos! ¿Ya viste los datos del seed nuevo? Están buenísimos 😄', daysAgo: 1, hour: 15 },
  { sender: 'carlos', content: '¡Sí! Ahora el panel admin se ve lleno de data real.', daysAgo: 1, hour: 16 },
];

// Canal privado "General"
const channelGeneral: SeedMessage[] = [
  { sender: 'azac', content: 'Arturo creó el canal General', daysAgo: 10, hour: 9, isSystem: true },
  { sender: 'azac', content: '¡Bienvenidos al canal General! 👋 Acá centralizamos las novedades del proyecto.', daysAgo: 10, hour: 9 },
  { sender: 'maria', content: '¡Hola! Lista para arrancar la semana 💪', daysAgo: 10, hour: 9 },
  { sender: 'carlos', content: '¡Hola equipo! Yo también por acá', daysAgo: 10, hour: 9 },
  { sender: 'azac', content: 'Les dejo el avance del panel admin, ya está conectado a la API real 📊', daysAgo: 9, hour: 10 },
  { sender: 'maria', content: 'Uff, se ve increíble. Me encanta el chart de actividad.', daysAgo: 9, hour: 10 },
  { sender: 'pedro', content: '¡Buen laburo! ¿Cuándo lo mostramos al cliente?', daysAgo: 9, hour: 11 },
  { sender: 'azac', content: 'El jueves, si todo sigue así de bien.', daysAgo: 9, hour: 11 },
  { sender: 'maria', content: '¿Alguien vio el bug del Switch de privado/público?', daysAgo: 8, hour: 9 },
  { sender: 'azac', content: 'Lo arreglo hoy, era un tema de estado en el modal.', daysAgo: 8, hour: 9 },
  { sender: 'carlos', content: '¿Necesitás ayuda con algo?', daysAgo: 8, hour: 9 },
  { sender: 'azac', content: 'No, tranquilo. Ya lo tengo resuelto.', daysAgo: 8, hour: 9 },
  { sender: 'azac', content: 'Se viene la demo del tiempo real: mensajes, edición y eliminación en vivo ⚡', daysAgo: 7, hour: 15 },
  { sender: 'maria', content: '¡Eso va a volar a la gente!', daysAgo: 7, hour: 15 },
  { sender: 'carlos', content: 'Todo listo del lado del backend, los eventos de socket ya emiten.', daysAgo: 7, hour: 16 },
  { sender: 'ana', content: '¿Los DMs 1 a 1 ya están en producción?', daysAgo: 6, hour: 10 },
  { sender: 'azac', content: 'Sí, DMs + presencia online funcionando 🟢', daysAgo: 6, hour: 10 },
  { sender: 'maria', content: 'Probé el flujo de invitación a canales privados y anda perfecto.', daysAgo: 6, hour: 11 },
  { sender: 'azac', content: 'Recordatorio: mañana sincronizamos el repo con las ramas.', daysAgo: 5, hour: 9 },
  { sender: 'carlos', content: 'Anotado. Ya actualicé mi rama local.', daysAgo: 5, hour: 9 },
  { sender: 'maria', content: 'Yo también, todo en orden.', daysAgo: 5, hour: 9 },
  { sender: 'pedro', content: '¿Hay feature para editar mensajes? Quedó muy pulido 😄', daysAgo: 4, hour: 13 },
  { sender: 'azac', content: 'Sí, con su badge de "editado" y todo.', daysAgo: 4, hour: 13 },
  { sender: 'maria', content: 'Los mensajes de sistema tipo "X se unió" se ven prolijos.', daysAgo: 4, hour: 14 },
  { sender: 'azac', content: 'Chicos, revisen el activity chart de cada usuario, quedó con gráficos 📊', daysAgo: 3, hour: 10, isEdited: true, editedAt: atUtc(3, 11, 15) },
  { sender: 'carlos', content: 'Ya lo vi, el donut de días de semana está muy bueno.', daysAgo: 3, hour: 11 },
  { sender: 'azac', content: 'Mejoré el tooltip para que muestre el día completo.', daysAgo: 3, hour: 12 },
  { sender: 'maria', content: '¿Alguien más se apunta a la sesión de repaso del jueves?', daysAgo: 2, hour: 9 },
  { sender: 'carlos', content: '¡Yo voy!', daysAgo: 2, hour: 9 },
  { sender: 'ana', content: 'Yo también 🙋', daysAgo: 2, hour: 9 },
  { sender: 'azac', content: 'Perfecto, 17hs en la sala 2.', daysAgo: 2, hour: 10 },
  { sender: 'azac', content: 'Subí el seed con datos de prueba, van a ver el panel lleno 🎉', daysAgo: 1, hour: 10 },
  { sender: 'maria', content: '¡Sii! Ahora sí se puede mostrar el proyecto con orgullo 😍', daysAgo: 1, hour: 10 },
  { sender: 'carlos', content: 'Excelente para la demo de mañana.', daysAgo: 1, hour: 10 },
  { sender: 'maria', content: '¡Buen día! Hoy es el gran día 🚀', daysAgo: 0, hour: 9 },
  { sender: 'carlos', content: 'Todo listo, backend y frontend corriendo.', daysAgo: 0, hour: 9 },
  { sender: 'azac', content: '¡Vamos a romperla! Gracias por todo el laburo equipo 💜', daysAgo: 0, hour: 9 },
];

// ─── MAIN ───────────────────────────────────────────────────────────
async function main() {
  console.log('🌱 Seeding...');

  // Limpieza en el orden correcto por las FKs
  await prisma.messageRead.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversationMember.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.channelMember.deleteMany();
  await prisma.channelInvitation.deleteMany();
  await prisma.channel.deleteMany();
  await prisma.emailVerification.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.user.deleteMany();

  // ─── Usuarios ───
  const passwordHash = await bcrypt.hash('Password123!', 10);

  const users = {} as Record<SenderKey, { id: string }>;
  for (const user of usersToCreate) {
    const created = await prisma.user.create({
      data: {
        username: user.username,
        email: user.email,
        passwordHash,
        isEmailVerified: true,
        ...(user.role ? { role: user.role } : {}),
      },
    });
    if (user.key !== 'others') {
      users[user.key] = { id: created.id };
    }
  }
  console.log('✅ 10 usuarios creados (AZAC admin protagonista)');

  // ─── Conversaciones DM ───
  const convAzacMaria = await prisma.conversation.create({ data: {} });
  const convAzacCarlos = await prisma.conversation.create({ data: {} });
  const convMariaCarlos = await prisma.conversation.create({ data: {} });

  // Miembros: AZAC deja lastReadAt hace 2 días → le quedan no-leídos recientes
  await prisma.conversationMember.createMany({
    data: [
      { conversationId: convAzacMaria.id, userId: users.azac.id, lastReadAt: atUtc(2, 9) },
      { conversationId: convAzacMaria.id, userId: users.maria.id, lastReadAt: new Date() },
      { conversationId: convAzacCarlos.id, userId: users.azac.id, lastReadAt: atUtc(2, 9) },
      { conversationId: convAzacCarlos.id, userId: users.carlos.id, lastReadAt: new Date() },
      { conversationId: convMariaCarlos.id, userId: users.maria.id, lastReadAt: new Date() },
      { conversationId: convMariaCarlos.id, userId: users.carlos.id, lastReadAt: new Date() },
    ],
  });

  await prisma.message.createMany({
    data: toMessageRows(dmAzacMaria, users, { conversationId: convAzacMaria.id }),
  });
  await prisma.message.createMany({
    data: toMessageRows(dmAzacCarlos, users, { conversationId: convAzacCarlos.id }),
  });
  await prisma.message.createMany({
    data: toMessageRows(dmMariaCarlos, users, { conversationId: convMariaCarlos.id }),
  });
  console.log('✅ 3 conversaciones DM creadas (AZAC↔Maria, AZAC↔Carlos, Maria↔Carlos)');

  // ─── Canal privado "General" ───
  const generalChannel = await prisma.channel.create({
    data: {
      name: 'General',
      description: 'Canal general del equipo AZAC — privado',
      isPrivate: true,
      createdById: users.azac.id,
    },
  });

  await prisma.channelMember.createMany({
    data: [
      { channelId: generalChannel.id, userId: users.azac.id, role: 'ADMIN', joinedAt: atUtc(10, 9) },
      { channelId: generalChannel.id, userId: users.maria.id, role: 'USER', joinedAt: atUtc(10, 9, 30) },
      { channelId: generalChannel.id, userId: users.carlos.id, role: 'USER', joinedAt: atUtc(10, 9, 45) },
      { channelId: generalChannel.id, userId: users.pedro.id, role: 'USER', joinedAt: atUtc(9, 10) },
      { channelId: generalChannel.id, userId: users.ana.id, role: 'USER', joinedAt: atUtc(7, 10) },
    ],
  });

  await prisma.message.createMany({
    data: toMessageRows(channelGeneral, users, { channelId: generalChannel.id }),
  });

  // Invitación pendiente al canal privado (generada por AZAC)
  await prisma.channelInvitation.create({
    data: {
      token: randomUUID(),
      channelId: generalChannel.id,
      createdById: users.azac.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  console.log('✅ Canal privado "General" creado (AZAC, Maria, Carlos, Pedro, Ana)');

  // ─── Resumen ───
  const [userCount, messageCount, conversationCount, channelCount] = await Promise.all([
    prisma.user.count(),
    prisma.message.count(),
    prisma.conversation.count(),
    prisma.channel.count(),
  ]);

  console.log(`\n📊 Resumen final:`);
  console.log(`   Usuarios: ${userCount}`);
  console.log(`   Conversaciones: ${conversationCount}`);
  console.log(`   Canales: ${channelCount}`);
  console.log(`   Mensajes: ${messageCount}`);
  console.log('\n🎬 Login demo: arturo@azacode.dev / Password123! (ADMIN)');
}

main()
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
