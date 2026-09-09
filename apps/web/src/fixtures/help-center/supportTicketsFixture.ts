import type { SupportTicketDetail } from '@papadata/contracts';
/** Demonstration only, with no customer or provider credentials. */
export const supportTicketsFixture: readonly SupportTicketDetail[] = [{
        id: '67149586-1234-4abc-8a12-123456789abc', number: 'HELP-DEMO-01', kind: 'technical', subject: 'Rozbieżność GA4 i zamówień', status: 'received',
        createdAt: '2026-09-08T08:00:00Z', updatedAt: '2026-09-08T08:00:00Z', version: 1, canRespond: true, consultationConfirmed: false,
        context: { sourcePath: '/app/traffic?from=2026-08-01&to=2026-08-31&timezone=Europe%2FWarsaw&trafficView=funnel', topic: 'ga4-order-comparison', procedureId: 'ga4-funnel-definitions' },
        messages: [{ id: 'demo-message-1', authorId: 'demo-owner', at: '2026-09-08T08:00:00Z', text: 'Przykładowa sprawa. Proszę porównać zakres transakcji GA4 i kwalifikowanych zamówień. To nie jest zgłoszenie klienta.', kind: 'message' }],
    }];
