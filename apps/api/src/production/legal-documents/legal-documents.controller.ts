import {Controller,Get,Inject,Param} from '@nestjs/common';
import {OperationId,PublicEndpoint} from '../auth/route-policy.js';
import {LegalDocumentsService} from './legal-documents.service.js';

// Public, read-only: the currently active legal document for an
// allow-listed type (cookie_policy, privacy_notice, terms_of_service,
// data_processing_terms -- see LegalDocumentType). No create/update/delete
// here by design (see BATCH F): publishing a new document version is an
// operator/admin path, not a public one.
@Controller('v1/legal/documents')
export class LegalDocumentsController{
 constructor(@Inject(LegalDocumentsService) private readonly service:LegalDocumentsService){}

 @Get(':type') @OperationId('legal.documents.read') @PublicEndpoint()
 async read(@Param('type') type:unknown){
  return {data:{document:await this.service.readActive(type)}};
 }
}
