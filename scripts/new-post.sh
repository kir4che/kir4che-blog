#!/usr/bin/env bash
set -euo pipefail

derive_slug() {
  echo "$1" \
    | sed 's/[^a-zA-Z0-9 ]//g' \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/  */ /g' \
    | sed 's/^ *//;s/ *$//' \
    | sed 's/ /-/g'
}

if [[ $# -gt 0 ]]; then
  # CLI mode: pnpm new-post "Title" [slug] [--lang en]
  TITLE="$1"
  SLUG=""
  LANG="tw"
  shift
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --lang) LANG="${2:?}"; shift 2 ;;
      *)
        if [[ -z "$SLUG" ]]; then SLUG="$1"; shift
        else echo "Usage: pnpm new-post <title> [slug] [--lang en]"; exit 1
        fi ;;
    esac
  done
  if [[ -z "$SLUG" ]]; then
    SLUG=$(derive_slug "$TITLE")
    if [[ -z "$SLUG" ]]; then echo "Error: non-Latin title needs explicit slug"; exit 1; fi
  fi
else
  # Interactive mode
  echo ""
  read -r -p "📝 Title: " TITLE
  if [[ -z "$TITLE" ]]; then echo "Title required"; exit 1; fi

  DEFAULT_SLUG=$(derive_slug "$TITLE")
  SLUG_PROMPT="🔗 Slug"
  [[ -n "$DEFAULT_SLUG" ]] && SLUG_PROMPT+=" (Enter= $DEFAULT_SLUG)"
  SLUG_PROMPT+=": "
  read -r -p "$SLUG_PROMPT" SLUG
  if [[ -z "$SLUG" ]]; then
    if [[ -z "$DEFAULT_SLUG" ]]; then
      read -r -p "🔗 Slug (required for non-Latin title): " SLUG
      if [[ -z "$SLUG" ]]; then echo "Slug required"; exit 1; fi
    else
      SLUG="$DEFAULT_SLUG"
    fi
  fi

  LANG="tw"
fi

if [[ "$LANG" != "tw" && "$LANG" != "en" ]]; then
  echo "Error: lang must be 'tw' or 'en'"; exit 1
fi

DIR="src/content/blog/$LANG"
FILE="$DIR/$SLUG.mdx"

if [[ -f "$FILE" ]]; then
  echo "Error: $FILE already exists"; exit 1
fi

DATE=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")

cat > "$FILE" <<EOF
---
title: $TITLE
description: ''
date: '$DATE'
tags: []
categories: []
draft: true
---

EOF

echo ""
echo "Created: $FILE"
