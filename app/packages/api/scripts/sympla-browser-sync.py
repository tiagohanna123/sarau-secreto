#!/usr/bin/env python3
"""
Sympla Browser Automation Sync
================================
Complete pipeline that:
  1. Logs into organizador.sympla.com.br via Playwright (headless browser)
  2. Extracts session cookies
  3. Fetches ALL events (including 2025–2026 hidden ones) via internal AJAX API
  4. Imports event metadata and aggregated data (soldCount, revenue, capacity)
     directly into the SQLite database
  5. For events also accessible via the public API, syncs individual orders

Usage:
  python3 scripts/sympla-browser-sync.py                  # full pipeline
  python3 scripts/sympla-browser-sync.py --cookies-only   # just refresh cookies
  python3 scripts/sympla-browser-sync.py --dry-run        # preview without DB writes
  python3 scripts/sympla-browser-sync.py --no-browser     # skip login, use existing cookies

Environment:
  SYMPLA_EMAIL    (default: joao.nspi@gmail.com)
  SYMPLA_PASSWORD (default: J@melaosecreto1)
  SYMPLA_TOKEN    (from .env — for public API calls)

Dependencies:
  playwright, httpx, sqlite3 (stdlib)
"""

import argparse
import json
import os
import re
import sqlite3
import subprocess
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

# ── Paths ──
SCRIPT_DIR = Path(__file__).parent.resolve()
API_DIR = SCRIPT_DIR.parent
DB_PATH = API_DIR / "prisma" / "dev.db"
COOKIE_FILE = Path("/tmp/sympla-cookies.txt")
EVENTS_JSON = Path("/tmp/sympla-events.json")
AGG_JSON = Path("/tmp/sympla-events-agg.json")
TIMESTAMP_FILE = Path("/tmp/last-sympla-browser-sync.txt")

# ── Credentials (override via env) ──
SYMPLA_EMAIL = os.environ.get("SYMPLA_EMAIL", "joao.nspi@gmail.com")
SYMPLA_PASSWORD = os.environ.get("SYMPLA_PASSWORD", "J@melaosecreto1")

# ── Revenue regex from indicator tooltip ──
REVENUE_RE = re.compile(r"R\$\s*([\d.]+,\d{2})")


# ════════════════════════════════════════════════════════════════════
#  SECTION 1 — Browser Login (Playwright)
# ════════════════════════════════════════════════════════════════════

