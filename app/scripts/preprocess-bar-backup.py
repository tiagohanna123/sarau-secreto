#!/usr/bin/env python3
"""Pre-processa backup Yuzer para gerar src/lib/bar-embed.ts com dados precisos"""
import json, os, sys, re
from collections import defaultdict
from datetime import datetime, timedelta

BACKUP = os.path.expanduser("~/sarau-yuzer-backup")
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # app/
ORDERS_PATH = os.path.join(BACKUP, "orders.json")
RANKING_PATH = os.path.join(BACKUP, "dashboards_ranking.json")
PAYMENTS_PATH = os.path.join(BACKUP, "dashboards_payments_statistics.json")
DB_EMBED_PATH = os.path.join(ROOT, "src", "lib", "db-embed.ts")
OUT_PATH = os.path.join(ROOT, "src", "lib", "bar-embed.ts")

SAFEDIV = lambda a, b: round(a / b, 2) if b else 0

# --- PRESERVAR: ler bar-embed.ts existente antes de sobrescrever ---
old = ""  # conteudo do bar-embed.ts atual (vazio se nao existir)
existing_bar_rev = {}
if os.path.exists(OUT_PATH):
    with open(OUT_PATH) as f:
        old = f.read()
    # Extrai eventBarRevenue do arquivo existente
    m = re.search(r'"eventBarRevenue":\s*\{([^}]+)\}\s*,\s*"mensais"', old, re.DOTALL)
    if m:
        for k, v in re.findall(r'"([^"]+)"\s*:\s*(\{[^}]*\}|null)', m.group(1)):
            # Converte string JSON para dict ou None
            try:
                existing_bar_rev[k] = json.loads(v) if v != 'null' else None
            except:
                pass

# --- 0) Read DB events (EMBEDDED_DB) to build per-event bar revenue ---
db_events = []
if os.path.exists(DB_EMBED_PATH):
    with open(DB_EMBED_PATH) as f:
        c = f.read()
    start = c.index('EMBEDDED_DB: EmbeddedDB = ') + len('EMBEDDED_DB: EmbeddedDB = ')
    stack = 0
    for i in range(start, len(c)):
        if c[i] == '{': stack += 1
        elif c[i] == '}':
            stack -= 1
            if stack == 0:
                end = i + 1
                break
    db_events = json.loads(c[start:end])['events']

# Build date -> db event mapping
def db_date(d):
    """Normalize DB date: '2023-08-10' or 1691708400000 timestamp -> '2023-08-10'"""
    s = str(d)[:10]
    # Unix timestamp in milliseconds
    if s.isdigit() and len(str(d)) >= 12:
        return datetime.fromtimestamp(int(str(d)[:10])).strftime('%Y-%m-%d')
    # Already YYYY-MM-DD
    return s

db_by_date = {}
for ev in db_events:
    d = db_date(ev['date'])
    db_by_date[d] = ev

# --- 1) Ranking: 34 eventos com receita por evento ---
if not os.path.exists(RANKING_PATH):
    print("ERRO: ranking nao encontrado"); sys.exit(1)
with open(RANKING_PATH) as f:
    ranking = json.load(f)

# Build per-event revenue map from ranking
event_revenue = {}
event_dates = {}
rank_by_date = {}
for r in ranking:
    name = r.get('name', '')
    earnings = float(r.get('earnings', 0))
    dm = re.search(r'(\d{2})/(\d{2})/(\d{4})', name)
    start = f"{dm.group(3)}-{dm.group(2)}-{dm.group(1)}" if dm else r.get('dateStart', '')[:10]
    event_revenue[start] = earnings
    event_dates[start] = r.get('dateEnd', start)[:10]
    rank_by_date[start] = r

# --- 1b) Match ranking events to DB events with fuzzy date matching ---
# Build eventBarRevenue: map DB event ID -> bar revenue data
# Also map by date for exact match, then ±1 day fallback

def date_plus(s, days=0):
    return (datetime.strptime(s, '%Y-%m-%d') + timedelta(days=days)).strftime('%Y-%m-%d')

event_bar_map = {}  # key: DB event ID

# Try exact match first, then ±1 day, then ±2 days
matched_count = 0
for ev in db_events:
    d = db_date(ev['date'])
    best_match = None
    best_dist = 999
    
    for rd in rank_by_date:
        dist = abs((datetime.strptime(d, '%Y-%m-%d') - datetime.strptime(rd, '%Y-%m-%d')).days)
        if dist < best_dist:
            best_dist = dist
            best_match = rd
    
    if best_match and best_dist <= 2:
        earnings = float(rank_by_date[best_match].get('earnings', 0))
        event_bar_map[ev['id']] = {
            'revenue': round(earnings, 2),
            'date': best_match,
            'matchDist': best_dist,
        }
        matched_count += 1
    else:
        event_bar_map[ev['id']] = None

print(f"Matched {matched_count}/{len(db_events)} DB events to ranking")

# --- 2) Orders: produtos, categorias, metodos pagamento reais ---
produtos = defaultdict(lambda: {'qty': 0, 'total': 0.0})
categorias = defaultdict(lambda: {'qty': 0, 'total': 0.0})
monthly = defaultdict(float)
total_orders = 0
total_itens = 0

