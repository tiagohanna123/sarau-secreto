#!/bin/bash
# preprocess-bar-backup.sh — Gera src/lib/bar-embed.ts a partir do backup Yuzer
# Uso: bash scripts/preprocess-bar-backup.sh

set -e
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BACKUP="$HOME/sarau-yuzer-backup"
OUT="$ROOT/src/lib/bar-embed.ts"

if [ ! -f "$BACKUP/orders.json" ]; then
  echo "⚠️ Backup Yuzer nao encontrado em $BACKUP. Bar embed sera vazio."
  mkdir -p "$(dirname "$OUT")"
  cat > "$OUT" << 'EOF'
// Backup Yuzer indisponivel — dados de bar vazios
export const BAR_EMBED = null
EOF
  echo "⚠️ bar-embed.ts gerado como vazio"
  exit 0
fi

python3 << 'PYEOF'
import json, os, sys
from collections import defaultdict
from datetime import datetime, timezone

BACKUP = os.path.expanduser("~/sarau-yuzer-backup")

with open(f"{BACKUP}/orders.json") as f:
    orders = json.load(f)

with open(f"{BACKUP}/products_full.json") as f:
    products = json.load(f)

# Build product catalog
product_map = {}
for p in products if isinstance(products, list) else products.get('data', []):
    pid = p.get('id') or p.get('code')
    product_map[str(pid)] = {
        'name': p.get('name') or p.get('description', ''),
        'category': (p.get('category') or {}).get('name', 'Geral') if isinstance(p.get('category'), dict) else (p.get('category') or 'Geral'),
    }

# Aggregate orders
events_map = defaultdict(lambda: {
    'start': '', 'end': '', 'days': 0,
    'orders': 0, 'revenue': 0.0, 'ticketMedio': 0.0, 'itensVendidos': 0,
    'produtos': defaultdict(lambda: {'qty': 0, 'total': 0.0}),
    'metodosPagamento': defaultdict(lambda: {'total': 0.0}),
})

month_map = defaultdict(lambda: {'eventos': 0, 'orders': 0, 'revenue': 0.0})

product_totals = defaultdict(lambda: {'qty': 0, 'total': 0.0})
payment_totals = defaultdict(lambda: {'total': 0.0})
category_totals = defaultdict(lambda: {'qty': 0, 'total': 0.0})

for o in orders if isinstance(orders, list) else orders.get('data', []):
    event_name = o.get('eventName') or o.get('event_name', 'Geral')
    event_date = o.get('eventDate') or o.get('saleDate') or ''
    ts = o.get('createdAt') or o.get('saleDate') or ''
    total = float(o.get('finalPrice') or o.get('total') or o.get('value', 0))
    payment = (o.get('paymentMethod') or {}).get('name', 'Outros') if isinstance(o.get('paymentMethod'), dict) else (o.get('paymentMethod') or 'Outros')
    items = o.get('items', o.get('products', [o])) 

    ev = events_map[event_name]
    if not ev['start'] or event_date < ev['start']:
        ev['start'] = event_date
    if not ev['end'] or event_date > ev['end']:
        ev['end'] = event_date
    ev['orders'] += 1
    ev['revenue'] += total
    ev['itensVendidos'] += len(items) if isinstance(items, list) else 1
    ev['metodosPagamento'][payment]['total'] += total

    if ts and len(ts) >= 7:
        month_key = ts[:7]
        month_map[month_key]['orders'] += 1
        month_map[month_key]['revenue'] += total

    payment_totals[payment]['total'] += total

    for item in (items if isinstance(items, list) else [items]):
        pid = str(item.get('productId') or item.get('id', ''))
        qty = int(item.get('quantity', item.get('qty', 1)))
        price = float(item.get('finalPrice') or item.get('totalPrice', 0)) or (total / max(len(items), 1))

        prod = product_map.get(pid, {'name': item.get('name', f'Produto {pid}'), 'category': 'Geral'})
        ev['produtos'][prod['name']]['qty'] += qty
        ev['produtos'][prod['name']]['total'] += price
        product_totals[prod['name']]['qty'] += qty
        product_totals[prod['name']]['total'] += price
        category_totals[prod['category']]['qty'] += qty
        category_totals[prod['category']]['total'] += price