def browser_login(headless: bool = True, timeout_ms: int = 45_000) -> str:
    """
    Log into organizador.sympla.com.br using Playwright.
    Returns the raw Netscape cookie string compatible with curl.
    """
    from playwright.sync_api import sync_playwright

    print("🌐 [BROWSER] Launching Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=headless)
        context = browser.new_context(
            viewport={"width": 1280, "height": 900},
            locale="pt-BR",
            timezone_id="America/Sao_Paulo",
        )
        page = context.new_page()

        try:
            # ── Step 1: Navigate directly to the login page ──
            print("   → Navigating to www.sympla.com.br/organizador-login...")
            page.goto(
                "https://www.sympla.com.br/organizador-login",
                timeout=timeout_ms,
                wait_until="domcontentloaded",
            )
            page.wait_for_timeout(3000)

            # ── Step 2: Check if already logged in ──
            current_url = page.url
            if "organizador-login" not in current_url.lower():
                print(f"   ✅ Already logged in! Redirected to: {current_url}")
            else:
                # ── Fill in login form ──
                print("   → Filling login form...")

                # Email field
                email_input = page.locator("#LoginForm_username")
                email_input.wait_for(state="visible", timeout=10000)
                email_input.fill(SYMPLA_EMAIL)
                print(f"   → Email filled ({SYMPLA_EMAIL})")

                # Password field
                password_input = page.locator("#LoginForm_password")
                password_input.wait_for(state="visible", timeout=5000)
                password_input.fill(SYMPLA_PASSWORD)

                # Click "Mantenha-me conectado" checkbox
                remember = page.locator("#LoginForm_rememberMe")
                if remember.is_visible():
                    remember.check()
                    print("   → Remember me checked")

                # ── Step 3: Submit ──
                print("   → Submitting login form...")
                submit_btn = page.locator('button[type="submit"]', has_text="Login")
                submit_btn.click()

                # Wait for redirect away from login page
                try:
                    page.wait_for_url(
                        lambda u: "organizador" in u.lower() and "login" not in u.lower(),
                        timeout=timeout_ms,
                    )
                except Exception:
                    pass

                page.wait_for_timeout(3000)

            # ── Step 4: Check if login succeeded ──
            current_url = page.url
            print(f"   → Current URL: {current_url}")

            if "login" in current_url.lower() or "entrar" in current_url.lower():
                # Check for error messages
                try:
                    error_msg = page.inner_text("#errorMsgLoginEmail, #errorMsgLoginPsw")
                    if error_msg and "inválido" in error_msg.lower() or "incorreto" in error_msg.lower():
                        page.screenshot(path="/tmp/sympla-login-failed.png")
                        raise RuntimeError(
                            f"Login failed: {error_msg[:100]}"
                        )
                except Exception as e:
                    if "Login failed" in str(e):
                        raise

                page.screenshot(path="/tmp/sympla-login-stuck.png")
                print("   ⚠️  Still on login page. Screenshot saved.")
                # Try using the responsive form (_resp) as fallback
                email_input = page.locator("#LoginForm_username_resp")
                if email_input.is_visible():
                    print("   → Trying responsive form...")
                    email_input.fill(SYMPLA_EMAIL)
                    page.locator("#LoginForm_password_resp").fill(SYMPLA_PASSWORD)
                    page.locator("#LoginForm_rememberMe_resp").check()
                    page.locator('button[type="submit"]', has_text="Login").click()
                    page.wait_for_timeout(3000)

            # ── Step 5: Navigate to eventos page ──
            print("   → Navigating to /meus-eventos...")
            try:
                page.goto(
                    "https://organizador.sympla.com.br/meus-eventos",
                    timeout=timeout_ms,
                    wait_until="domcontentloaded",
                )
            except Exception:
                pass
            page.wait_for_timeout(3000)

            # ── Step 5: Extract cookies ──
            print("   → Extracting session cookies...")
            cookies = context.cookies()

            # Format as Netscape cookie file for curl
            cookie_lines = [
                "# Netscape HTTP Cookie File",
                "# Generated by sympla-browser-sync.py",
            ]
            for c in cookies:
                domain = c.get("domain", "")
                if not domain.startswith("."):
                    domain = f".{domain}"
                flag = "TRUE" if c.get("secure", False) else "FALSE"
                path = c.get("path", "/")
                secure = "TRUE" if c.get("secure", False) else "FALSE"
                expires = str(int(c.get("expires", 0))) if c.get("expires") else "0"
                name = c["name"]
                value = c["value"]
                cookie_lines.append(f"{domain}\t{flag}\t{path}\t{secure}\t{expires}\t{name}\t{value}")

            cookie_str = "\n".join(cookie_lines)

            # Save to file
            COOKIE_FILE.parent.mkdir(parents=True, exist_ok=True)
            COOKIE_FILE.write_text(cookie_str)
            print(f"   ✅ Cookies saved ({len(cookies)} cookies) to {COOKIE_FILE}")

            # Also save the session ID separately for easy reference
            for c in cookies:
                if "session" in c["name"].lower() or "sess" in c["name"].lower() or "token" in c["name"].lower():
                    print(f"   🔑 Key cookie: {c['name']}={c['value'][:30]}...")

            # Take screenshot for debugging
            try:
                page.screenshot(path="/tmp/sympla-after-login.png")
                print("   📸 Screenshot saved to /tmp/sympla-after-login.png")
            except Exception:
                pass

            browser.close()
            return cookie_str

        except Exception as e:
            try:
                page.screenshot(path="/tmp/sympla-browser-error.png")
            except Exception:
                pass
            browser.close()
            raise RuntimeError(f"Browser login failed: {e}")


# ════════════════════════════════════════════════════════════════════
#  SECTION 2 — Fetch Events from Internal AJAX API
# ════════════════════════════════════════════════════════════════════

def fetch_internal_api(cookie_file: Path = COOKIE_FILE) -> list[dict]:
    """
    Fetch ALL events from the Sympla internal AJAX API using session cookies.
    Returns a list of event dicts from BOTH pages.
    """
    print("\n📡 [FETCH] Fetching events from internal API...")

    if not cookie_file.exists():
        raise FileNotFoundError(
            f"Cookie file {cookie_file} not found. Run browser login first."
        )

    def fetch_page(page_num: int) -> dict:
        url = (
            "https://organizador.sympla.com.br/ajax/meus-eventos"
            f"?status=all&shared=all&field=START_DATE&sort=ASC&eventStatus=all&page={page_num}"
        )
        cmd = [
            "/usr/bin/curl", "-s",
            url,
            "-H", "X-Requested-With: XMLHttpRequest",
            "-H", "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "-b", str(cookie_file),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)

        if result.returncode != 0:
            raise RuntimeError(f"curl failed (exit {result.returncode}): {result.stderr[:200]}")

        try:
            return json.loads(result.stdout)
        except json.JSONDecodeError as e:
            print(f"   ⚠️  Invalid JSON from page {page_num}: {result.stdout[:300]}")
            raise RuntimeError(f"JSON decode error on page {page_num}: {e}")

    # Fetch page 1
    p1 = fetch_page(1)
    p1_events = p1.get("events", [])
    print(f"   → Page 1: {len(p1_events)} events")

    if not p1_events:
        # Check if session is valid by looking at the raw response
        print("   ⚠️  No events on page 1 — session may be expired")
        # Try fetching again with verbose curl to see what's happening
        cmd = [
            "/usr/bin/curl", "-v", "-s",
            "https://organizador.sympla.com.br/ajax/meus-eventos?status=all&shared=all&field=START_DATE&sort=ASC&eventStatus=all&page=1",
            "-H", "X-Requested-With: XMLHttpRequest",
            "-H", "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
            "-b", str(cookie_file),
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
        print(f"   Debug stdout[:500]: {result.stdout[:500]}")
        print(f"   Debug stderr[:500]: {result.stderr[:500]}")

        # Try using Playwright cookies instead
        print("   🔄 Attempting to re-login via browser...")
        browser_login()
        p1 = fetch_page(1)
        p1_events = p1.get("events", [])

        if not p1_events:
            raise RuntimeError(
                "Session invalid even after re-login. Check credentials or account access."
            )

    # Fetch page 2
    p2 = fetch_page(2)
    p2_events = p2.get("events", [])
    print(f"   → Page 2: {len(p2_events)} events")

    all_events = p1_events + p2_events
    print(f"   ✅ Total: {len(all_events)} events fetched")

    return all_events


# ════════════════════════════════════════════════════════════════════
#  SECTION 3 — Parse Event Data
# ════════════════════════════════════════════════════════════════════

def parse_brl(value_str: str) -> float:
    """Convert Brazilian currency '35.431,71' → 35431.71"""
    if not value_str:
        return 0.0
    cleaned = value_str.replace(".", "").replace(",", ".")
    try:
        return float(cleaned)
    except ValueError:
        return 0.0


def parse_revenue(tooltip: str) -> float:
    """Extract total revenue from INDICATOR_TOOLTIP string."""
    if not tooltip:
        return 0.0
    match = REVENUE_RE.search(tooltip)
    if match:
        return parse_brl(match.group(1))
    return 0.0


def parse_date_br(date_str: str) -> str | None:
    """Convert Brazilian date '16/04/2026' → ISO '2026-04-16'"""
    if not date_str or "/" not in date_str:
        return None
    try:
        parts = date_str.split("/")
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    except (IndexError, ValueError):
        return None


def parse_events(all_events: list[dict]) -> list[dict]:
    """Parse and normalize Sympla internal API events."""
    parsed = []
    for ev in all_events:
        name = ev.get("NAME", "").strip()
        if name.lower() == "teste":
            continue

        sympla_id = str(ev.get("EVENT_ID", ""))
        start_date = ev.get("START_DATE", "")
        indicator = ev.get("INDICATOR", {}) or {}
        tooltip = ev.get("INDICATOR_TOOLTIP", "")

        sold_str = indicator.get("sold", "0") or "0"
        capacity_str = indicator.get("total", "0") or "0"

        try:
            sold_count = int(sold_str)
        except (ValueError, TypeError):
            sold_count = 0
        try:
            capacity = int(capacity_str)
        except (ValueError, TypeError):
            capacity = 0

        revenue = parse_revenue(tooltip)
        date_iso = parse_date_br(start_date)
        city = ev.get("CITY", "") or ""
        status_raw = ev.get("STATUS", "") or ""
        user_id = str(ev.get("USER_ID", "")) if ev.get("USER_ID") else None

        # Map Sympla status to our status
        if "cancelado" in status_raw.lower() or status_raw.lower() == "cancelado":
            status = "cancelled"
        elif "encerrado" in status_raw.lower() or status_raw.lower() == "encerrado":
            status = "published"
        elif "ativo" in status_raw.lower() or status_raw.lower() == "ativo":
            status = "published"
        elif "rascunho" in status_raw.lower():
            status = "draft"
        else:
            status = "draft"

        # Generate slug from name + date
        name_slug = re.sub(r"[^\w\s-]", "", name.lower())
        name_slug = re.sub(r"[-\s]+", "-", name_slug).strip("-")
        date_part = date_iso if date_iso else "unknown-date"
        slug = f"{name_slug}-{date_part}"[:100]

        parsed.append({
            "sympla_id": sympla_id,
            "name": name,
            "date_br": start_date,
            "date_iso": date_iso,
            "city": city,
            "status_raw": status_raw,
            "status": status,
            "capacity": capacity,
            "sold_count": sold_count,
            "revenue": revenue,
            "user_id": user_id,
            "slug": slug,
            "tooltip": tooltip,
        })

    return parsed


# ════════════════════════════════════════════════════════════════════
#  SECTION 4 — Import into SQLite Database
# ════════════════════════════════════════════════════════════════════

def import_to_db(events: list[dict], dry_run: bool = False) -> dict:
    """
    Import parsed events into the SQLite database.
    Creates new events and updates existing ones.
    Returns stats dict.
    """
    print("\n💾 [DB] Importing into database...")

    if not DB_PATH.exists():
        raise FileNotFoundError(f"Database not found at {DB_PATH}")

    if dry_run:
        print("   🏁 DRY RUN — no changes will be written to DB")

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    cur = conn.cursor()

    # Pre-fetch existing events for matching
    cur.execute("SELECT id, title, date, symplaEventId, slug FROM Event")
    existing_rows = cur.fetchall()

    # Build lookup maps
    by_sympla_id: dict[str, sqlite3.Row] = {}
    by_slug: dict[str, sqlite3.Row] = {}
    for row in existing_rows:
        if row["symplaEventId"]:
            by_sympla_id[row["symplaEventId"]] = row
        if row["slug"]:
            by_slug[row["slug"]] = row

    created = 0
    updated = 0
    skipped = 0
    errors = []

    for ev in events:
        try:
            existing = None

            # 1. Match by sympla_id
            if ev["sympla_id"] and ev["sympla_id"] in by_sympla_id:
                existing = by_sympla_id[ev["sympla_id"]]

            # 2. Match by slug
            if existing is None and ev["slug"] in by_slug:
                existing = by_slug[ev["slug"]]

            # 3. Fuzzy match by title (if we have enough unique name)
            if existing is None:
                title_lower = ev["name"].lower()
                for row in existing_rows:
                    db_title = row["title"].lower() if row["title"] else ""
                    # Check if titles are very similar
                    if title_lower == db_title or (
                        title_lower in db_title or db_title in title_lower
                    ):
                        existing = row
                        break

            now = datetime.now(timezone.utc).isoformat()

            if existing:
                # UPDATE existing event
                if not dry_run:
                    cur.execute(
                        """UPDATE Event SET
                            title = ?,
                            slug = ?,
                            date = ?,
                            location = ?,
                            capacity = ?,
                            "soldCount" = ?,
                            "totalRevenue" = ?,
                            "symplaUserId" = ?,
                            status = ?,
                            "symplaEventId" = ?,
                            "updatedAt" = ?
                        WHERE id = ?""",
                        (
                            ev["name"],
                            ev["slug"],
                            ev["date_iso"],
                            ev["city"],
                            ev["capacity"],
                            ev["sold_count"],
                            ev["revenue"],
                            ev["user_id"],
                            ev["status"],
                            ev["sympla_id"],
                            now,
                            existing["id"],
                        ),
                    )
                updated += 1
            else:
                # CREATE new event
                if not dry_run:
                    # Generate a CUID-like ID or use sympla_id
                    import uuid
                    event_id = str(uuid.uuid4())

                    cur.execute(
                        """INSERT INTO Event
                            (id, title, slug, description, date, location,
                             capacity, "soldCount", "totalRevenue",
                             "symplaUserId", "symplaEventId", status,
                             "createdAt", "updatedAt")
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        (
                            event_id,
                            ev["name"],
                            ev["slug"],
                            "",              # description
                            ev["date_iso"],
                            ev["city"],
                            ev["capacity"],
                            ev["sold_count"],
                            ev["revenue"],
                            ev["user_id"],
                            ev["sympla_id"],
                            ev["status"],
                            now,
                            now,
                        ),
                    )
                created += 1

        except Exception as e:
            errors.append(f"{ev['name']}: {e}")
            skipped += 1

    if not dry_run:
        conn.commit()

    conn.close()

    stats = {
        "created": created,
        "updated": updated,
        "skipped": skipped,
        "errors": errors,
        "total_input": len(events),
    }

    print(f"   ✅ Created: {created}, Updated: {updated}, Skipped: {skipped}")
    if errors:
        print(f"   ⚠️  Errors ({len(errors)}):")
        for e in errors[:5]:
            print(f"       - {e}")
        if len(errors) > 5:
            print(f"       ... and {len(errors) - 5} more")

    return stats


# ════════════════════════════════════════════════════════════════════
#  SECTION 5 — Try Public API Sync for Accessible Events
# ════════════════════════════════════════════════════════════════════

def try_public_api_ids(all_events: list[dict]) -> list[str]:
    """
    For each event from internal API, try to fetch its data from the
    public API. If successful, the event's orders can be synced.
    Returns list of event IDs that are accessible via public API.
    """
    print("\n🔍 [API] Checking which events are accessible via public API...")

    token = os.environ.get("SYMPLA_TOKEN", "")
    if not token:
        # Try loading from .env
        env_path = API_DIR / ".env"
        if env_path.exists():
            for line in env_path.read_text().splitlines():
                if line.startswith("SYMPLA_TOKEN="):
                    token = line.split("=", 1)[1].strip().strip('"').strip("'")
                    break

    if not token:
        print("   ⚠️  SYMPLA_TOKEN not configured — skipping public API check")
        return []

    available_ids = []
    base_url = os.environ.get(
        "SYMPLA_API_BASE",
        "https://api.sympla.com.br/public/v1.5.1",
    ).rstrip("/")

    for ev in all_events[:5]:  # Only test first 5 to gauge availability
        event_id = ev.get("EVENT_ID")
        if not event_id:
            continue

        url = f"{base_url}/events/{event_id}"
        cmd = [
            "/usr/bin/curl", "-s", "-o", "/dev/null", "-w", "%{http_code}",
            url,
            "-H", f"s_token: {token}",
            "-H", "User-Agent: Mozilla/5.0",
        ]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=15)
            status_code = result.stdout.strip()
            if status_code == "200":
                available_ids.append(str(event_id))
            print(f"   Event #{event_id}: HTTP {status_code}")
        except Exception as e:
            print(f"   Event #{event_id}: error — {e}")

    print(f"   → {len(available_ids)} events accessible via public API (first {len(all_events[:5])} checked)")
    return available_ids


# ════════════════════════════════════════════════════════════════════
#  SECTION 6 — Save JSON Files for Existing Scripts
# ════════════════════════════════════════════════════════════════════

def save_json_outputs(parsed_events: list[dict], raw_events: list[dict]) -> None:
    """Save event data in formats expected by existing import scripts."""

    # Format for sympla-full-import.py (simplified JSON)
    simplified = [
        {
            "id": int(ev["sympla_id"]) if ev["sympla_id"].isdigit() else ev["sympla_id"],
            "nome": ev["name"],
            "data": ev["date_br"],
            "cidade": ev["city"],
            "status": ev["status_raw"],
            "vendidos": ev["sold_count"],
            "capacidade": ev["capacity"],
        }
        for ev in parsed_events
    ]
    EVENTS_JSON.write_text(json.dumps(simplified, ensure_ascii=False, indent=2))
    print(f"   ✅ Saved simplified JSON ({len(simplified)} events) to {EVENTS_JSON}")

    # Format for sympla-aggregate-import.py (raw format with full details)
    AGG_JSON.write_text(json.dumps(raw_events, ensure_ascii=False, indent=2))
    print(f"   ✅ Saved aggregate JSON ({len(raw_events)} events) to {AGG_JSON}")


# ════════════════════════════════════════════════════════════════════
#  SECTION 7 — Save Sync Timestamp
# ════════════════════════════════════════════════════════════════════

def save_timestamp() -> None:
    """Record the timestamp of this sync for cron monitoring."""
    from datetime import datetime
    TIMESTAMP_FILE.write_text(datetime.now(timezone.utc).isoformat() + "\n")
    print(f"   📅 Sync timestamp saved to {TIMESTAMP_FILE}")


# ════════════════════════════════════════════════════════════════════
#  SECTION 8 — Main Pipeline
# ════════════════════════════════════════════════════════════════════

def run_pipeline(
    cookies_only: bool = False,
    dry_run: bool = False,
    no_browser: bool = False,
    headless: bool = True,
) -> dict:
    """
    Run the complete sync pipeline.
    Returns a result dict with stats.
    """
    start_time = time.time()
    print(f"\n{'='*70}")
    print(f"  🎭  SYMPLA BROWSER SYNC — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*70}\n")

    result = {
        "browser_login": False,
        "events_fetched": 0,
        "events_parsed": 0,
        "db_created": 0,
        "db_updated": 0,
        "db_skipped": 0,
        "public_api_available": 0,
        "duration_seconds": 0,
        "status": "unknown",
    }

    try:
        # ── Step 1: Browser Login ──
        if cookies_only:
            print("[MODE] Cookies only — skipping fetch and import\n")
            browser_login(headless=headless)
            result["browser_login"] = True
            result["status"] = "cookies_saved"
            return result

        if not no_browser:
            # Check if cookies exist and are valid first
            if COOKIE_FILE.exists():
                print("   🔄 Testing existing cookies...")
                test = fetch_internal_api()
                if test:
                    print("   ✅ Existing cookies are still valid!")
                else:
                    print("   🔄 Existing cookies expired — re-logging in...")
                    browser_login(headless=headless)
            else:
                browser_login(headless=headless)
            result["browser_login"] = True
        else:
            if not COOKIE_FILE.exists():
                raise FileNotFoundError(
                    "No cookies found and --no-browser mode is set. "
                    "Run without --no-browser first to login."
                )
            print("   ℹ️  --no-browser mode: using existing cookies")

        # ── Step 2: Fetch from Internal API ──
        raw_events = fetch_internal_api()
        result["events_fetched"] = len(raw_events)

        # ── Step 3: Parse Events ──
        parsed = parse_events(raw_events)
        result["events_parsed"] = len(parsed)
        print(f"\n📋 [PARSE] Parsed {len(parsed)} events (filtered test events)")

        # Show a preview of what we got
        print(f"\n{'─'*70}")
        print(f"  {'EVENTO':<50} {'DATA':<12} {'VENDIDOS':<10}")
        print(f"{'─'*70}")
        for ev in parsed[:10]:
            print(f"  {ev['name'][:48]:<50} {ev['date_br']:<12} {ev['sold_count']:<10}")
        if len(parsed) > 10:
            print(f"  ... and {len(parsed) - 10} more events")
        print(f"{'─'*70}\n")

        # ── Step 4: Save JSON files for legacy scripts ──
        if not dry_run:
            save_json_outputs(parsed, raw_events)

        # ── Step 5: Import into Database ──
        db_stats = import_to_db(parsed, dry_run=dry_run)
        result["db_created"] = db_stats["created"]
        result["db_updated"] = db_stats["updated"]
        result["db_skipped"] = db_stats["skipped"]

        # ── Step 6: Check public API availability ──
        # (Only for events that might be accessible)
        try:
            available = try_public_api_ids(raw_events)
            result["public_api_available"] = len(available)
        except Exception as e:
            print(f"   ⚠️  Public API check failed: {e}")
            result["public_api_available"] = -1

        # ── Step 7: Save timestamp ──
        if not dry_run:
            save_timestamp()

        # ── Summary ──
        elapsed = time.time() - start_time
        result["duration_seconds"] = round(elapsed, 1)
        result["status"] = "completed"

        print(f"\n{'='*70}")
        print(f"  ✅  SYNC COMPLETED in {elapsed:.1f}s")
        print(f"{'='*70}")
        print(f"  Eventos no Sympla:        {result['events_fetched']}")
        print(f"  Importados (criados):      {result['db_created']}")
        print(f"  Atualizados:               {result['db_updated']}")
        print(f"  Pular/erros:               {result['db_skipped']}")
        if result["public_api_available"] >= 0:
            print(f"  Acessíveis via API pública: {result['public_api_available']}")
        print(f"{'='*70}\n")

        return result

    except Exception as e:
        elapsed = time.time() - start_time
        result["duration_seconds"] = round(elapsed, 1)
        result["status"] = f"failed: {e}"
        print(f"\n❌ [FATAL] {e}")
        import traceback
        traceback.print_exc()
        return result


# ════════════════════════════════════════════════════════════════════
#  CLI Entry Point
# ════════════════════════════════════════════════════════════════════

def main():
    parser = argparse.ArgumentParser(
        description="Sympla Browser Automation Sync — login, fetch ALL events, import",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python3 scripts/sympla-browser-sync.py              # Full pipeline
  python3 scripts/sympla-browser-sync.py --cookies-only   # Just refresh cookies
  python3 scripts/sympla-browser-sync.py --dry-run        # Preview only
  python3 scripts/sympla-browser-sync.py --no-browser     # Use existing cookies
  python3 scripts/sympla-browser-sync.py --visible        # Show browser window
        """,
    )
    parser.add_argument(
        "--cookies-only",
        action="store_true",
        help="Only refresh session cookies, skip fetch & import",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Fetch and parse but do NOT write to database",
    )
    parser.add_argument(
        "--no-browser",
        action="store_true",
        help="Skip browser login step (use existing cookies)",
    )
    parser.add_argument(
        "--visible",
        action="store_true",
        help="Show browser window (non-headless mode, useful for debugging)",
    )
    parser.add_argument(
        "--json-only",
        action="store_true",
        help="Fetch events and save JSON files, skip DB import",
    )

    args = parser.parse_args()

    headless = not args.visible

    if args.json_only:
        # Just fetch and save JSON, no DB operations
        print("[MODE] JSON only — fetch and save, skip DB import\n")
        if not COOKIE_FILE.exists() or not args.no_browser:
            browser_login(headless=headless)
        raw_events = fetch_internal_api()
        parsed = parse_events(raw_events)
        save_json_outputs(parsed, raw_events)
        print(f"\n✅ Saved {len(parsed)} events to JSON files")
        return

    result = run_pipeline(
        cookies_only=args.cookies_only,
        dry_run=args.dry_run,
        no_browser=args.no_browser,
        headless=headless,
    )

    # Exit with appropriate code
    if result["status"] == "completed":
        sys.exit(0)
    elif result["status"] == "cookies_saved":
        sys.exit(0)
    elif "failed" in result["status"]:
        sys.exit(1)
    else:
        sys.exit(0)


if __name__ == "__main__":
    main()
