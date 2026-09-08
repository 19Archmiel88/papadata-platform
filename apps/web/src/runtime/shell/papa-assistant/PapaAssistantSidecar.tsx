import { useState } from 'react';
import { Button, Drawer } from '../../../design-system';
import { PapaAssistantExperience } from './PapaAssistantExperience';
import type { PapaAssistantOpenRequest } from './PapaAssistantRuntimeContext';

export function PapaAssistantSidecar({ onNavigate, onOpenChange, open, request = null }: {
  readonly onNavigate?: (path: string) => void; readonly onOpenChange: (open: boolean) => void;
  readonly open: boolean; readonly request?: PapaAssistantOpenRequest | null;
}) {
  const [pinned, setPinned] = useState(false);
  const [wide, setWide] = useState(false);
  const expand = () => { onOpenChange(false); onNavigate?.('/app/assistant'); };
  const content = <><div className="pd-assistant__panel-tools"><Button size="small" variant="ghost" onClick={() => setPinned(value => !value)}>{pinned ? 'Odepnij panel' : 'Przypnij panel'}</Button><Button size="small" variant="ghost" onClick={() => setWide(value => !value)}>{wide ? 'Zwęź panel' : 'Poszerz panel'}</Button>{pinned && <Button size="small" variant="ghost" onClick={() => onOpenChange(false)}>Zamknij Papa</Button>}</div>
    <PapaAssistantExperience compact onExpand={expand} request={request} /></>;
  if (pinned && open) return <aside className={`pd-assistant-pinned ${wide ? 'pd-assistant-pinned--wide' : ''}`} aria-label="Przypięty Papa Asystent" onKeyDown={event => { if (event.key === 'Escape') onOpenChange(false); }}>{content}</aside>;
  return <Drawer className="pd-assistant-drawer" dismissible onOpenChange={onOpenChange} open={open} side="right" title="Papa Asystent" width={wide ? 720 : 480}>{content}</Drawer>;
}
