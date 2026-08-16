#!/usr/bin/env bash

PROJECT="${PROJECT:-/home/papadata/papadata-platform}"
STAMP="$(date +%Y%m%d-%H%M%S)"
PACKAGE="papadata-audit-source-package-$STAMP"
PROJECT_PARENT="$(dirname "$PROJECT")"
PROJECT_NAME="$(basename "$PROJECT")"
WIN_USER="$(cmd.exe /c echo %USERNAME% 2>/dev/null | tr -d '\r')"
DESKTOP="/mnt/c/Users/$WIN_USER/Desktop"
ZIP_PATH="/tmp/$PACKAGE.zip"
MANIFEST_DIR="/tmp/$PACKAGE-manifest"

printf '\n========================================\n'
printf ' PapaData - AUDIT SOURCE PACKAGE\n'
printf '========================================\n\n'

if [ ! -d "$PROJECT" ]; then
  printf 'BŁĄD: Nie znaleziono projektu:\n%s\n' "$PROJECT"
else
  cd "$PROJECT" || printf 'Nie udało się wejść do projektu.\n'

  printf 'Projekt:\n%s\n\n' "$PROJECT"
  printf 'Branch:\n'
  git branch --show-current 2>/dev/null
  printf '\nHEAD:\n'
  git rev-parse HEAD 2>/dev/null
  printf '\nGit status:\n'
  git status --short 2>/dev/null
  printf '\nRozmiar projektu przed pakowaniem:\n'
  du -sh "$PROJECT" 2>/dev/null
  printf '\nNajwiększe katalogi:\n'
  du -h -d 2 "$PROJECT" 2>/dev/null | sort -hr | head -n 30
  printf '\n'

  rm -f "$ZIP_PATH"
  rm -rf "$MANIFEST_DIR"
  mkdir -p "$MANIFEST_DIR"

  {
    printf '# PapaData audit source package\n\n'
    printf 'Data: %s\n' "$(date)"
    printf 'Projekt: %s\n' "$PROJECT"
    printf 'Branch: %s\n' "$(git branch --show-current 2>/dev/null)"
    printf 'HEAD: %s\n\n' "$(git rev-parse HEAD 2>/dev/null)"
    printf '## Git status\n'
    git status --short 2>/dev/null
    printf '\n## Wykluczone elementy\n'
    printf -- '- node_modules, .git, cache, buildy i raporty runtime\n'
    printf -- '- .env.production-parity, .runtime, lokalne sekrety i certyfikaty\n'
    printf -- '- *.key, *.crt, *.csr, *.srl\n\n'
    printf '## Uzasadnienie\n'
    printf 'Paczka audytowa pomija elementy odtwarzalne oraz poufne ze względu na limit uploadu i bezpieczeństwo.\n'
  } > "$MANIFEST_DIR/AUDIT_PACKAGE_MANIFEST.md"

  printf '========================================\n'
  printf ' Pakowanie audytowej paczki źródłowej\n'
  printf '========================================\n\n'

  cd "$PROJECT_PARENT" || printf 'Nie udało się wejść do katalogu nadrzędnego.\n'

  zip -qr \
    "$ZIP_PATH" \
    "$PROJECT_NAME" \
    -x "$PROJECT_NAME/node_modules/*" \
    -x "$PROJECT_NAME/**/node_modules/*" \
    -x "$PROJECT_NAME/.git/*" \
    -x "$PROJECT_NAME/.runtime/*" \
    -x "$PROJECT_NAME/**/.runtime/*" \
    -x "$PROJECT_NAME/.env.production-parity" \
    -x "$PROJECT_NAME/**/.env.production-parity" \
    -x "$PROJECT_NAME/*.key" \
    -x "$PROJECT_NAME/**/*.key" \
    -x "$PROJECT_NAME/*.crt" \
    -x "$PROJECT_NAME/**/*.crt" \
    -x "$PROJECT_NAME/*.csr" \
    -x "$PROJECT_NAME/**/*.csr" \
    -x "$PROJECT_NAME/*.srl" \
    -x "$PROJECT_NAME/**/*.srl" \
    -x "$PROJECT_NAME/.next/*" \
    -x "$PROJECT_NAME/**/.next/*" \
    -x "$PROJECT_NAME/dist/*" \
    -x "$PROJECT_NAME/**/dist/*" \
    -x "$PROJECT_NAME/build/*" \
    -x "$PROJECT_NAME/**/build/*" \
    -x "$PROJECT_NAME/coverage/*" \
    -x "$PROJECT_NAME/**/coverage/*" \
    -x "$PROJECT_NAME/.turbo/*" \
    -x "$PROJECT_NAME/**/.turbo/*" \
    -x "$PROJECT_NAME/.cache/*" \
    -x "$PROJECT_NAME/**/.cache/*" \
    -x "$PROJECT_NAME/playwright-report/*" \
    -x "$PROJECT_NAME/**/playwright-report/*" \
    -x "$PROJECT_NAME/test-results/*" \
    -x "$PROJECT_NAME/**/test-results/*" \
    -x "$PROJECT_NAME/storybook-static/*" \
    -x "$PROJECT_NAME/**/storybook-static/*" \
    -x "$PROJECT_NAME/*.zip" \
    -x "$PROJECT_NAME/**/*.zip" \
    -x "$PROJECT_NAME/*.tar" \
    -x "$PROJECT_NAME/**/*.tar" \
    -x "$PROJECT_NAME/*.tar.gz" \
    -x "$PROJECT_NAME/**/*.tar.gz"

  cd /tmp || printf 'Nie udało się wejść do /tmp.\n'
  zip -qr "$ZIP_PATH" "$PACKAGE-manifest"

  printf '\n========================================\n'
  printf ' Test integralności ZIP\n'
  printf '========================================\n\n'
  unzip -t "$ZIP_PATH" | tail -n 5

  printf '\n========================================\n'
  printf ' Kopiowanie na Pulpit Windows\n'
  printf '========================================\n\n'

  if [ -d "$DESKTOP" ]; then
    cp "$ZIP_PATH" "$DESKTOP/$PACKAGE.zip"
    if [ -f "$DESKTOP/$PACKAGE.zip" ]; then
      printf '\nZIP:\n%s\n\n' "$DESKTOP/$PACKAGE.zip"
      printf 'Rozmiar:\n'
      ls -lh "$DESKTOP/$PACKAGE.zip"
      printf '\nLiczba plików w ZIP:\n'
      unzip -l "$DESKTOP/$PACKAGE.zip" | tail -n 1
      printf '\nPaczka audytowa nie zawiera zależności, cache, buildów, runtime secrets ani certyfikatów.\n'
    else
      printf 'BŁĄD: Nie udało się skopiować ZIP na Pulpit.\n'
    fi
  else
    printf 'Nie znaleziono Pulpitu Windows:\n%s\n\n' "$DESKTOP"
    printf 'ZIP znajduje się tutaj:\n%s\n' "$ZIP_PATH"
  fi

  rm -rf "$MANIFEST_DIR"
fi