# Also track orders per event by date window
# Window: 19h UTC event day to 05:59h UTC next day
def event_for_order(ts):
    """Find which event date an order belongs to (window: 19h-05:59h UTC)."""
    # ts format: "2026-04-17T00:25:29" or ISO
    try:
        dt = datetime.strptime(ts[:16], '%Y-%m-%dT%H:%M')
        if dt.hour >= 19:
            # After 19h -> belongs to event on this calendar day
            return dt.strftime('%Y-%m-%d')
        elif dt.hour < 6:
            # Before 6h -> belongs to previous day's event
            prev = dt - timedelta(days=1)
            return prev.strftime('%Y-%m-%d')
        else:
            # 6h-18h59 -> belongs to event on this day
            return dt.strftime('%Y-%m-%d')
    except:
        return None

# We'll also compute per-event bar revenue from orders for unmatched events
order_revenue_by_date = defaultdict(float)
order_count_by_date = defaultdict(int)

if os.path.exists(ORDERS_PATH):
    with open(ORDERS_PATH) as f:
        orders = json.load(f)
    total_orders = len(orders)
    
    for o in (orders if isinstance(orders, list) else []):
        ts = o.get('createdAt', '')
        cart = o.get('cart', {})
        total = float(cart.get('grossTotal', 0))
        items = cart.get('products', [])
        total_itens += len(items) if items else 0
        
        if ts and len(ts) >= 7:
            monthly[ts[:7]] += total
        
        # Track by event date
        ev_date = event_for_order(ts)
        if ev_date and total > 0:
            order_revenue_by_date[ev_date] += total
            order_count_by_date[ev_date] += 1
        
        for item in (items if items else []):
            qty = int(float(item.get('quantity', 1)))
            price = float(item.get('grossTotal', 0))
            name = item.get('name', 'Produto')
            brand = item.get('brand', {})
            cat_name = brand.get('name', 'Geral') if isinstance(brand, dict) else 'Geral'
            produtos[name]['qty'] += qty
            produtos[name]['total'] += price
            categorias[cat_name]['qty'] += qty
            categorias[cat_name]['total'] += price

p_total = sum(p['total'] for p in produtos.values()) or 1
c_total = sum(c['total'] for c in categorias.values()) or 1

produtoMix = sorted([{'name': k, 'qty': v['qty'], 'total': round(v['total'], 2),
    'pct': round(v['total']/p_total*100, 1)} for k, v in produtos.items()],
    key=lambda x: -x['total'])[:50]

categorias_list = sorted([{'name': k, 'qty': v['qty'], 'total': round(v['total'], 2),
    'pct': round(v['total']/c_total*100, 1)} for k, v in categorias.items()],
    key=lambda x: -x['total'])

# --- 2b) For unmatched DB events, try orders-based revenue ---
for ev in db_events:
    eid = ev['id']
    d = db_date(ev['date'])
    if event_bar_map.get(eid) is not None:
        continue  # already matched via ranking
    
    # Try to match via orders on the event date
    rev = order_revenue_by_date.get(d, 0)
    if rev > 0:
        event_bar_map[eid] = {
            'revenue': round(rev, 2),
            'date': d,
            'matchDist': 0,
            'orders': order_count_by_date.get(d, 0),
        }
        matched_count += 1
        print(f"  ORDERS match: {d} | {ev['title'][:35]} -> R$ {rev:,.0f}")
    else:
        event_bar_map[eid] = None

print(f"Total matched after orders fallback: {matched_count}/{len(db_events)}")

# --- 3) Payment methods ---
payments = defaultdict(float)
if os.path.exists(PAYMENTS_PATH):
    with open(PAYMENTS_PATH) as f:
        pay_data = json.load(f)
    for p in pay_data.get('methods', []):
        payments[p.get('name', '?')] += float(p.get('total', 0))

pay_total = sum(payments.values()) or 1
metodosPagamento = sorted([{'method': k, 'total': round(v, 2),
    'pct': round(v/pay_total*100, 1)} for k, v in payments.items()],
    key=lambda x: -x['total'])

# --- 4) Events with revenue from ranking ---
sorted_dates = sorted(event_revenue.keys())
total_bar_revenue = sum(event_revenue.values())

