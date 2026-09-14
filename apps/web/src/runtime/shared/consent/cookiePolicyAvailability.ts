import type {LegalDocumentResponse} from '@papadata/contracts';
import type {BffClient} from '../api/bffClient';
import {useRemoteResource, type RemoteState} from '../data/useRemoteResource';

// Deliberately independent of useCookieConsentRuntime/its reducer (see
// BATCH F.1): a failed or still-loading legal-document read must only ever
// hide the "Cookie policy" link, never touch cookie consent's own status,
// categories, saving, or error state. Keeping this in its own hook with
// its own useRemoteResource instance is what guarantees that isolation --
// there is no shared state for a legal-document failure to leak into.
export function resolveCookiePolicyLinkAvailable(
 remoteState:RemoteState,
 data:LegalDocumentResponse|null,
):boolean{
 return remoteState==='ready'&&data?.document!=null;
}

// Called once from CookieConsentRoot (mounted once at the app root) so the
// banner and the preferences dialog share a single read instead of each
// firing its own -- see BATCH F.1 §5.
export function useCookiePolicyLinkAvailable(client:BffClient):boolean{
 const resource=useRemoteResource('cookie-policy-availability',()=>client.readLegalDocument('cookie_policy'));
 return resolveCookiePolicyLinkAvailable(resource.state,resource.data);
}
