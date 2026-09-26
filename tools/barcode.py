#!/usr/bin/env python3
"""Write a Code 128 (set B) SVG. Usage: tools/barcode.py <text> <out.svg>"""
import sys

PATTERNS = """212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222
123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121
111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331
231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421
141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212
124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131
311141 411131 211412 211214 211232 2331112""".split()
START_B, STOP = 104, 106

text, out = sys.argv[1], sys.argv[2]
codes = [START_B] + [ord(c) - 32 for c in text]
codes.append(sum(c * (i or 1) for i, c in enumerate(codes)) % 103)
codes.append(STOP)
widths = "".join(PATTERNS[c] for c in codes)

quiet, x, bars = 10, 10, []
for i, w in enumerate(map(int, widths)):
    if i % 2 == 0:
        bars.append(f'<rect x="{x}" width="{w}" height="40"/>')
    x += w
total = x + quiet
open(out, "w").write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {total} 40" width="{total}" height="40" '
    f'shape-rendering="crispEdges" role="img" aria-label="Barcode: {text}">'
    f'<rect width="{total}" height="40" fill="#fff"/><g fill="#0b0b0b">{"".join(bars)}</g></svg>\n'
)
print(f"{text}: {len(codes)} symbols, {total} modules wide")
