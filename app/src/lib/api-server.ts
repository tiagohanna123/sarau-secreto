// api-server.ts — server-side data layer
// Tenta buscar dados do backend Fastify. Fallback para JSONs locais.

const API_BASE = typeof process !== 'undefined' && process.env.PUBLIC_API_URL
  ? process.env.PUBLIC_API_URL
  : 'http://localhost:3001';

async function fetchJson<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

// Fallback: import JSONs locais (bundlados no build)
import eventosJson from '$lib/data/eventos.json';
import barJson from '$lib/data/bar-embed.json';
import checkinJson from '$lib/data/checkin.json';

export async function getAllEvents() {
  // Tenta backend primeiro
  const events = await fetchJson<any[]>('/api/events');
  if (events) return events;
  // Fallback: JSON local
  return eventosJson.eventos;
}

export async function getBarData() {
  const bar = await fetchJson<Record<string, any>>('/api/bar');
  if (bar) return bar;
  return barJson;
}

export async function getCheckinData() {
  const checkin = await fetchJson<any[]>('/api/checkin');
  if (checkin) return checkin;
  return checkinJson;
}

export async function getEventBySlug(slug: string) {
  const events = await getAllEvents();
  return events.find((e: any) => e.slug === slug) || null;
}

export async function getEventAnalytics() {
  const analytics = await fetchJson<any>('/api/events/analytics');
  if (analytics) return analytics;
  // Fallback: calcular dos JSONs locais
  const events = await getAllEvents();
  const bar = await getBarData();
  const totalTicketRevenue = events.reduce((s: number, e: any) => s + (e.totalRevenue || e.ticketPrice * (e.soldCount || 0)), 0);
  const totalBarRevenue = Object.values(bar.eventBarRevenue || {}).reduce((s: number, v: any) => s + (typeof v === 'number' ? v : 0), 0);
  const totalTickets = events.reduce((s: number, e: any) => s + (e.soldCount || 0), 0);
  return {
    totalRevenue: totalTicketRevenue,
    totalBarRevenue,
    totalEvents: events.length,
    totalTickets,
    barPorPessoa: totalTickets > 0 ? Math.round((totalBarRevenue / totalTickets) * 100) / 100 : 0,
  };
}
