import {BadRequestException,Inject,Injectable} from '@nestjs/common';
import {ProductionDatabase} from '@papadata/database';
import {isLegalDocumentType,type LegalDocumentType,type PublishedLegalDocument} from '@papadata/contracts';

type DocumentRow={
 readonly document_id:string;
 readonly document_type:string;
 readonly document_version:string;
 readonly title:string;
 readonly body:string;
 readonly effective_at:string;
};

function toDocument(row:DocumentRow):PublishedLegalDocument{
 return {
  body:row.body,
  effectiveAt:row.effective_at,
  id:row.document_id,
  title:row.title,
  type:row.document_type as LegalDocumentType,
  version:row.document_version,
 };
}

function requireType(value:unknown):LegalDocumentType{
 if(!isLegalDocumentType(value))throw new BadRequestException('Unsupported legal document type.');
 return value;
}

@Injectable()
export class LegalDocumentsService{
 constructor(@Inject(ProductionDatabase) private readonly db:ProductionDatabase){}

 // Public read path: never trusts an arbitrary client-supplied type (see
 // requireType), never returns a superseded document -- app.legal_documents
 // has at most one row per type with status='active' (partial unique index
 // legal_documents_active_type_idx), so this can only ever surface the
 // current one or nothing.
 async readActive(rawType:unknown):Promise<PublishedLegalDocument|null>{
  const type=requireType(rawType);
  const row=await this.db.withSystem(async c=>{
   const result=await c.query<DocumentRow>(
    `SELECT document_id,document_type,document_version,title,body,effective_at::text
     FROM app.legal_documents WHERE document_type=$1 AND status='active'`,
    [type],
   );
   return result.rows[0];
  });
  return row?toDocument(row):null;
 }

 // Lightweight lookup for CookieConsentService's version-drift check --
 // deliberately never selects `body`, which callers there don't need and
 // which can be arbitrarily large.
 async activeVersion(type:LegalDocumentType):Promise<string|null>{
  const row=await this.db.withSystem(async c=>{
   const result=await c.query<{document_version:string}>(
    `SELECT document_version FROM app.legal_documents WHERE document_type=$1 AND status='active'`,
    [type],
   );
   return result.rows[0];
  });
  return row?.document_version??null;
 }
}
