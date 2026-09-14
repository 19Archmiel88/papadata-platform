import type {LegalDocumentResponse} from '@papadata/contracts';
import type {RemoteState} from '../../runtime/shared/data/useRemoteResource';
import type {LegalDocumentScreenState} from '../../runtime/features/legal/LegalDocumentScreen';

// Separated from LegalDocumentPage so this mapping -- in particular "a
// successful read with no active document is 'unavailable', not 'error'"
// (see BATCH F section 14) -- is directly testable without rendering.
export function resolveLegalDocumentScreenState(
 remoteState:RemoteState,
 data:LegalDocumentResponse|null,
):LegalDocumentScreenState{
 if(remoteState==='loading')return 'loading';
 if(remoteState==='ready')return data?.document?'ready':'unavailable';
 return 'error';
}
