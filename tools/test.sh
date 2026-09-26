#!/usr/bin/env bash
# Full site test: Playwright screenshots + interactions (mobile/desktop), reduced motion, link check.
# Usage: tools/test.sh [--external]   (external link checks are slow; off by default)
set -uo pipefail
cd "$(dirname "$0")"
port=8123
if ! curl -s -o /dev/null "http://localhost:$port/"; then
  (python3 serve.py $port >/dev/null 2>&1 &)
  for _ in $(seq 20); do curl -s -o /dev/null "http://localhost:$port/" && break; sleep 0.2; done
fi
[ -d node_modules/playwright ] || npm install --silent
fail=0
node -e "global.window={};require('../data/projects.js')" || { echo "data/projects.js does not parse"; exit 1; }
for f in ../js/*.js; do node --check "$f" || fail=1; done
node shoot.mjs --out ../screenshots --interact || fail=1
node shoot.mjs --out ../screenshots --reduced --only mobile || fail=1
node perf.mjs || fail=1
python3 - <<'PY' || fail=1
import sys
try:
    import zxingcpp
    from PIL import Image
except ImportError:
    print("barcode: zxing-cpp not installed, skipping (pip install --user zxing-cpp)"); sys.exit(0)
ok = True
for tag in ("mobile", "desktop"):
    r = zxingcpp.read_barcodes(Image.open(f"../screenshots/{tag}-barcode.png"))
    text = r[0].text if r else None
    print(f"barcode [{tag}]: {text}")
    ok &= text == "github.com/Yadunund"
sys.exit(0 if ok else 1)
PY
if [[ "${1:-}" == "--external" ]]; then node check.mjs || fail=1; else node check.mjs --skip-external || fail=1; fi
exit $fail
