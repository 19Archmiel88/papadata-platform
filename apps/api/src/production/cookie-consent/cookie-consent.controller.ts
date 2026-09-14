import {Body,Controller,Get,Headers,Inject,Put,Query,Req,UnauthorizedException} from '@nestjs/common';
import {randomUUID} from 'node:crypto';
import type {FastifyRequest} from 'fastify';
import {OperationId,PublicEndpoint} from '../auth/route-policy.js';
import {internalPrincipalHeaderName,PrincipalService} from '../auth/principal.service.js';
import type {RequestWithPrincipal} from '../auth/request-principal.js';
import {CookieConsentService} from './cookie-consent.service.js';

// Public: cookie consent must work before login (see BATCH E). Nothing here
// uses @Principal() -- that throws when a route is @PublicEndpoint()
// classified, since the guard never resolves one for public routes (see
// auth.guard.ts). Instead this calls PrincipalService.resolve() itself,
// exactly what the guard does for authenticated routes. A missing internal
// principal header is anonymous; a supplied but invalid/expired/spoofed one
// is rejected instead of being downgraded to anonymous.
@Controller('v1/consent/cookies')
export class CookieConsentController{
 constructor(
  @Inject(CookieConsentService) private readonly service:CookieConsentService,
  @Inject(PrincipalService) private readonly principals:PrincipalService,
 ){}

 @Get() @OperationId('consent.cookies.read') @PublicEndpoint()
 async read(@Query('subjectId') subjectId:unknown){
  return {data:await this.service.read(subjectId)};
 }

 @Put() @OperationId('consent.cookies.write') @PublicEndpoint()
 async write(
  @Req() request:FastifyRequest,
  @Body() body:unknown,
  @Query('subjectId') subjectId:unknown,
  @Headers('x-correlation-id') correlationId?:string,
 ){
  const principal=await this.resolveOptionalPrincipal(request);
  return {data:await this.service.write(subjectId,body,principal,correlationId??randomUUID())};
 }

 private async resolveOptionalPrincipal(request:FastifyRequest){
  const header=request.headers[internalPrincipalHeaderName];
  const supplied=Array.isArray(header)?header[0]:header;
  if(!supplied?.trim())return null;
  const principal=await this.principals.resolve(request as unknown as RequestWithPrincipal);
  if(!principal)throw new UnauthorizedException('Valid internal principal is required when supplied.');
  return principal;
 }
}
