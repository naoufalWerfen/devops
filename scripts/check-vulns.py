import json, sys
data = json.load(sys.stdin)
found = [d for d in data if d.get('osv_count', 0) > 0]
print(f"Total checked: {len(data)}, Con vulnerabilidades: {len(found)}")
for d in found[:20]:
    print(f"  {d['product']}@{d['version']}: {d['osv_count']} vulns (C:{d['osv_critical']} H:{d['osv_high']} M:{d['osv_medium']} L:{d['osv_low']})")
