import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function main() {
  const toDelete = ['cmore8nx', 'cmore8mh', 'cmore8lu', 'cmore8ky'];
  
  for (const id of toDelete) {
    const exists = await p.event.findUnique({ where: { id } });
    if (!exists) {
      console.log(`Event ${id} already deleted, skipping`);
      continue;
    }
    await p.ticket.deleteMany({ where: { eventId: id } });
    await p.importBatch.deleteMany({ where: { eventId: id } }).catch(() => {});
    await p.barSale.deleteMany({ where: { eventId: id } }).catch(() => {});
    await p.product.deleteMany({ where: { eventId: id } }).catch(() => {});
    await p.event.delete({ where: { id } });
    console.log(`Deleted ${id}`);
  }
  
  const events = await p.event.findMany({ orderBy: { date: 'desc' } });
  console.log(`\nFinal events: ${events.length}`);
  for (const e of events) {
    const tc = await p.ticket.count({ where: { eventId: e.id } });
    console.log(`  ${e.id.slice(0,8)} | symplaId="${e.symplaEventId || '-'}" | tickets=${tc} | "${e.title.slice(0,35)}"`);
  }
  
  await p.$disconnect();
}

main();
