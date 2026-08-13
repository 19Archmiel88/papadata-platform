#!/usr/bin/env python3
from __future__ import annotations
from pathlib import Path
import argparse,csv,hashlib,json,re,subprocess,sys,tempfile,shutil,urllib.parse,os
from collections import Counter,defaultdict

IGNORED_DIRS={
 '.git',
 '.hg',
 '.svn',
 '.idea',
 '.vscode',
 '__pycache__',
 'node_modules',
 'dist',
 'build',
 'coverage',
 '.next',
 '.turbo',
 'storybook-static',
}
IGNORED_SUFFIXES={'.png','.jpg','.jpeg','.webp','.pdf','.zip','.pyc'}
IGNORED_FILES={'MANIFEST.json','SHA256SUMS.txt'}
IGNORED_BACKUP_PATTERNS=(
 re.compile(r'.*~$'),
 re.compile(r'.*\.bak\d*$',re.I),
 re.compile(r'.*\.backup$',re.I),
 re.compile(r'.*\.orig$',re.I),
 re.compile(r'.*\.rej$',re.I),
)

def read_csv(p):
 with p.open(encoding='utf-8',newline='') as f:return [{k:(v or '') for k,v in r.items()} for r in csv.DictReader(f)]
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  for c in iter(lambda:f.read(1024*1024),b''):h.update(c)
 return h.hexdigest()
def norm(s):
 s=re.sub(r'`[^`]+`','`x`',s.lower());s=re.sub(r'\b\d+\b','0',s);return re.sub(r'\s+',' ',s).strip()
def frontmatter(text):
 if not text.startswith('---\n'):return {}
 e=text.find('\n---',4)
 if e<0:return {}
 out={}
 for line in text[4:e].splitlines():
  if ':' in line:
   k,v=line.split(':',1);out[k.strip()]=v.strip()
 return out
def resolve_ref(doc,ref):
 if not ref.startswith('#/'):return True
 cur=doc
 for part in ref[2:].split('/'):
  part=part.replace('~1','/').replace('~0','~')
  if not isinstance(cur,dict) or part not in cur:return False
  cur=cur[part]
 return True
def is_ignored_path(p:Path,root:Path):
 try:rel=p.relative_to(root)
 except ValueError:return True
 if any(part in IGNORED_DIRS for part in rel.parts):return True
 if p.name in IGNORED_FILES:return True
 if p.suffix.lower() in IGNORED_SUFFIXES:return True
 return any(pat.match(p.name) for pat in IGNORED_BACKUP_PATTERNS)
def iter_repo_files(root:Path):
 for current, dirs, files in os.walk(root):
  current_path=Path(current)
  try:rel=current_path.relative_to(root)
  except ValueError:continue
  dirs[:]=[d for d in dirs if d not in IGNORED_DIRS]
  if any(part in IGNORED_DIRS for part in rel.parts):
   dirs[:]=[]
   continue
  for name in files:
   p=current_path/name
   if is_ignored_path(p,root):continue
   yield p
def iter_manifest_scope_files(root:Path,manifest_paths:set[str]):
 roots={p.split('/',1)[0] for p in manifest_paths}
 for p in iter_repo_files(root):
  rel=str(p.relative_to(root))
  if rel.split('/',1)[0] not in roots:continue
  yield p

