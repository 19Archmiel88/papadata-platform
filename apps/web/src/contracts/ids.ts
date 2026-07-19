type BrandedString<TBrand extends string> = string & {
  readonly __brand: TBrand;
};

export type UserId = BrandedString<'UserId'>;
export type OrganizationId = BrandedString<'OrganizationId'>;
export type WorkspaceId = BrandedString<'WorkspaceId'>;
export type MembershipId = BrandedString<'MembershipId'>;
export type SessionId = BrandedString<'SessionId'>;
export type InvitationId = BrandedString<'InvitationId'>;
export type AuthChallengeId = BrandedString<'AuthChallengeId'>;
export type PasswordResetId = BrandedString<'PasswordResetId'>;
export type AuditEventId = BrandedString<'AuditEventId'>;
export type CorrelationId = BrandedString<'CorrelationId'>;

export function asUserId(value: string): UserId {
  return value as UserId;
}

export function asOrganizationId(value: string): OrganizationId {
  return value as OrganizationId;
}

export function asWorkspaceId(value: string): WorkspaceId {
  return value as WorkspaceId;
}

export function asMembershipId(value: string): MembershipId {
  return value as MembershipId;
}

export function asSessionId(value: string): SessionId {
  return value as SessionId;
}

export function asInvitationId(value: string): InvitationId {
  return value as InvitationId;
}

export function asAuthChallengeId(value: string): AuthChallengeId {
  return value as AuthChallengeId;
}

export function asPasswordResetId(value: string): PasswordResetId {
  return value as PasswordResetId;
}

export function asAuditEventId(value: string): AuditEventId {
  return value as AuditEventId;
}

export function asCorrelationId(value: string): CorrelationId {
  return value as CorrelationId;
}
