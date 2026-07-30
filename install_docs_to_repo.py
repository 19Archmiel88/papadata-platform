#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import argparse, datetime, json, shutil, subprocess, sys, tempfile
MAPPINGS=['docs/specyfikacja-docelowa','rejestry','macierze','contracts','scripts','tools','fixtures','config','tsconfig.contracts.json']
def fail(message): print(f'ERROR: {message}',file=sys.stderr); return 2
def run(root:Path,repo:Path,mode:str)->int:
    if not repo.exists() or not (repo/'.git').exists(): return fail(f'Nieprawidłowe repozytorium Git: {repo}')
    if mode=='dry-run':
        print(json.dumps({'mode':'dry-run','source':str(root),'repo':str(repo),'mappings':MAPPINGS},ensure_ascii=False,indent=2)); return 0
    backup_root=repo/'.papadata-docs-backups'; backup_root.mkdir(exist_ok=True)
    if mode=='rollback':
        backups=sorted([p for p in backup_root.iterdir() if p.is_dir()])
        if not backups:return fail('Brak backupu do rollbacku')
        backup=backups[-1]
        meta=json.loads((backup/'backup.json').read_text(encoding='utf-8'))
        for rel in MAPPINGS:
            target=repo/rel; saved=backup/rel
            if target.is_dir(): shutil.rmtree(target)
            elif target.exists(): target.unlink()
            if saved.is_dir(): shutil.copytree(saved,target)
            elif saved.exists(): target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(saved,target)
        print(f'Rollback z {backup} zakończony'); return 0
    stamp=datetime.datetime.now().strftime('%Y%m%d-%H%M%S'); backup=backup_root/stamp; backup.mkdir()
    try:
        status=subprocess.run(['git','-C',str(repo),'status','--porcelain'],capture_output=True,text=True,check=True).stdout
        (backup/'git-status.txt').write_text(status,encoding='utf-8')
        for rel in MAPPINGS:
            target=repo/rel; saved=backup/rel
            if target.is_dir(): saved.parent.mkdir(parents=True,exist_ok=True);shutil.copytree(target,saved)
            elif target.exists(): saved.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(target,saved)
        (backup/'backup.json').write_text(json.dumps({'mappings':MAPPINGS},indent=2),encoding='utf-8')
        stage=Path(tempfile.mkdtemp(prefix='papadata-docs-',dir=str(repo.parent)))
        for rel in MAPPINGS:
            src=root/rel; dst=stage/rel
            if src.is_dir(): dst.parent.mkdir(parents=True,exist_ok=True);shutil.copytree(src,dst)
            elif src.exists(): dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(src,dst)
        for rel in MAPPINGS:
            target=repo/rel; staged=stage/rel
            if target.is_dir(): shutil.rmtree(target)
            elif target.exists(): target.unlink()
            if staged.is_dir(): target.parent.mkdir(parents=True,exist_ok=True);shutil.move(str(staged),str(target))
            elif staged.exists(): target.parent.mkdir(parents=True,exist_ok=True);shutil.move(str(staged),str(target))
        shutil.rmtree(stage,ignore_errors=True)
        print(f'Instalacja zakończona. Backup: {backup}'); return 0
    except Exception as exc:
        print(f'ERROR podczas instalacji: {exc}; przywracanie backupu',file=sys.stderr)
        for rel in MAPPINGS:
            target=repo/rel; saved=backup/rel
            if target.is_dir(): shutil.rmtree(target)
            elif target.exists(): target.unlink()
            if saved.is_dir(): target.parent.mkdir(parents=True,exist_ok=True);shutil.copytree(saved,target)
            elif saved.exists(): target.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(saved,target)
        return 3
def main():
    ap=argparse.ArgumentParser();ap.add_argument('repo');ap.add_argument('mode',choices=['dry-run','apply','rollback']);a=ap.parse_args();root=Path(__file__).resolve().parent;sys.exit(run(root,Path(a.repo).resolve(),a.mode))
if __name__=='__main__':main()
