import { lazy, Suspense, useState } from 'react';
import { contextualProductLink,productRoutes } from '../../app/routing/productRoutes';
import { usePapaAssistantRuntime } from './PapaAssistantRuntimeContext';
import { Drawer } from '../../../design-system';
import { AssistantControlIcon, AssistantDisclosure } from './AssistantControls';
import './assistant-experience.css';
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
  const panelControls = <>
    <AssistantDisclosure label="Opcje panelu" iconOnly>
      <button type="button" onClick={expand}><AssistantControlIcon name="expand" />Pełny widok</button>
      <button type="button" className="pd-assistant__desktop-control" onClick={() => setPinned(value => !value)}><AssistantControlIcon name="pin" />{pinned ? 'Odepnij panel' : 'Przypnij panel'}</button>
      <button type="button" className="pd-assistant__desktop-control" onClick={() => setWide(value => !value)}><AssistantControlIcon name="expand" />{wide ? 'Zwęź panel' : 'Poszerz panel'}</button>
    </AssistantDisclosure>
    {pinned && <button type="button" className="pd-assistant__icon-button" aria-label="Zamknij Papa" title="Zamknij Papa" onClick={() => onOpenChange(false)}><AssistantControlIcon name="close" /></button>}
  </>;
  const content = <RenderBoundary><Suspense fallback={<p className="pd-assistant__loading" role="status">Wczytywanie Papa…</p>}><PapaAssistantExperience compact panelControls={panelControls} request={request} /></Suspense></RenderBoundary>;
  if (pinned && open) return <aside className={`pd-assistant-pinned ${wide ? 'pd-assistant-pinned--wide' : ''}`} aria-label="Przypięty Papa Asystent" onKeyDown={event => { if (event.key === 'Escape') onOpenChange(false); }}>{content}</aside>;
  return <Drawer className="pd-assistant-drawer" dismissible onOpenChange={onOpenChange} open={open} side="right" title="Papa Asystent" width={wide ? 720 : 480}>{content}</Drawer>;
}
