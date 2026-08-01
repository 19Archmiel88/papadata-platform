#!/usr/bin/env python3
import subprocess, sys
cmd=[sys.executable, 'scripts/validate_all.py', sys.argv[1] if len(sys.argv)>1 else '.']
raise SystemExit(subprocess.call(cmd))
