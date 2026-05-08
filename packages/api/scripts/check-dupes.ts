import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const events = await p.event.findMany({ orderBy: { date: 'desc' } });
  for (const e of events) {
    const ticketCount = await p.ticket.count({ where: { eventId: e.id } });
    console.log(e.id.slice(0,8), '|', (e.symplaEventId || '---').slice(0,12), '|', e.title.slice(0,40), '|', e.date.toISOString().slice(0,10), '| tickets:', ticketCount);
  }
  await p.$disconnect();
}
main();
