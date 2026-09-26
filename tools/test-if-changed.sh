#!/usr/bin/env bash
# Stop hook: run tools/test.sh when site files changed since the last passing run.
cd "$(dirname "$0")/.."
input="$(cat)"
state="$( (git ls-files -z -co --exclude-standard | grep -zv -e '^screenshots/' -e '^tools/node_modules/' | xargs -0 cat 2>/dev/null) | sha1sum | cut -d' ' -f1)"
[ "$(cat .last-test 2>/dev/null)" = "$state" ] && exit 0
if out="$(tools/test.sh 2>&1)"; then
  echo "$state" > .last-test
  exit 0
fi
if echo "$input" | grep -q '"stop_hook_active":\s*true'; then
  echo "Site tests still failing:" >&2; echo "$out" | tail -30 >&2; exit 0
fi
echo "Site tests failed after your changes. Fix before finishing:" >&2
echo "$out" | tail -30 >&2
exit 2