# Build per-ID eventBarRevenue export
event_bar_export = {}
for ev in db_events:
    eid = ev['id']
    d = db_date(ev['date'])
    m = event_bar_map.get(eid)
    if m and m.get('revenue', 0) > 0:
        tickets = ev.get('soldCount', 0) or 0
        event_bar_export[eid] = {
            'revenue': round(m['revenue'], 2),
            'transactions': m.get('orders', 0),
            'perCapita': SAFEDIV(m['revenue'], tickets) if tickets > 0 else 0,
        }
    else:
        # Backup nao tem dados para este evento — tentar preservar do existing_bar_rev
        preserved = None
        # Try by event ID (eid) first
        if eid in existing_bar_rev and existing_bar_rev[eid] is not None:
            preserved = existing_bar_rev[eid]
        # Try by symplaEventId as fallback (existing bar may use sympla-XX keys)
        if preserved is None:
            sympla_id = ev.get('symplaEventId')
            if sympla_id and sympla_id != 'None' and f'sympla-{sympla_id}' in existing_bar_rev:
                sid_key = f'sympla-{sympla_id}'
                if existing_bar_rev[sid_key] is not None:
                    preserved = existing_bar_rev[sid_key]
                    print(f"  PRESERVED via sympla: {eid} ({ev['title'][:35]}) -> R$ {preserved['revenue']:,.0f}")
        if preserved is not None:
            event_bar_export[eid] = preserved
            print(f"  PRESERVED: {eid} | {ev['title'][:35]} -> R$ {preserved['revenue']:,.0f}")
        else:
            # Ultimo fallback: dados manuais de 2026 do Yuzer
            yuzer_2026 = {
                "cm89a37dab087b8": {"revenue": 15072.0, "transactions": 276, "perCapita": 54.61},
                "cm875260665fa5f": {"revenue": 43138.0, "transactions": 750, "perCapita": 57.52},
                "sympla-3474070": {"revenue": 8562.0, "transactions": 172, "perCapita": 49.78},
                "cm8ae3f1b0ada38": {"revenue": 22433.0, "transactions": 534, "perCapita": 42.01},
                "cm842b46dd96f70": None,
            }
            if eid in yuzer_2026 and yuzer_2026[eid] is not None:
                event_bar_export[eid] = yuzer_2026[eid]
                print(f"  YUZER2026: {eid} | {ev['title'][:35]} -> R$ {yuzer_2026[eid]['revenue']:,.0f}")
            else:
                event_bar_export[eid] = None

# Count matched (inclui preservados)
matched_ids = {k for k, v in event_bar_export.items() if v is not None}
total_bar_revenue_matched = sum(v['revenue'] for v in event_bar_export.values() if v)

# --- 5) Build events list for bar-embed.ts from ranking ---
events_bar = []
events_bar_dates = set()
for start in sorted_dates:
    rev = event_revenue[start]
    events_bar.append({
        'start': start, 'end': event_dates.get(start, start), 'days': 1,
        'orders': 0, 'revenue': round(rev, 2), 'ticketMedio': 0, 'itensVendidos': 0,
        'produtos': [], 'metodosPagamento': [],
    })
    events_bar_dates.add(start)

# Merge existing events from bar-embed.ts that aren't in the backup ranking
if existing_bar_rev:
    # Extract existing events list from old bar-embed.ts
    old_events = []
    m_events = re.findall(r'\{"start": "([^"]+)",[^}]+"revenue": ([^,]+)', old, re.DOTALL)
    for start_date, rev_str in m_events:
        if start_date not in events_bar_dates:
            try:
                rev = float(rev_str)
                old_events.append({
                    'start': start_date, 'end': start_date, 'days': 1,
                    'orders': 0, 'revenue': rev, 'ticketMedio': 0, 'itensVendidos': 0,
                    'produtos': [], 'metodosPagamento': [],
                })
                events_bar_dates.add(start_date)
                print(f"  MERGED event: {start_date} -> R$ {rev:,.0f}")
            except:
                pass
    events_bar.extend(old_events)
    events_bar.sort(key=lambda x: x['start'])

# Monthly from orders
mensais = sorted([{'mes': k, 'label': k, 'eventos': 1, 'orders': 0,
    'revenue': round(v, 2), 'ticketMedio': 0} for k, v in monthly.items()],
    key=lambda x: x['mes'])

bar_data = {
    'source': 'backup',
    'totalEvents': len(events_bar),
    'totalRevenue': round(total_bar_revenue_matched, 2),
    'totalOrders': total_orders,
    'totalItens': total_itens,
    'ticketMedioBar': SAFEDIV(total_bar_revenue, total_orders),
    'ticketMedioGeral': SAFEDIV(total_bar_revenue, total_orders),
    'eventos': events_bar,
    'eventBarRevenue': event_bar_export,
    'mensais': mensais,
    'produtoMix': produtoMix,
    'metodosPagamento': metodosPagamento,
    'categorias': categorias_list,
}

ts = f'''// Auto-generated — DADOS REAIS do backup Yuzer
// {len(events_bar)} eventos, R$ {total_bar_revenue:,.2f}, {len(produtoMix)} produtos, {len(categorias_list)} categorias

import type {{ BarHistoryData }} from './use-bar-data'

export interface EventBarRevenue {{
  revenue: number
  transactions: number
  perCapita: number
}}

export const BAR_EMBED: BarHistoryData = {json.dumps(bar_data, indent=2, ensure_ascii=False)}
'''
with open(OUT_PATH, 'w') as f: f.write(ts)

print(f'OK: {len(events_bar)} eventos ranking, {matched_ids} DB eventos com bar data, R$ {total_bar_revenue_matched:,.2f} matched, {len(produtoMix)} produtos, {len(categorias_list)} categorias, {len(mensais)} meses')
