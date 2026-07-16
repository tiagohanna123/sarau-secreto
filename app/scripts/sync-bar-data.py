#!/usr/bin/env python3
"""Sync functions/data/bar.ts from src/lib/bar-embed.ts"""
import re, json

with open('../src/lib/bar-embed.ts') as f:
    src = f.read()

# Extract eventBarRevenue as raw text
start = src.index('"eventBarRevenue"')
start = src.index('{', start)
depth = 0
end = start
for i in range(start, len(src)):
    if src[i] == '{': depth += 1
    elif src[i] == '}':
        depth -= 1
        if depth == 0:
            end = i + 1
            break
map_raw = src[start:end]

# Replace None with null and fix trailing commas
map_clean = map_raw.replace(': None', ': null').replace('None,', 'null,')
# Remove trailing commas before }
map_clean = re.sub(r',\s*}', '}', map_clean)

# Validate it parses as JS object
try:
    eval_map = json.loads(map_clean)
    print(f"Parsed OK: {len(eval_map)} entries")
    ids = list(eval_map.keys())
    with_data = sum(1 for v in eval_map.values() if v is not None)
    null_data = sum(1 for v in eval_map.values() if v is None)
    print(f"With data: {with_data}, Null: {null_data}")
except json.JSONDecodeError as e:
    print(f"Parse error: {e}")
    # Write to temp for inspection
    with open('/tmp/map_debug.txt', 'w') as f:
        f.write(map_clean[:2000])
    print("Wrote debug to /tmp/map_debug.txt")
    exit(1)

# Read functions/data/bar.ts
with open('../functions/data/bar.ts') as f:
    dest = f.read()

# Replace BAR_REVENUE_MAP section
map_start = dest.index('BAR_REVENUE_MAP')
map_start = dest.index('{', map_start)
depth = 0
map_end = map_start
for i in range(map_start, len(dest)):
    if dest[i] == '{': depth += 1
    elif dest[i] == '}':
        depth -= 1
        if depth == 0:
            map_end = i + 1
            break

new_map = map_clean
new_dest = dest[:map_start] + new_map + dest[map_end:]
with open('../functions/data/bar.ts', 'w') as f:
    f.write(new_dest)

print(f"\nReplaced BAR_REVENUE_MAP in functions/data/bar.ts")
print(f"Lines: {len(new_dest.splitlines())}")
