import { lazy, Suspense, useState } from 'react';
import { contextualProductLink,productRoutes } from '../../app/routing/productRoutes';
import { usePapaAssistantRuntime } from './PapaAssistantRuntimeContext';
import { Button, Drawer } from '../../../design-system';
import {RenderBoundary} from '../../shared/errors/RenderBoundary';
const PapaAssistantExperience=lazy(()=>import('./PapaAssistantExperience').then(module=>({default:module.PapaAssistantExperience})));
import type { PapaAssistantOpenRequest } from './PapaAssistantRuntimeContext';

export function PapaAssistantSidecar({ onNavigate, onOpenChange, open, request = null }: {
  readonly onNavigate?: (path: string) => void; readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean; readonly request?: PapaAssistantOpenRequest | null;
}) {
  const runtime=usePapaAssistantRuntime();
  const [pinned, setPinned] = useState(false);
  const [wide, setWide] = useState(false);
  const expand = () => { onOpenChange(false); onNavigate?.(contextualProductLink(productRoutes.assistant,{conversationId:runtime.conversationId,caseThreadId:runtime.selectedElementId?runtime.caseThreadIds[runtime.selectedElementId]??null:null})); };
  const content = <><div className="pd-assistant__panel-tools"><Button size="small" variant="ghost" onClick={() => setPinned(value => !value)}>{pinned ? 'Odepnij panel' : 'Przypnij panel'}</Button><Button size="small" variant="ghost" onClick={() => setWide(value => !value)}>{wide ? 'Zwęź panel' : 'Poszerz panel'}</Button>{pinned && <Button size="small" variant="ghost" onClick={() => onOpenChange(false)}>Zamknij Papa</Button>}</div>
    <RenderBoundary><Suspense fallback={<p role="status">Wczytywanie Papa…</p>}><PapaAssistantExperience compact onExpand={expand} request={request} /></Suspense></RenderBoundary></>;
  if (pinned && open) return <aside className={`pd-assistant-pinned ${wide ? 'pd-assistant-pinned--wide' : ''}`} aria-label="Przypięty Papa Asystent" onKeyDown={event => { if (event.key === 'Escape') onOpenChange(false); }}>{content}</aside>;
  return <Drawer className="pd-assistant-drawer" dismissible onOpenChange={onOpenChange} open={open} side="right" title="Papa Asystent" width={wide ? 720 : 480}>{content}</Drawer>;
}
