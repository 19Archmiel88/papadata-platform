#!/usr/bin/env python3
from pathlib import Path
import json,re,csv,hashlib
ROOT=Path(__file__).resolve().parents[1];SPEC=ROOT/'docs/specyfikacja-docelowa'
def words(t):return len(re.findall(r'[\wąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+',t,re.U))
def readcsv(p):
 with p.open(encoding='utf-8',newline='') as f:return list(csv.DictReader(f))
def normalized(t):
 t=re.sub(r'^---.*?---','',t,flags=re.S);t=re.sub(r'`[^`]+`','`x`',t);t=re.sub(r'\b\d+\b','0',t);return re.sub(r'\s+',' ',t.lower()).strip()
docs=sorted(SPEC.rglob('*.md'));texts=[p.read_text(encoding='utf-8',errors='ignore') for p in docs]
hashes=[hashlib.sha256(normalized(t).encode()).hexdigest() for t in texts]
metrics={'version':'1.0','markdown_documents':len(docs),'markdown_total':len(list(ROOT.rglob('*.md'))),'words':sum(words(t) for t in texts),'auth_surfaces':len(readcsv(ROOT/'macierze/auth-fsm-transitions.csv')),'canonical_components':len(readcsv(ROOT/'rejestry/component-contracts.csv')),'e2e_flows':len({r['flow_id'] for r in readcsv(ROOT/'macierze/e2e-step-bindings.csv')}),'e2e_steps':len(readcsv(ROOT/'macierze/e2e-step-bindings.csv')),'api_operations':len(readcsv(ROOT/'rejestry/api-operations.csv')),'api_schemas':len(readcsv(ROOT/'rejestry/api-schemas.csv')),'storybook_targets':len(readcsv(ROOT/'rejestry/storybook.csv')),'exact_normalized_duplicates':len(hashes)-len(set(hashes))}
print(json.dumps(metrics,ensure_ascii=False,indent=2))
