import { createHash } from 'node:crypto';
import { CredentialResolutionError, SecretManagerCredentialSecretStore } from './credentials.js';
/** Uses the same workload-identity metadata endpoint as the existing secret reader.
 * No operator-supplied secret resource or bearer token is accepted from a request. */
export class IntegrationSecretProvisioner {
 readonly project:string; readonly location:string;
 constructor(env:NodeJS.ProcessEnv=process.env){
  this.project=env.PAPADATA_INTEGRATION_SECRET_PROJECT??'';this.location=env.PAPADATA_INTEGRATION_SECRET_LOCATION??'';
  if(env.PAPADATA_INTEGRATION_SECRET_WRITE_ENABLED!=='true'||!/^[a-z][a-z0-9-]{4,61}[a-z0-9]$/.test(this.project)||!/^[a-z]+-[a-z]+[0-9]$/.test(this.location))throw new CredentialResolutionError('secret_provisioning_not_configured');
 }
 static ready():boolean{try{new IntegrationSecretProvisioner();return true;}catch{return false;}}
 async write(input:{tenantId:string;workspaceId:string;connectionId:string;requestId:string;provider:import('@papadata/contracts').MvpIntegrationCatalogProviderId;payload:string}):Promise<{resource:string;version:string}>{
  if(Buffer.byteLength(input.payload,'utf8')>16384)throw new CredentialResolutionError('credential_payload_too_large');
  const binding=createHash('sha256').update(JSON.stringify([input.tenantId,input.workspaceId,input.connectionId,input.requestId,input.provider])).digest('hex');
  const id=`papadata-connection-${binding}`,resource=`projects/${this.project}/secrets/${id}`;
  const tokenResponse=await fetch('http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token',{headers:{'Metadata-Flavor':'Google'},signal:AbortSignal.timeout(3000),redirect:'error'});
  if(!tokenResponse.ok)throw new CredentialResolutionError('secret_identity_unavailable');
  const tokenBody=await tokenResponse.json() as {access_token?:unknown};if(typeof tokenBody.access_token!=='string')throw new CredentialResolutionError('secret_identity_unavailable');
  const request=async(path:string,method='GET',body?:unknown)=>{
   const response=await fetch(`https://secretmanager.googleapis.com/v1/${path}`,{method,headers:{Authorization:`Bearer ${tokenBody.access_token}`,'Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(5000),redirect:'error'});
   return response;
  };
  const created=await request(`projects/${this.project}/secrets?secretId=${id}`,'POST',{replication:{userManaged:{replicas:[{location:this.location}]}},labels:{papadata_binding:binding.slice(0,63)}});
  if(!created.ok&&created.status!==409)throw new CredentialResolutionError('secret_write_denied');
  if(created.status===409){
   const metadataResponse=await request(resource);if(!metadataResponse.ok)throw new CredentialResolutionError('secret_write_denied');
   const metadata=await metadataResponse.json() as {labels?:Record<string,string>};if(metadata.labels?.papadata_binding!==binding.slice(0,63))throw new CredentialResolutionError('secret_binding_mismatch');
   const latest=await request(`${resource}/versions/latest`);
   if(latest.ok){
    const v=await latest.json() as {name?:string};const version=v.name?.split('/').at(-1);if(!version||!/^\d+$/.test(version))throw new CredentialResolutionError('secret_version_invalid');
    const stored=await new SecretManagerCredentialSecretStore().readSecret({providerId:input.provider,credentialReference:resource,secretResource:resource,version});
    if(stored!==input.payload)throw new CredentialResolutionError('secret_request_conflict');
    return {resource,version};
   }
   if(latest.status!==404)throw new CredentialResolutionError('secret_read_denied');
  }
  const added=await request(`${resource}:addVersion`,'POST',{payload:{data:Buffer.from(input.payload,'utf8').toString('base64')}});
  if(!added.ok)throw new CredentialResolutionError('secret_write_denied');
  const body=await added.json() as {name?:string};const version=body.name?.split('/').at(-1);
  if(!version||!/^\d+$/.test(version))throw new CredentialResolutionError('secret_version_invalid');
  // Read-after-write before activating a connection. Plaintext never goes to a DB row.
  const persisted=await new SecretManagerCredentialSecretStore().readSecret({providerId:input.provider,credentialReference:resource,secretResource:resource,version});
  if(persisted!==input.payload)throw new CredentialResolutionError('secret_verification_failed');
  return {resource,version};
 }
}
