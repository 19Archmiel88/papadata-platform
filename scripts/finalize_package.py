#!/usr/bin/env python3
from pathlib import Path
import json, hashlib
import subprocess

ROOT = Path(__file__).resolve().parents[1]
AUTHOR = "Artur Wiśniewski"
VERSION = "1.0"

IGNORED_DIRS = {
    '.git', '.hg', '.svn', '.idea', '.vscode', '__pycache__',
    'node_modules', 'dist', 'build', 'coverage', '.next', '.turbo',
    'storybook-static', '.runtime',
}
IGNORED_SUFFIXES = {
    '.png', '.jpg', '.jpeg', '.webp', '.pdf', '.zip', '.pyc',
    '.key', '.pem', '.crt', '.csr', '.srl',
}
IGNORED_FILES = {'MANIFEST.json', 'SHA256SUMS.txt', '.env.production-parity'}


def sha_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b''):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    validation = subprocess.run(
        ['python3', str(ROOT / 'scripts' / 'validate_all.py'), str(ROOT)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    print(validation.stdout)
    if validation.returncode != 0:
        print(validation.stderr)
        return validation.returncode

    files = []
    for path in sorted(ROOT.rglob('*')):
        if not path.is_file():
            continue
        relative = path.relative_to(ROOT)
        if any(part in IGNORED_DIRS for part in relative.parts):
            continue
        if path.name in IGNORED_FILES or path.suffix.lower() in IGNORED_SUFFIXES:
            continue
        files.append({
            'path': str(path.relative_to(ROOT)).replace('\\\\', '/'),
            'bytes': path.stat().st_size,
            'sha256': sha_file(path),
        })

    manifest = {
        'version': VERSION,
        'author': AUTHOR,
        'creator': AUTHOR,
        'owner': AUTHOR,
        'status': 'PASS',
        'file_count': len(files),
        'files': files,
    }
    (ROOT / 'MANIFEST.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
    (ROOT / 'SHA256SUMS.txt').write_text('\n'.join(f"{item['sha256']}  {item['path']}" for item in files) + '\n', encoding='utf-8')
    print(json.dumps({'version': VERSION, 'author': AUTHOR, 'status': 'PASS', 'file_count': len(files)}, ensure_ascii=False, indent=2))
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
