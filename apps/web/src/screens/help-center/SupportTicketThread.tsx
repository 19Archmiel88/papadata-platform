import { useEffect, useRef, useState } from 'react';
import type { SupportTicketCommand, SupportTicketDetail } from '@papadata/contracts';
import { Button, Drawer } from '../../design-system';
import type { RemoteState } from '../../runtime/shared/data/useRemoteResource';
import { safeRandomUUID } from '../../runtime/shared/id/safeRandomUUID';
import { useProductQuery } from '../../runtime/app/routing/productRoutes';
import { useShellNavigate } from '../../runtime/shell/app-shell/ShellNavigationContext';
import { ProductDataState } from '../shared/ProductDataState';
import { useProductLocale } from '../shared/useProductLocale';
export type TicketCommandHandler = (id: string, command: SupportTicketCommand) => Promise<SupportTicketDetail>;
export function SupportTicketThread({ ticket, state, problem, onRetry, onCommand }: {
    readonly ticket?: SupportTicketDetail | null;
    readonly state: RemoteState;
    readonly problem?: string | null;
    readonly onRetry?: () => void;
    readonly onCommand?: TicketCommandHandler;
}) {
    const { t, language } = useProductLocale(), { params, update } = useProductQuery(), navigate = useShellNavigate(), id = params.get('ticketId');
    const [message, setMessage] = useState(''), [pending, setPending] = useState(false), [error, setError] = useState<string | null>(null), [result, setResult] = useState<string | null>(null);
    const request = useRef<{
        signature: string;
        id: string;
    } | null>(null), inflight = useRef(false), active = useRef(id);
    active.current = id;
    useEffect(() => { setMessage(''); setError(null); setResult(null); request.current = null; }, [id]);
    useEffect(() => {
        if (!message.trim())
            return;
        const protect = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
        window.addEventListener('beforeunload', protect);
        return () => window.removeEventListener('beforeunload', protect);
    }, [message]);
    function close() {
        if (!pending && (!message.trim() || window.confirm(t('Odrzucić niezapisaną odpowiedź?', 'Discard the unsaved reply?'))))
            update({ ticketId: null });
    }
    async function send(action: SupportTicketCommand['action']) {
        if (!ticket || !onCommand || !ticket.canRespond || inflight.current || message.trim().length < 5)
            return;
        const body = { action, message: message.trim(), expectedVersion: ticket.version };
        const signature = JSON.stringify({ id: ticket.id, body });
        if (request.current?.signature !== signature)
            request.current = { signature, id: safeRandomUUID() };
        const selected = id;
        inflight.current = true;
        setPending(true);
        setError(null);
        setResult(null);
        try {
            await onCommand(ticket.id, { ...body, requestId: request.current.id });
            if (active.current === selected) {
                setMessage('');
                request.current = null;
                setResult(t('Zapisano zmianę w rejestrze spraw.', 'The change was saved in the request registry.'));
            }
        }
        catch (cause) {
            if (active.current === selected)
                setError(cause instanceof Error ? cause.message : t('Nie zapisano zmiany.', 'The change was not saved.'));
        }
        finally {
            inflight.current = false;
            setPending(false);
        }
    }
    return <Drawer open={Boolean(id)} side="right" width={640} dismissible={!pending} title={t('Historia sprawy', 'Request history')} description={ticket?.number ?? id} onOpenChange={open => {
            if (!open)
                close();
        }}>
  <ProductDataState state={state === 'ready' && !ticket ? 'empty' : state} problem={problem} onRetry={onRetry}>{ticket && <div className="pd-product-data">
   <h3>{ticket.subject}</h3><p>{t('Wersja', 'Version')}: {ticket.version} · {ticket.status}</p>
   {ticket.kind === 'consultation' && <p className="pd-product-data__notice">{t('Prośba o konsultację. Termin nie został zarezerwowany.', 'Consultation request. No appointment has been booked.')}</p>}
   <ol className="pd-support-thread">{ticket.messages.map(item => <li key={item.id}><p><time dateTime={item.at}>{new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.at))}</time> · {item.kind === 'message' ? t('Wiadomość', 'Message') : item.kind === 'resolved' ? t('Oznaczono jako rozwiązane', 'Marked as resolved') : t('Ponownie otwarto', 'Reopened')}</p><p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{item.text}</p></li>)}</ol>
   {ticket.context && <details><summary>{t('Dołączony kontekst', 'Attached context')}</summary><pre className="pd-product-data__context">{JSON.stringify(ticket.context, null, 2)}</pre><Button variant="ghost" onClick={() => navigate(ticket.context!.sourcePath)}>{t('Wróć do źródła', 'Return to source')}</Button></details>}
   {ticket.canRespond && onCommand ? <form className="pd-product-data__form" onSubmit={event => { event.preventDefault(); void send(ticket.status === 'resolved' ? 'reopen' : 'reply'); }}>
    <label>{t('Odpowiedź / uzasadnienie', 'Reply / reason')}<textarea value={message} onChange={e => setMessage(e.target.value)} required minLength={5} maxLength={5000} rows={5} disabled={pending}/></label>
    <p>{t('Bez haseł, tokenów i danych osobowych klientów. Treść jest widoczna w workspace.', 'Do not include passwords, tokens or customer personal data. The workspace can see this text.')}</p>
    <div className="pd-product-data__toolbar"><Button type="submit" disabled={pending || message.trim().length < 5}>{pending ? t('Zapisywanie…', 'Saving…') : ticket.status === 'resolved' ? t('Otwórz ponownie', 'Reopen') : t('Zapisz odpowiedź', 'Save reply')}</Button>{ticket.status !== 'resolved' && <Button variant="secondary" disabled={pending || message.trim().length < 5} onClick={() => void send('resolve')}>{t('Oznacz jako rozwiązane', 'Mark resolved')}</Button>}</div>
   </form> : <p>{t('Zmiana sprawy wymaga jej autorstwa lub uprawnienia zarządzania workspace.', 'Updating the request requires being its author or a workspace manager.')}</p>}
   {error && <p role="alert">{error}</p>}{result && <p role="status">{result}</p>}
  </div>}</ProductDataState>
 </Drawer>;
}