# Compute days per event
for name, ev in events_map.items():
    if ev['start'] and ev['end']:
        try:
            start = datetime.fromisoformat(ev['start'].replace('Z', '+00:00'))
            end = datetime.fromisoformat(ev['end'].replace('Z', '+00:00'))
            ev['days'] = max(1, (end - start).days + 1)
        except:
            ev['days'] = 1
    ev['ticketMedio'] = round(ev['revenue'] / ev['orders'], 2) if ev['orders'] > 0 else 0
    month_map[month_key]['eventos'] += 1
    ev['produtos'] = {
        k: {'qty': v['qty'], 'total': round(v['total'], 2),
            'pct': round(v['total'] / ev['revenue'] * 100, 1) if ev['revenue'] > 0 else 0}
        for k, v in sorted(ev['produtos'].items(), key=lambda x: -x[1]['total'])
    }
    ev['metodosPagamento'] = {
        k: {'total': round(v['total'], 2),
            'pct': round(v['total'] / ev['revenue'] * 100, 1) if ev['revenue'] > 0 else 0}
        for k, v in ev['metodosPagamento'].items()
    }

# Compute monthly data
mensais = sorted([
    {'mes': k, 'label': k, 'eventos': v['eventos'], 'orders': v['orders'],
     'revenue': round(v['revenue'], 2),
     'ticketMedio': round(v['revenue'] / v['orders'], 2) if v['orders'] > 0 else 0}
    for k, v in month_map.items()
], key=lambda x: x['mes'])

# Sort events by date
eventos_sorted = sorted(
    [{'start': v['start'], 'end': v['end'], 'days': v['days'],
      'orders': v['orders'], 'revenue': round(v['revenue'], 2),
      'ticketMedio': v['ticketMedio'], 'itensVendidos': v['itensVendidos'],
      'produtos': list(v['produtos'].values()),
      'metodosPagamento': list(v['metodosPagamento'].values())}
     for v in events_map.values()],
    key=lambda x: x['start']
)

# Product mix
produtoMix = sorted(
    [{'name': k, 'qty': v['qty'], 'total': round(v['total'], 2),
      'pct': round(v['total'] / sum(pt['total'] for pt in product_totals.values()) * 100, 1)}
     for k, v in product_totals.items()],
    key=lambda x: -x['total']
)

# Categories
categorias = sorted(
    [{'name': k, 'qty': v['qty'], 'total': round(v['total'], 2),
      'pct': round(v['total'] / sum(ct['total'] for ct in category_totals.values()) * 100, 1)}
     for k, v in category_totals.items()],
    key=lambda x: -x['total']
)

# Payment methods
metodosPagamento = sorted(
    [{'method': k, 'total': round(v['total'], 2),
      'pct': round(v['total'] / sum(pt['total'] for pt in payment_totals.values()) * 100, 1)}
     for k, v in payment_totals.items()],
    key=lambda x: -x['total']
)

total_orders = sum(v['orders'] for v in events_map.values())
total_revenue = sum(v['revenue'] for v in events_map.values())
total_itens = sum(v['itensVendidos'] for v in events_map.values())

bar_data = {
    'source': 'backup',
    'totalEvents': len(events_map),
    'totalRevenue': round(total_revenue, 2),
    'totalOrders': total_orders,
    'totalItens': total_itens,
    'ticketMedioBar': round(total_revenue / total_orders, 2) if total_orders > 0 else 0,
    'ticketMedioGeral': round(total_revenue / total_orders, 2) if total_orders > 0 else 0,
    'eventos': eventos_sorted,
    'mensais': mensais,
    'produtoMix': produtoMix[:30],
    'metodosPagamento': metodosPagamento,
    'categorias': categorias,
}

ts = f'''// Auto-generated por preprocess-bar-backup.sh
// DADOS REAIS do backup Yuzer — NÃO edite manualmente
// {len(eventos_sorted)} eventos, {total_orders} pedidos, R$ {total_revenue:,.2f}

import type {{ BarHistoryData }} from './use-bar-data'

export const BAR_EMBED: BarHistoryData = {json.dumps(bar_data, indent=2, ensure_ascii=False)}
'''

with open('$OUT', 'w') as f:
    f.write(ts)

print(f'✅ bar-embed.ts gerado: {len(eventos_sorted)} eventos, {total_orders} pedidos, R$ {total_revenue:,.2f}')
PYEOF

echo "Done"
