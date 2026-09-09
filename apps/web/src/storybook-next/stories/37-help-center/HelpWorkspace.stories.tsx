import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { SupportTicketDetail } from '@papadata/contracts';
import { supportTicketsFixture } from '../../../fixtures/help-center/supportTicketsFixture';
import { HelpCenterView, type HelpCenterViewProps } from '../../../screens/help-center/HelpCenterView';
import { useProductQuery } from '../../../runtime/app/routing/productRoutes';
import { StorybookProductShellFrame } from '../shared/StorybookProductShellFrame';
function HelpScenario(args: HelpCenterViewProps) {
    const { params } = useProductQuery();
    const [tickets, setTickets] = useState<readonly SupportTicketDetail[]>(supportTicketsFixture);
    const search = (params.get('ticketSearch') ?? '').toLowerCase(), status = params.get('ticketStatus') ?? 'all';
    const rows = tickets.filter(row => (status === 'all' || row.status === status) && `${row.number} ${row.subject}`.toLowerCase().includes(search));
    const page = Math.max(1, Math.floor(Number(params.get('ticketPage')) || 1));
    const detail = tickets.find(row => row.id === params.get('ticketId')) ?? null;
    return <HelpCenterView {...args} demo tickets={rows.slice((page - 1) * 50, page * 50)} total={rows.length} pageSize={50} ticketDetail={detail} ticketState={args.ticketState ?? 'ready'} onSubmit={async (input) => { const at = new Date().toISOString(); const next: SupportTicketDetail = { id: input.requestId, number: `HELP-DEMO-${tickets.length + 1}`, kind: input.kind, subject: input.subject, status: 'received', createdAt: at, updatedAt: at, version: 1, canRespond: true, consultationConfirmed: false, context: input.context, messages: [{ id: input.requestId, authorId: 'demo-owner', at, text: input.message, kind: 'message' }] }; setTickets(current => [next, ...current]); return next; }} onTicketCommand={async (id, command) => {
            const current = tickets.find(row => row.id === id);
            if (!current || current.version !== command.expectedVersion)
                throw new globalThis.Error('Demo: version conflict.');
            const at = new Date().toISOString();
            const next: SupportTicketDetail = { ...current, version: current.version + 1, updatedAt: at, status: command.action === 'resolve' ? 'resolved' : command.action === 'reopen' ? 'received' : current.status, messages: [...current.messages, { id: command.requestId, authorId: 'demo-owner', at, text: command.message, kind: command.action === 'resolve' ? 'resolved' : command.action === 'reopen' ? 'reopened' : 'message' }] };
            setTickets(items => items.map(row => row.id === id ? next : row));
            return next;
        }}/>;
}
const meta = { id: 'papadata-help-workspace', title: 'WSPARCIE/Centrum Pomocy/Sprawy', component: HelpCenterView, parameters: { layout: 'fullscreen' }, args: { state: 'ready' } } satisfies Meta<typeof HelpCenterView>;
export default meta;
type Story = StoryObj<typeof meta>;

function renderStory(args: HelpCenterViewProps) {
    return (
        <StorybookProductShellFrame activePath="/app/help">
            <HelpScenario {...args} />
        </StorybookProductShellFrame>
    );
}

export const Overview: Story = { render: renderStory, name: 'Procedury i lokalny scenariusz spraw' };
export const Loading: Story = { render: renderStory, args: { state: 'loading' } };
export const Error: Story = { render: renderStory, args: { state: 'error', problem: 'Scenariusz demonstracyjny: odczyt spraw niedostępny.' } };
export const Forbidden: Story = { render: renderStory, args: { state: 'forbidden' } };
export const Offline: Story = { render: renderStory, args: { state: 'offline' } };