def validate(root:Path):
 errors=[];warnings=[];checks={}
 def err(code,msg):errors.append({'code':code,'message':msg})
 def warn(code,msg):warnings.append({'code':code,'message':msg})
 in_git_repo=(root/'.git').exists()
 spec=root/'docs/specyfikacja-docelowa';docs=sorted(spec.rglob('*.md'))
 checks['spec_documents']=len(docs)
 # metadata and links
 broken=[]
 for p in docs:
  text=p.read_text(encoding='utf-8',errors='ignore');fm=frontmatter(text)
  for k in ['version','author','creator','owner','status']:
   if not fm.get(k):err('DOC_METADATA',f'{p.relative_to(root)}: brak {k}')
  for k in ['author','creator','owner']:
   if fm.get(k)!='Artur Wiśniewski':err('DOC_OWNER',f'{p.relative_to(root)}: {k}={fm.get(k)}')
  if fm.get('version')!='1.0':err('DOC_VERSION',f'{p.relative_to(root)}: version={fm.get("version")}')
  if not re.search(r'^#\s+\S',text,re.M):err('DOC_H1',f'{p.relative_to(root)}: brak H1')
  for href in re.findall(r'\[[^\]]+\]\(([^)]+)\)',text):
   target=href.strip().split('#')[0]
   if not target or re.match(r'^[A-Za-z][A-Za-z0-9+.-]*:',target) or target.startswith('mailto:'):continue
   t=(p.parent/urllib.parse.unquote(target)).resolve()
   try:t.relative_to(root.resolve())
   except ValueError:continue
   if not t.exists():broken.append((str(p.relative_to(root)),target))
 if broken:err('BROKEN_LINKS',f'{len(broken)} niedziałających linków; przykłady {broken[:5]}')
 checks['broken_links']=len(broken)
 # route target/runtime split
 routes=read_csv(root/'rejestry/routes.csv')
 required_route_fields={'route','document','title','status','ownership','runtime_status','runtime_source','storybook_screen_status'}
 runtime_routes=set()
 for r in routes:
  missing=required_route_fields-set(r)
  if missing:err('ROUTE_FIELDS',f"{r.get('route','<unknown>')}: {sorted(missing)}")
  if r.get('status')=='target':
   if r.get('ownership')!='target-canonical':err('ROUTE_TARGET_OWNERSHIP',r.get('route',''))
   if r.get('runtime_status')!='not_started':err('ROUTE_TARGET_RUNTIME_STATUS',r.get('route',''))
   if r.get('runtime_source'):err('ROUTE_TARGET_RUNTIME_SOURCE',r.get('route',''))
  if r.get('status')=='implemented':
   if r.get('ownership')!='runtime-implemented':err('ROUTE_RUNTIME_OWNERSHIP',r.get('route',''))
   if r.get('runtime_status')!='implemented':err('ROUTE_RUNTIME_STATUS',r.get('route',''))
   if not r.get('runtime_source'):err('ROUTE_RUNTIME_SOURCE',r.get('route',''))
   runtime_routes.add(r.get('route',''))
  if r.get('ownership')=='canonical-runtime' and r.get('runtime_status')!='implemented':err('ROUTE_FALSE_RUNTIME',r.get('route',''))
 for route in ['/login','/register','/app','/app/command-center']:
  if route not in runtime_routes:err('ROUTE_RUNTIME_MISSING',route)
 checks['runtime_routes']=len(runtime_routes)
 # clean-package boundary
 forbidden_patterns={
  'PROVENANCE_METADATA':r'(?i)source_' + r'refs?:|\bS' + r'RC-[A-Z0-9-]+',
  'ARCHIVE_REFERENCE':r'(?i)zrodla-i-' + r'dowody|paczki-' + r'wejsciowe|s' + r't\.zip|A' + r'GENTS\.md',
  'AUDIT_APPENDIX':r'(?i)Źródła i ' + r'dowody 1\.0 po audycie|Zasada zachowania pakietu ' + r'źródłowego',
  'REGISTRY_REFERENCE':r'(?i)source-' + r'registry|source-' + r'traceability|REPO-' + r'BASELINE|remote' + r'Sha|Baseline ' + r'SHA',
 }
 for p in iter_repo_files(root):
  text=p.read_text(encoding='utf-8',errors='ignore')
  for code,pat in forbidden_patterns.items():
   if re.search(pat,text):err(code,str(p.relative_to(root)))
 checks['provenance_references']=0
 # registry and matrix document links
 missing_registry_refs=[]
 for cp in list((root/'rejestry').glob('*.csv'))+list((root/'macierze').glob('*.csv')):
  for row_no,row in enumerate(read_csv(cp),2):
   for value in row.values():
    for token in re.findall(r'(?<![\w.-])([0-9A-Za-ząćęłńóśźżĄĆĘŁŃÓŚŹŻ_./-]+\.md)',value):
     target=(root/token) if token.startswith('docs/specyfikacja-docelowa/') else (spec/token)
     if not target.exists():missing_registry_refs.append((str(cp.relative_to(root)),row_no,token))
 if missing_registry_refs:err('REGISTRY_DOC_LINKS',f'{len(missing_registry_refs)} missing; examples {missing_registry_refs[:8]}')
 checks['registry_document_references']=len(missing_registry_refs)
 # API registry and OpenAPI
 ops=read_csv(root/'rejestry/api-operations.csv');opmap={r['operation_id']:r for r in ops}
 if len(opmap)!=len(ops):err('API_DUP_OPERATION','duplicate operationId')
 schemas=read_csv(root/'rejestry/api-schemas.csv');schema_names={r['schema_name'] for r in schemas}
 api_json=json.loads((root/'contracts/api-schemas.json').read_text(encoding='utf-8'))['schemas']
 for r in ops:
  for k in ['request_schema','response_schema']:
   if r[k] not in schema_names or r[k] not in api_json:err('API_SCHEMA_MISSING',f"{r['operation_id']} {r[k]}")
  for suffix in ['request','response']:
   p=root/f"fixtures/api/{r['operation_id']}.{suffix}.json"
   if not p.exists():err('API_FIXTURE_MISSING',str(p.relative_to(root)))
 # unique data shape check
 data_schemas={k:v for k,v in api_json.items() if k.endswith('Data')}
 signatures={json.dumps(v,sort_keys=True,ensure_ascii=False) for v in data_schemas.values()}
 if len(signatures)<max(100,int(len(ops)*0.7)):err('API_GENERIC_DTO',f'{len(signatures)} unikalnych data shapes dla {len(ops)} operacji')
 oas=json.loads((root/'contracts/openapi-1.0.json').read_text(encoding='utf-8'))
 badrefs=[]
 def walk(x,path=''):
  if isinstance(x,dict):
   for k,v in x.items():
    if k=='$ref' and isinstance(v,str) and not resolve_ref(oas,v):badrefs.append((path,v))
    walk(v,path+'/'+k)
  elif isinstance(x,list):
   for i,v in enumerate(x):walk(v,path+'/'+str(i))
 walk(oas)
 if badrefs:err('OPENAPI_REF',f'{len(badrefs)} refs')
 oas_ops=[]
 for path,item in oas.get('paths',{}).items():
  for method,o in item.items():
   if method not in {'get','post','put','patch','delete'}:continue
   oas_ops.append(o.get('operationId'))
   if method=='get' and 'requestBody' in o:err('OPENAPI_GET_BODY',o.get('operationId',''))
   for status in ['400','401','403','404','409','422','429','500','503']:
    if status not in o.get('responses',{}):err('OPENAPI_ERROR_RESPONSE',f"{o.get('operationId')} {status}")
 if set(oas_ops)!=set(opmap):err('OPENAPI_OPERATION_SET',f'openapi={len(set(oas_ops))}, registry={len(opmap)}')
 checks['api_operations']=len(ops);checks['api_data_shapes']=len(signatures)
 # Components
 comps=read_csv(root/'rejestry/component-contracts.csv');cmap={r['component']:r for r in comps}
 if len(cmap)!=len(comps):err('COMPONENT_DUP','duplicate component IDs')
 usage=read_csv(root/'macierze/ekran-komponent.csv');usage_by=defaultdict(set)
 for r in usage:
  usage_by[r['komponent']].add(r['screen_id'])
  if r['komponent'] not in cmap:err('COMPONENT_UNKNOWN',r['komponent'])
  if not (spec/r['component_document']).exists():err('COMPONENT_DOC_LINK',r['component_document'])
 for name,r in cmap.items():
  cp=root/r['contract_file'];dp=spec/r['component_document']
  if not cp.exists():err('COMPONENT_CONTRACT',name)
  if not dp.exists():err('COMPONENT_DOCUMENT',name);continue
  text=dp.read_text(encoding='utf-8',errors='ignore')
  doc_consumers=set(re.findall(r'^- `([^`]+)` —',text,re.M))
  if doc_consumers!=usage_by.get(name,set()):err('COMPONENT_CONSUMERS',f'{name}: doc={sorted(doc_consumers)}, matrix={sorted(usage_by.get(name,set()))}')
  ctext=cp.read_text(encoding='utf-8')
  if name in {'PairingFlow','BudgetPacing','CohortMatrix','LineageGraph','DecisionQueue','PlanPerformance','ResultDrivers','SalesSources','CustomerSegments','SalesFunnel','EvidencePanel','RecommendationCard','DataStatusBanner','SyncTimeline','AttributionComparison','ReconciliationPanel','FunnelStep','MorningBrief'}:
   if f'export interface {name}Props' in ctext:err('COMPONENT_DOUBLE_CONTRACT',name)
   if f'export type {{ {name}Props }}' not in ctext:err('COMPONENT_DOMAIN_REEXPORT',name)
 cp=subprocess.run(['npx','tsc','--project','tsconfig.contracts.json','--noEmit'],cwd=root,capture_output=True,text=True)
 if cp.returncode!=0:err('TSC',cp.stdout+cp.stderr)
 checks['components']=len(comps)
 # Auth
 model=json.loads((root/'contracts/auth-fsm.json').read_text(encoding='utf-8'));auth=read_csv(root/'macierze/auth-fsm-transitions.csv')
 if len(model.get('surfaces',[]))!=29 or len(auth)!=29:err('AUTH_COUNT',f"json={len(model.get('surfaces',[]))}, csv={len(auth)}")
 jmap={x['surface_id']:x for x in model.get('surfaces',[])}
 for r in auth:
  j=jmap.get(r['surface_id'])
  if not j:err('AUTH_SURFACE',r['surface_id']);continue
  for k in ['auth_state','auth_reason','operation_id','success_transition','error_transition','guard','action','security_control']:
   if str(j.get(k,''))!=r[k]:err('AUTH_MISMATCH',f"{r['surface_id']} {k}")
  if r['auth_reason']==r['auth_event']:err('AUTH_REASON_EVENT',r['surface_id'])
  if not r['operation_id'].startswith('ui.') and r['operation_id'] not in opmap:err('AUTH_OPERATION',r['operation_id'])
  doc=spec/r['surface_document']
  txt=doc.read_text(encoding='utf-8',errors='ignore') if doc.exists() else ''
  for value in [r['auth_state'],r['auth_reason'],r['operation_id']]:
   if value not in txt:err('AUTH_DOC',f"{r['surface_id']} missing {value}")
 its=(spec/'25-kontrakty-domenowe-i-api/identity-auth-api.md').read_text(encoding='utf-8')
 for r in auth:
  if all(x in its for x in [r['surface_id'],r['auth_state'],r['auth_reason'],r['operation_id']]):continue
  err('AUTH_IDENTITY_DOC',r['surface_id'])
 checks['auth_surfaces']=len(auth)
 # E2E
 e2e=read_csv(root/'macierze/e2e-step-bindings.csv');flowids={r['flow_id'] for r in e2e}
 if len(flowids)!=18 or len(e2e)!=124:err('E2E_COUNT',f'{len(flowids)} flows/{len(e2e)} steps')
 for r in e2e:
  op=opmap.get(r['operation_id'])
  if not op:err('E2E_OPERATION',r['operation_id'])
  elif op['kind']!=r['operation_kind']:err('E2E_KIND',r['test_id'])
  fp=root/r['fixture_id']
  if not fp.exists():err('E2E_FIXTURE',r['fixture_id'])
  else:
   obj=json.loads(fp.read_text(encoding='utf-8'))
   if obj.get('operationId')!=r['operation_id'] or obj.get('stepName')!=r['step_name']:err('E2E_FIXTURE_CONTENT',r['test_id'])
 for field in ['entry_condition','success_state','recoverable_error','resume_rule','postcondition','assertion']:
  uniq=len({norm(r[field]) for r in e2e})
  if uniq<50:err('E2E_TEMPLATE',f'{field}: {uniq} unique')
 checks['e2e_steps']=len(e2e)
 # Storybook backlog fixtures
 stories=read_csv(root/'rejestry/storybook.csv')
 for r in stories:
  if r.get('registry_scope')!='target-backlog-registry':err('STORY_REGISTRY_SCOPE',r['story_title'])
  if r.get('active_sidebar_source')!='apps/web/src/storybook-next/storybook-contract.json':err('STORY_ACTIVE_SOURCE',r['story_title'])
  fp=root/r['fixture_id']
  if not fp.exists():err('STORY_FIXTURE',r['fixture_id']);continue
  obj=json.loads(fp.read_text(encoding='utf-8'))
  if obj.get('sourceDocument')!=r['document']:err('STORY_SOURCE',r['story_title'])
  if '|'.join(obj.get('states',[]))!=r['states']:err('STORY_STATES',r['story_title'])
 if len({r['fixture_id'] for r in stories})!=len(stories):err('STORY_DUP_FIXTURE','duplicate fixture ids')
 checks['storybook_targets']=len(stories)
 # P0 priority package
 p0_dir=spec/'26-priorytety-p0'
 p0_docs=sorted(p0_dir.glob('*.md')) if p0_dir.exists() else []
 if len(p0_docs)!=12:err('P0_DOC_COUNT',f'expected 12, got {len(p0_docs)}')
 metric_path=root/'contracts/metric-catalog-58.json'
 try:
  metric_payload=json.loads(metric_path.read_text(encoding='utf-8'))
  metrics=metric_payload.get('metrics',[])
 except Exception as e:
  metrics=[];err('P0_METRIC_PARSE',str(e))
 required_metric_fields={'metricKey','displayName','description','definitionVersion','catalogStatus','implementationStatus','formula','unit','aggregationPolicy','requiredFacts','requiredSources','currencyPolicy','timezonePolicy','taxPolicy','refundPolicy','missingDataPolicy','readinessRules','qualityRules','evidenceRequirements','owner','validFrom','validTo','implementationTarget','mvpScope'}
 if len(metrics)!=58:err('P0_METRIC_COUNT',f'expected 58, got {len(metrics)}')
 keys=[m.get('metricKey','') for m in metrics]
 if len(set(keys))!=58:err('P0_METRIC_UNIQUE',f'unique={len(set(keys))}')
 for i,m in enumerate(metrics,1):
  missing=required_metric_fields-set(m)
  if missing:err('P0_METRIC_FIELDS',f'{i}:{sorted(missing)}')
  if m.get('mvpScope')!='required':err('P0_METRIC_MVP',m.get('metricKey',''))
 mvp=(p0_dir/'03-zakres-mvp-cala-aplikacja.md').read_text(encoding='utf-8',errors='ignore') if (p0_dir/'03-zakres-mvp-cala-aplikacja.md').exists() else ''
 expected_integrations={'WooCommerce','Shopify','BaseLinker','Allegro','Google Ads','Meta Ads','Google Analytics 4'}
 for name in expected_integrations:
  if name not in mvp:err('P0_MVP_INTEGRATION',name)
 if not all(x in mvp.lower() for x in ['całą aplikację','wszystkie moduły','wszystkie usługi']):err('P0_MVP_SCOPE','whole application/services wording missing')
 billing='\n'.join(p.read_text(encoding='utf-8',errors='ignore') for p in sorted((spec/'17-subskrypcja-i-platnosci').glob('*.md')))
 for token in ['monthly','annual','BLIK','KSeF','karta','przelew']:
  if token.lower() not in billing.lower():err('P0_BILLING',token)
 legal_dir=spec/'27-pakiet-prawny-i-organizacyjny'
 legal_docs=sorted(legal_dir.glob('*.md')) if legal_dir.exists() else []
 if len(legal_docs)<26:err('P0_LEGAL_COUNT',f'expected >=26, got {len(legal_docs)}')
 envp=root/'config/p0-integrations.env.example'
 envtxt=envp.read_text(encoding='utf-8',errors='ignore') if envp.exists() else ''
 for token in ['DATABASE_URL','REDIS_URL','AI_PROVIDER','GUS_BIR_API_KEY','PAYMENT_PROVIDER','KSEF_ENV','IOS_APP_STORE_URL','ANDROID_GOOGLE_PLAY_URL']:
  if token not in envtxt:err('P0_ENV',token)
 checks['priority_p0']={'documents':len(p0_docs),'metrics':len(metrics),'legal_templates':len(legal_docs),'mvp_integrations':7}
 # installer error code and transactional smoke test
 bad=subprocess.run([sys.executable,'install_docs_to_repo.py',str(root/'not-a-repo'),'apply'],cwd=root,capture_output=True,text=True)
 if bad.returncode==0:err('INSTALLER_ERROR_CODE','invalid repo returned 0')
 with tempfile.TemporaryDirectory() as td:
  repo=Path(td)/'repo';repo.mkdir();subprocess.run(['git','init','-q',str(repo)],check=True)
  apply=subprocess.run([sys.executable,'install_docs_to_repo.py',str(repo),'apply'],cwd=root,capture_output=True,text=True)
  if apply.returncode!=0:err('INSTALLER_APPLY',apply.stderr)
  elif not (repo/'docs/specyfikacja-docelowa').exists() or not (repo/'fixtures').exists():err('INSTALLER_SCOPE','missing installed mappings')
  rollback=subprocess.run([sys.executable,'install_docs_to_repo.py',str(repo),'rollback'],cwd=root,capture_output=True,text=True)
  if rollback.returncode!=0:err('INSTALLER_ROLLBACK',rollback.stderr)
 # manifest, if final
 mp=root/'MANIFEST.json'
 if mp.exists():
  try:m=json.loads(mp.read_text(encoding='utf-8'));rows=m['files'] if isinstance(m,dict) else m
  except Exception as e:rows=[];err('MANIFEST_PARSE',str(e))
  mmap={r['path']:r for r in rows}
  actual={str(p.relative_to(root)):p for p in iter_manifest_scope_files(root,set(mmap))}
  missing=[rel for rel in mmap if rel not in actual]
  extra=[rel for rel in actual if rel not in mmap]
  if missing:err('MANIFEST_MISSING',f'{len(missing)} missing; examples {missing[:8]}')
  if not in_git_repo and extra:err('MANIFEST_SET',f'manifest={len(mmap)} actual={len(actual)}')
  if not in_git_repo:
   for rel,p in actual.items():
    r=mmap.get(rel)
    if r and (int(r['bytes'])!=p.stat().st_size or r['sha256']!=sha(p)):err('MANIFEST_HASH',rel)
  else:
   hash_drift=[rel for rel,p in actual.items() if rel in mmap and (int(mmap[rel]['bytes'])!=p.stat().st_size or mmap[rel]['sha256']!=sha(p))]
   if hash_drift:warn('MANIFEST_HASH_DRIFT',f'{len(hash_drift)} modified in worktree; examples {hash_drift[:8]}')
   if extra:warn('MANIFEST_EXTRA',f'{len(extra)} extra files in manifest scope; examples {extra[:8]}')
 status='PASS' if not errors else 'FAIL'
 return {'status':status,'error_count':len(errors),'warning_count':len(warnings),'errors':errors,'warnings':warnings,'checks':checks}

def main():
 ap=argparse.ArgumentParser();ap.add_argument('root',nargs='?',default='.');ap.add_argument('--json-out');a=ap.parse_args();res=validate(Path(a.root).resolve());text=json.dumps(res,ensure_ascii=False,indent=2)
 if a.json_out:Path(a.json_out).write_text(text+'\n',encoding='utf-8')
 print(text);sys.exit(0 if res['status']=='PASS' else 1)
if __name__=='__main__':main()
