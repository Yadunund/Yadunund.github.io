#!/usr/bin/env bash
# Usage:
#   tools/media.sh <dest-dir> <url-or-file>...   download (if URL) and web-optimize into media/<dest-dir>/
#   GIF/MP4/MOV/WEBM -> H.264 MP4 (<=960px, 24fps, no audio) + JPG poster
#   PNG/JPG/WEBP     -> JPG (<=1400px); PNGs with transparency stay PNG (<=640px)
set -euo pipefail
root="$(cd "$(dirname "$0")/.." && pwd)"
dest="$root/media/$1"; shift
mkdir -p "$dest"

for src in "$@"; do
  name="$(basename "${src%%\?*}")"
  tmp="$dest/.$name"
  if [[ "$src" =~ ^https?:// ]]; then curl -sfL "$src" -o "$tmp"; else cp "$src" "$tmp"; fi
  base="$dest/${name%.*}"
  if [[ -e "$base.mp4" && ! "${name##*.}" =~ ^(gif|GIF|mp4|MP4|mov|MOV|webm|WEBM)$ ]]; then base="$base-still"; fi
  case "${name##*.}" in
    gif|GIF|mp4|MP4|mov|MOV|webm|WEBM)
      ffmpeg -loglevel error -y -i "$tmp" -vf "scale='min(960,iw)':-2:flags=lanczos,fps=24,format=yuv420p" \
        -c:v libx264 -crf 28 -preset slow -movflags +faststart -an "$base.mp4"
      ffmpeg -loglevel error -y -i "$base.mp4" -vf "select=eq(n\,12)" -frames:v 1 -q:v 4 "$base.jpg"
      echo "video  ${base#$root/}.mp4 ($(du -h "$base.mp4" | cut -f1)) + poster .jpg" ;;
    png|PNG)
      if [[ "$(ffprobe -v error -select_streams v:0 -show_entries stream=pix_fmt -of csv=p=0 "$tmp")" == *a* ]]; then
        ffmpeg -loglevel error -y -i "$tmp" -vf "scale='min(640,iw)':-2" -compression_level 9 "$base.png"
        echo "image  ${base#$root/}.png (alpha kept)"
      else
        ffmpeg -loglevel error -y -i "$tmp" -vf "scale='min(1400,iw)':-2" -q:v 4 "$base.jpg"
        echo "image  ${base#$root/}.jpg ($(du -h "$base.jpg" | cut -f1))"
      fi ;;
    *)
      ffmpeg -loglevel error -y -i "$tmp" -vf "scale='min(1400,iw)':-2" -q:v 4 "$base.jpg"
      echo "image  ${base#$root/}.jpg ($(du -h "$base.jpg" | cut -f1))" ;;
  esac
  rm -f "$tmp"
done
