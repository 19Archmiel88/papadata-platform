export const legalDocumentTypes = [
 'cookie_policy',
 'privacy_notice',
 'terms_of_service',
 'data_processing_terms',
] as const;
export type LegalDocumentType = typeof legalDocumentTypes[number];
export function isLegalDocumentType(value: unknown): value is LegalDocumentType {
 return typeof value === 'string' && (legalDocumentTypes as readonly string[]).includes(value);
}

// Distinct from the `LegalDocument` type in access-lifecycle.ts (an
// externally-hosted terms/privacy URL used by onboarding's consents step).
// This is the DB-backed app.legal_documents record served by the public
// legal document endpoint (see BATCH F).
export type PublishedLegalDocument = {
 readonly id: string;
 readonly type: LegalDocumentType;
 readonly version: string;
 readonly title: string;
 readonly body: string;
 readonly effectiveAt: string;
};

export type LegalDocumentResponse = {
 readonly document: PublishedLegalDocument | null;
};

export function isPublishedLegalDocument(value: unknown): value is PublishedLegalDocument {
 if (!isRecord(value)) return false;
 return typeof value.id === 'string'
  && isLegalDocumentType(value.type)
  && typeof value.version === 'string'
  && typeof value.title === 'string'
  && typeof value.body === 'string'
  && typeof value.effectiveAt === 'string';
}

function isRecord(value: unknown): value is Record<string, unknown> {
 return value !== null && typeof value === 'object' && !Array.isArray(value);
}
