import { spawnSync } from 'node:child_process';
const root = process.argv[2] || '.';
const result = spawnSync('python3', ['scripts/validate_all.py', root], { stdio: 'inherit' });
process.exit(result.status ?? 1);
