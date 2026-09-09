export type SupportContext = { readonly sourcePath: string; readonly topic: string | null; readonly procedureId: string | null };
export type SupportTicketInput = { readonly requestId: string; readonly kind: 'technical' | 'consultation'; readonly subject: string; readonly message: string; readonly context: SupportContext | null };
export type SupportTicket = { readonly id: string; readonly number: string; readonly kind: SupportTicketInput['kind']; readonly subject: string; readonly status: 'received' | 'in_progress' | 'waiting_for_user' | 'resolved'; readonly createdAt: string; readonly context: SupportContext | null; readonly consultationConfirmed: false };

export type SupportMessage = { readonly id: string; readonly authorId: string; readonly at: string; readonly text: string; readonly kind: 'message' | 'resolved' | 'reopened' };
export type SupportTicketDetail = SupportTicket & { readonly version: number; readonly updatedAt: string; readonly messages: readonly SupportMessage[]; readonly canRespond: boolean };
export type SupportTicketCommand = { readonly requestId: string; readonly expectedVersion: number; readonly action: 'reply' | 'resolve' | 'reopen'; readonly message: string };
export type SupportTicketsPage = { readonly records: readonly SupportTicket[]; readonly total: number; readonly page?: number; readonly pageSize?: number };
