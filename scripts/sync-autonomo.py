#!/usr/bin/env python3
"""Sync autonomo Sarau Secreto — busca eventos do Sympla + Yuzer e atualiza embeds"""

import json, re, os, subprocess, sys
from datetime import datetime, timezone
from pathlib import Path

PROJECT = Path("/home/ser/sistema-sarau-secreto")
APP_LIB = PROJECT / "app/src/lib"
DB_EMBED = APP_LIB / "db-embed.ts"
BAR_EMBED = APP_LIB / "bar-embed.ts"
ENV_FILE = PROJECT / ".env"

def get_token(key):
    """Read a token from .env file or environment"""
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith(key + "="):
                val = line.split("=", 1)[1].strip().strip('"').strip("'")
                if val: return val
    return os.environ.get(key, "")

SYMPLA_TOKEN = get_token("SYMPLA_OAUTH_TOKEN")
YUZER_TOKEN = get_token("YUZER_TOKEN")
GH_TOKEN = get_token("GH_TOKEN")

# ── Sympla API ──────────────────────────────────────────────
def fetch_sympla_events():
    """Busca eventos da Sympla via API v1 usando curl subprocess"""
    if not SYMPLA_TOKEN:
        print("SYMPLA_OAUTH_TOKEN nao definido")
        return []
    
    import subprocess, json
    events = []
    page = 1
    
    while True:
        url = f"https://api.sympla.com.br/public/v1/events?page={page}"
        cmd = [
            "curl", "-s",
            "-H", f"s_token: {SYMPLA_TOKEN}",
            "-H", "Accept: application/json",
            url
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            if result.returncode != 0:
                print(f"Erro Sympla page {page}: curl exit {result.returncode}")
                break
            data = json.loads(result.stdout)
            if not isinstance(data, dict):
                print(f"Resposta inesperada: {str(result.stdout)[:200]}")
                break
        except Exception as e:
            resp_text = result.stdout[:200] if 'result' in dir() and hasattr(result, 'stdout') else 'N/A'
            print(f"Erro Sympla page {page}: {e}")
            print(f"Resposta: {resp_text}")
            break
        
        items = data.get("data", [])
        if not items:
            break
        
        for ev in items:
            events.append({
                "id": str(ev.get("id", "")),
                "name": ev.get("name", ""),
                "start_date": ev.get("start_date", ""),
                "end_date": ev.get("end_date", ""),
                "published": ev.get("published", 0),
                "sold": int(ev.get("sold", 0) or 0),
                "revenue": float(ev.get("revenue", 0) or 0),
                "capacity": int(ev.get("capacity", 0) or 0),
                "location": ev.get("address", {})
            })
        
        pagination = data.get("pagination", {})
        total_pages = pagination.get("total_page", 1)
        if page >= total_pages:
            break
        page += 1
    
    return events

# ── Ler embed atual ─────────────────────────────────────────
def parse_embed_events():
    """Extrai eventos do db-embed.ts"""
    if not DB_EMBED.exists():
        return [], {}
    
    text = DB_EMBED.read_text()
    
    # Encontrar o array events
    m = re.search(r'"events":\s*\[(.*?)\]\s*,\s*"tickets"', text, re.DOTALL)
    if not m:
        return [], {}
    
    events_text = "[" + m.group(1) + "]"
    # Corrigir JSON: remover trailing commas antes de ]
    events_text = re.sub(r',\s*\]', ']', events_text)
    events_text = re.sub(r',\s*\}', '}', events_text)
    
    try:
        events = json.loads(events_text)
    except json.JSONDecodeError as e:
        print(f"Erro parse events: {e}")
        return [], {}
    
    # Mapa symplaEventId -> event
    by_sympla = {}
    for ev in events:
        sid = ev.get("symplaEventId")
        if sid:
            by_sympla[sid] = ev
    
    return events, by_sympla

# ── Converter data Sympla para timestamp ms ─────────────────
def parse_date_to_ms(date_str):
    """Converte '2026-05-14 21:00:00' para timestamp ms"""
    if not date_str:
        return "0"
    try:
        dt = datetime.strptime(date_str.split(".")[0].strip(), "%Y-%m-%d %H:%M:%S")
        return str(int(dt.replace(tzinfo=timezone.utc).timestamp() * 1000))
    except:
        return "0"

# ── Gerar slug do titulo ────────────────────────────────────
def make_slug(title):
    slug = title.lower().strip()
    slug = re.sub(r'[^a-z0-9]+', '-', slug)
    slug = slug.strip('-')
    return slug[:60]

# ── Patch db-embed.ts com novos eventos ─────────────────────
def patch_db_embed(new_events):
    """Adiciona eventos novos ao db-embed.ts e retorna quantos foram adicionados"""
    text = DB_EMBED.read_text()
    existing, by_sympla = parse_embed_events()
    
    existing_ids = set(ev["symplaEventId"] for ev in existing if ev["symplaEventId"])
    
    added = 0
    for ev in new_events:
        sid = ev["id"]
        if sid in existing_ids:
            continue  # ja existe
        
        # Criar entry
        name_clean = ev["name"].strip()
        date_ms = parse_date_to_ms(ev.get("start_date", ""))
        
        entry = (
            '    {\n'
            f'      "id": "sympla-{sid}",\n'
            f'      "title": "{name_clean}",\n'
            f'      "date": "{date_ms}",\n'
            f'      "symplaEventId": "{sid}",\n'
            f'      "soldCount": {ev["sold"]},\n'
            f'      "totalRevenue": {ev["revenue"]},\n'
            f'      "capacity": {ev["capacity"]},\n'
            f'      "status": "published"\n'
            '    }'
        )
        
        # Inserir antes do fechamento do array events
        last_bracket = text.rfind("]")
        before = text[:last_bracket]
        after = text[last_bracket:]
        
        # Encontrar a ultima virgula antes de ]
        insert_pos = last_bracket
        # Se nao for o primeiro evento, colocar virgula
        if text[last_bracket-1] not in ['[', '{']:
            # Inserir antes do \n    ]
            text = before.rstrip() + ",\n" + entry + "\n" + after.lstrip()
        else:
            text = before.rstrip() + "\n" + entry + "\n" + after.lstrip()
        
        added += 1
        print(f"  + Novo evento: {name_clean} ({sid}) - {ev.get('start_date', '')}")
    
    if added > 0:
        DB_EMBED.write_text(text)
    
    return added

# ── Patch bar-embed.ts com novos eventos (null revenue) ────
def patch_bar_embed(new_events):
    """Adiciona entradas null no eventBarRevenue para eventos novos"""
    text = BAR_EMBED.read_text()
    
    # Extrair eventBarRevenue existente
    m = re.search(r'"eventBarRevenue":\s*\{(.*?)\}\s*,\s*"mensais"', text, re.DOTALL)
    if not m:
        return 0
    
    existing_bar_text = m.group(1)
    
    added = 0
    for ev in new_events:
        sid = ev["id"]
        entry_id = f'"sympla-{sid}"'
        
        if entry_id in existing_bar_text:
            continue  # ja existe
        
        # Inserir antes do fechamento }
        entry = f'    "{entry_id}": null'
        
        # Encontrar posicao do ultimo }
        obj_start = text.find('"eventBarRevenue"')
        obj_end = text.find('"mensais"', obj_start)
        
        # Inserir no final do map, antes da virgula
        insert_at = text.rfind("}", obj_start, obj_end)
        before = text[:insert_at]
        after = text[insert_at:]
        
        if text[insert_at-1] == ' ' or text[insert_at-1] == '\n':
            text = before.rstrip() + ",\n" + entry + "\n" + after
        else:
            text = before + ",\n" + entry + after
        
        added += 1
    
    if added > 0:
        BAR_EMBED.write_text(text)
    
    return added

# ── Git commit e push ───────────────────────────────────────
def git_commit_push():
    """Commit e push para triggerar deploy Cloudflare"""
    os.chdir(str(PROJECT))
    
    # Configurar remote com token
    repo_url = f"https://tiagohanna123:{GH_TOKEN}@github.com/tiagohanna123/sarau-secreto.git"
    
    # Set remote
    subprocess.run(["git", "remote", "set-url", "origin", repo_url],
                   capture_output=True, timeout=30)
    
    # Config user
    subprocess.run(["git", "config", "user.email", "lux@tiagohanna.com"],
                   capture_output=True, timeout=10)
    subprocess.run(["git", "config", "user.name", "Lux Auto-Sync"],
                   capture_output=True, timeout=10)
    
    # Add, commit
    result = subprocess.run(["git", "add", "-A"],
                           capture_output=True, text=True, timeout=30)
    
    result = subprocess.run(["git", "diff", "--cached", "--stat"],
                           capture_output=True, text=True, timeout=30)
    
    if not result.stdout.strip():
        print("  Nada para commitar")
        return False
    
    date_str = datetime.now(timezone.utc).strftime("%d/%m/%Y %H:%M")
    commit_msg = f"sync autonomo {date_str}"
    
    subprocess.run(["git", "commit", "-m", commit_msg],
                   capture_output=True, timeout=30)
    
    result = subprocess.run(["git", "push", "origin", "main"],
                           capture_output=True, text=True, timeout=60)
    
    if result.returncode == 0:
        print(f"  Push ok: {commit_msg}")
        return True
    else:
        print(f"  Push falhou: {result.stderr[:200]}")
        # Tentar master
        result = subprocess.run(["git", "push", "origin", "master"],
                               capture_output=True, text=True, timeout=60)
        if result.returncode == 0:
            print(f"  Push para master ok")
            return True
        return False

# ── Main ─────────────────────────────────────────────────────
def main():
    print(f"[{datetime.now(timezone.utc).strftime('%H:%M:%S')}] Sync autonomo Sarau Secreto")
    print()
    
    # 1. Buscar eventos Sympla
    print("1. Buscando eventos da Sympla API...")
    events = fetch_sympla_events()
    print(f"   {len(events)} eventos encontrados na API")
    
    if not events:
        print("   Nenhum evento - abortando")
        return
    
    # 2. Filtrar apenas eventos publicados com dados
    active = [e for e in events if e["published"] == 1 and e["id"]]
    print(f"   {len(active)} publicados")
    
    # 3. Comparar com embed
    print()
    print("2. Comparando com db-embed.ts...")
    existing, by_sympla = parse_embed_events()
    print(f"   {len(existing)} eventos no embed, {len(by_sympla)} com symplaEventId")
    
    # 4. Encontrar novos
    new_events = [e for e in active if e["id"] not in by_sympla]
    print(f"   {len(new_events)} eventos novos nao estao no embed")
    
    if not new_events:
        print()
        print("Nenhum evento novo. Sistema atualizado.")
        return
    
    print()
    print("3. Adicionando eventos novos...")
    
    added_db = patch_db_embed(new_events)
    print(f"   {added_db} adicionados ao db-embed.ts")
    
    added_bar = patch_bar_embed(new_events)
    print(f"   {added_bar} adicionados ao bar-embed.ts")
    
    # 5. Commit e push
    print()
    print("4. Commit e push...")
    pushed = git_commit_push()
    
    if pushed:
        print()
        print("SUCESSO: Sync concluido. Cloudflare vai deployar em ~30s.")
        print(f"   Eventos adicionados: {len(new_events)}")
        for ev in new_events:
            print(f"     - {ev['name']} ({ev['start_date'][:10]})")
    else:
        print()
        print("AVISO: Eventos adicionados ao embed mas push falhou.")
        print("  Execute manualmente: cd ~/projetos/sarau-secreto-novo && git push")

if __name__ == "__main__":
    main()
