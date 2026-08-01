from pathlib import Path
import re,csv,hashlib,os
from collections import defaultdict
ROOT=Path(__file__).resolve().parents[1]
SPEC=ROOT/'docs/specyfikacja-docelowa'
REG=ROOT/'rejestry'; REG.mkdir(exist_ok=True)
md=sorted(SPEC.rglob('*.md'))

def sha(p):
    h=hashlib.sha256(); h.update(p.read_bytes()); return h.hexdigest()
def write(name,header,rows):
    with (REG/name).open('w',encoding='utf-8',newline='') as f:
        w=csv.writer(f); w.writerow(header); w.writerows(rows)
routes=[]; ops=defaultdict(set); caps=defaultdict(set); stories=[]; events=defaultdict(set); entities=defaultdict(set); documents=[]
route_re=re.compile(r'(?:Route docelowy|Route aplikacji|Route|route)\s*:?\s*`([^`]+)`',re.I)
dotted_re=re.compile(r'`([a-z][a-zA-Z0-9_-]*(?:\.[a-zA-Z0-9_-]+){1,5})`')
event_re=re.compile(r'\b([a-z][a-z0-9]+(?:_[a-z0-9]+){1,8})\b')
for p in md:
    rel=str(p.relative_to(SPEC)).replace('\\','/')
    t=p.read_text('utf-8',errors='replace')
    title=next((x[2:].strip() for x in t.splitlines() if x.startswith('# ')),p.stem)
    words=len(re.findall(r'\b[\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]+\b',re.sub(r'```.*?```',' ',t,flags=re.S)))
    documents.append([rel,title,words,sha(p)])
    for m in route_re.finditer(t):
        val=m.group(1).strip()
        if val.startswith('/'): routes.append([val,rel,title,'target' if 'docelowy' in t.lower() else 'reference'])
    in_ops=False
    for line in t.splitlines():
        low=line.lower()
        if line.startswith('## '): in_ops=any(x in low for x in ['operacje','api','capabilit','uprawnienia'])
        tokens=dotted_re.findall(line)
        for tok in tokens:
            seg=tok.split('.')
            action=seg[-1].lower()
            cap_context=('capabilit' in low or 'uprawnien' in low or 'wymagane minimum' in low or 'wymaga capability' in low)
            op_context=(in_ops and ('operation' in low or 'query' in low or 'command' in low or len(seg)>=3)) or '/25-kontrakty-' in '/'+rel
            if len(seg)>=3 or op_context:
                ops[tok].add(rel)
            elif cap_context or action in {'read','write','manage','admin','export','approve','execute','security','billing','support','invite','delete','update','create'}:
                caps[tok].add(rel)
            else:
                ops[tok].add(rel)
        if any(x in low for x in ['title:','planned story:','story:']):
            for x in re.findall(r'`([^`]+/[^`]+)`',line):
                if not x.startswith('/'):
                    status='implemented' if 'potwierdz' in low and 'nie potwierdz' not in low else 'planned'
                    stories.append([x,rel,status])
    for ev in event_re.findall(t):
        if any(ev.endswith('_'+s) or ('_'+s+'_') in ev for s in ['viewed','opened','clicked','changed','started','completed','failed','reached','selected','downloaded','submitted','created','updated','approved','rejected','revoked','expired','retried']):
            events[ev].add(rel)
    for m in re.finditer(r'Główne encje:\s*([^\n]+)',t):
        for e in re.split(r'[,;]',m.group(1)):
            e=e.strip(' .')
            if e: entities[e].add(rel)

# Canonical route ownership.
groups=defaultdict(list)
for r in routes: groups[r[0]].append(r)
rout=[]
for route,arr in sorted(groups.items()):
    def score(r):
        rel=r[1]
        return (0 if '/katalogi/' in '/'+rel else 1,1 if 'powierzchnie-auth' in rel or rel[:2].isdigit() else 0,len(rel))
    owner=max(arr,key=score)
    for r in arr: rout.append(r+['canonical' if r is owner else 'reference'])
write('routes.csv',['route','document','title','status','ownership'],rout)
write('api-operations.csv',['operation_id','used_by_count','documents'],[[k,len(v),' | '.join(sorted(v))] for k,v in sorted(ops.items())])
write('capabilities.csv',['capability','used_by_count','documents'],[[k,len(v),' | '.join(sorted(v))] for k,v in sorted(caps.items())])
write('storybook.csv',['story_title','document','status'],sorted(set(tuple(x) for x in stories)))
write('events.csv',['event','used_by_count','documents'],[[k,len(v),' | '.join(sorted(v))] for k,v in sorted(events.items())])
write('documents.csv',['path','title','words','sha256'],documents)
write('entities.csv',['entity','used_by_count','documents'],[[k,len(v),' | '.join(sorted(v))] for k,v in sorted(entities.items())])
print('documents',len(documents),'routes',len(rout),'operations',len(ops),'capabilities',len(caps),'stories',len(set(tuple(x) for x in stories)),'events',len(events),'entities',len(entities))
