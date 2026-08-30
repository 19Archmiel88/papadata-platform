// Pure OAuth outcome/availability logic, deliberately kept free of React
// component / asset imports AND of bffClient.ts (which constructs a
// singleton client at import time, requiring Vite's import.meta.env) —
// this stays testable under plain `node:test` (this repo has no jsdom/RTL).
export type OAuthProviderId = 'google' | 'microsoft';

export type OAuthAvailability = {
  readonly google: 'available' | 'configuration_required';
  readonly microsoft: 'available' | 'configuration_required';
};

// Undefined/missing availability is treated the same as
// "configuration_required" (safe default while status is still loading,
// or if the status call itself failed). Deliberately independent of any
// "pending" state — this answers "is the provider configured at all", not
// "is this button clickable right now".
export function isOAuthProviderEnabled(
  oauthAvailability: OAuthAvailability | undefined,
  provider: OAuthProviderId,
): boolean {
  return oauthAvailability?.[provider] === 'available';
}

export function resolvePostAuthDestination(membershipCount: number, returnTo: string): string {
  if (membershipCount > 1) {
    const nextParams = new URLSearchParams();
    nextParams.set('returnTo', returnTo);
    return `/select-workspace?${nextParams.toString()}`;
  }
  return returnTo;
}

export function businessOutcomeMessage(
  outcome: 'no_linked_account' | 'email_already_registered' | 'invitation_invalid',
): string {
  switch (outcome) {
    case 'no_linked_account':
      return 'To konto Google/Microsoft nie jest jeszcze połączone z żadnym kontem PapaData. Zaloguj się hasłem, a następnie połącz konto w ustawieniach, albo zarejestruj się przez ten sam przycisk.';
    case 'email_already_registered':
      return 'Ten adres e-mail ma już konto w PapaData utworzone hasłem. Zaloguj się hasłem, a następnie połącz to konto Google/Microsoft w ustawieniach.';
    case 'invitation_invalid':
      return 'Zaproszenie jest nieprawidłowe, wygasło lub zostało już wykorzystane.';
    default:
      return 'Nie udało się dokończyć logowania.';
  }
}

// Takes an already-extracted {code, fallbackMessage} rather than the raw
// thrown value, so this stays free of any bffClient.ts (BffProblem)
// import — the caller does that instanceof check itself.
export function oauthErrorMessage(code: string | null, fallbackMessage: string): string {
  switch (code) {
    case 'OAUTH_EMAIL_MISMATCH':
      return 'Adres e-mail konta Google/Microsoft nie pasuje do adresu, na który wysłano zaproszenie.';
    case 'OAUTH_TRANSACTION_INVALID':
      return 'Sesja logowania wygasła lub została już wykorzystana. Spróbuj ponownie.';
    case 'OAUTH_IDENTITY_ALREADY_LINKED':
      return 'To konto Google/Microsoft jest już połączone z innym kontem PapaData.';
    case 'OAUTH_REAUTH_IDENTITY_MISMATCH':
      return 'To konto Google/Microsoft nie jest połączone z bieżącą sesją.';
    case 'OAUTH_REAUTH_NO_SESSION':
      return 'Brak aktywnej sesji do ponownego potwierdzenia. Zaloguj się ponownie.';
    case 'OAUTH_CODE_EXCHANGE_FAILED':
      return 'Nie udało się potwierdzić logowania u dostawcy. Spróbuj ponownie.';
    default:
      return fallbackMessage || 'Nie udało się dokończyć logowania.';
  }
}
