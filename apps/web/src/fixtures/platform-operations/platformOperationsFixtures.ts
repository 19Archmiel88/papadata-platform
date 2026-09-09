import type { BillingOverview, SettingsOverview, TeamOverview, QualityOverview, QualityLineage, PlatformPrivacyRequest, SettingsAuditPage } from '@papadata/contracts';
import type { BffSessionSummary } from '../../runtime/shared/api/bffClient';
export const demoOwner='00000000-0000-4000-8000-000000000001';
export const demoSource='00000000-0000-4000-8000-000000000101';
export const settingsOperationsFixture:SettingsOverview={version:'settings.operations.v1',tenantName:'Przykladowa organizacja',workspaceName:'Sklep demonstracyjny',user:{id:demoOwner,name:'Osoba demonstracyjna',email:'owner@example.invalid',mfaEnabled:true},documents:[
 {section:'profile',scope:'self',version:1,updatedAt:'2026-09-08T10:00:00Z',canEdit:true,values:{name:'Osoba demonstracyjna',language:'pl',theme:'system',timezone:'Europe/Warsaw'}},
 {section:'organization',scope:'tenant',version:2,updatedAt:'2026-09-08T10:00:00Z',canEdit:true,values:{name:'Przykladowa organizacja'}},
 {section:'workspace',scope:'workspace',version:1,updatedAt:'2026-09-08T10:00:00Z',canEdit:true,values:{name:'Sklep demonstracyjny'}},
 {section:'analytics',scope:'workspace',version:1,updatedAt:'2026-09-08T10:00:00Z',canEdit:true,values:{revenueGoal:150000,currency:'PLN',timezone:'Europe/Warsaw'}},
 {section:'notifications',scope:'self',version:1,updatedAt:'2026-09-08T10:00:00Z',canEdit:true,values:{digestOptIn:false,integrationAlerts:true,billingAlerts:true}},
]};
export const operationsTeamFixture:TeamOverview={currentUserId:demoOwner,canManage:true,members:[
 {id:demoOwner,userId:demoOwner,name:'Osoba demonstracyjna',email:'owner@example.invalid',role:'Tenant Owner',scope:'tenant',status:'active',version:0,mfaEnabled:true},
 {id:'00000000-0000-4000-8000-000000000002',userId:'00000000-0000-4000-8000-000000000003',name:'Analityk demonstracyjny',email:'analyst@example.invalid',role:'Analyst',scope:'workspace',status:'active',version:1,mfaEnabled:false},
],invitations:[]};
export const operationsSessionsFixture:readonly BffSessionSummary[]=[{sessionId:'demo-current-session',issuedAt:'2026-09-09T08:00:00Z',expiresAt:'2026-09-10T08:00:00Z',current:true,userAgent:'Demonstracja przegladarki'},{sessionId:'demo-previous-session',issuedAt:'2026-09-08T10:00:00Z',expiresAt:'2026-09-10T10:00:00Z',current:false,userAgent:'Demonstracja drugiego urzadzenia'}];
export const operationsPrivacyFixture:readonly PlatformPrivacyRequest[]=[{id:'00000000-0000-4000-8000-000000000201',kind:'export',subject:'demo-subject-reference',status:'pending',requestedAt:'2026-09-08T10:00:00Z',dueAt:'2026-10-08T10:00:00Z',completedAt:null,legalHold:false,targets:[{system:'canonical',status:'pending',errorCode:null}]}];
export const operationsAuditFixture:SettingsAuditPage={chainVerified:false,hasMore:false,nextCursor:null,events:[{id:'demo-audit',sequence:'12',action:'settings.operations.save',outcome:'success',actor:demoOwner,resource:'api_command',resourceId:'demo-command',createdAt:'2026-09-08T10:00:00Z',correlationId:'demo-correlation'}]};
export const billingOperationsFixture:BillingOverview={version:'billing.operations.v1',mode:'test',canManage:true,subscription:{plan:'starter',status:'active',customerConfigured:true,subscriptionConfigured:true,currentPeriodEnd:'2026-10-08T10:00:00Z',providerStatus:'active',cancelAtPeriodEnd:false,providerCheckedAt:'2026-09-08T10:00:00Z'},pendingCheckout:null,usage:{connectedSources:2,maxSources:3},portalEnabled:true,offers:[
 {plan:'starter',name:'Starter (demo)',cycle:'monthly',priceId:'price_demoStarterMonth',currency:'PLN',unitAmount:19900,interval:'month',intervalCount:1,taxBehavior:'exclusive'},
 {plan:'growth',name:'Growth (demo)',cycle:'monthly',priceId:'price_demoGrowthMonth',currency:'PLN',unitAmount:39900,interval:'month',intervalCount:1,taxBehavior:'exclusive'},
 {plan:'starter',name:'Starter (demo)',cycle:'annual',priceId:'price_demoStarterYear',currency:'PLN',unitAmount:199000,interval:'year',intervalCount:1,taxBehavior:'exclusive'},
],invoices:[{id:'in_demoInvoice',number:'DEMO-2026-09',currency:'PLN',total:24477,due:0,status:'paid',createdAt:'2026-09-08T10:00:00Z',dueAt:null,pdfUrl:null,paymentUrl:null,ksefStatus:'not_connected'}],invoicesHasMore:false,invoiceCursor:null,limitations:['Dane i ceny demonstracyjne. Nie sa oferta handlowa, faktura ani wynikiem wywolania Stripe.']};
export const qualityOperationsFixture:QualityOverview={version:'quality.operations.v1',measuredAt:'2026-09-08T10:00:00Z',truncated:false,datasets:[
 {connectionId:demoSource,provider:'woocommerce',stream:'orders',sourceRecords:150,canonicalRecords:147,failedBatches:1,lastIngestedAt:'2026-09-08T09:55:00Z',lastBusinessAt:'2026-09-08T09:50:00Z'},
 {connectionId:'00000000-0000-4000-8000-000000000102',provider:'ga4',stream:'traffic',sourceRecords:30,canonicalRecords:30,failedBatches:0,lastIngestedAt:'2026-09-08T09:45:00Z',lastBusinessAt:'2026-09-07T00:00:00Z'},
],runs:[{id:'demo-run',connectionId:demoSource,status:'partial',createdAt:'2026-09-08T09:55:00Z',details:{fetched:150,source:150,canonical:147,rejected:3}}],reviews:[]};
export const qualityLineageFixture:readonly QualityLineage[]=[{sourceId:'demo-source-record',canonicalId:'demo-canonical-record',externalId:'demo-fingerprint',businessAt:'2026-09-08T09:50:00Z',ingestedAt:'2026-09-08T09:55:00Z',schemaVersion:'v1',batchId:'demo-batch',checksum:'demonstration-not-a-checksum'}];
