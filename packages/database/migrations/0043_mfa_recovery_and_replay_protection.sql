begin;

-- Faza 5 (MFA / step-up / recovery hardening): two additions to
-- security_mfa_enrollments.
--
--   used_recovery_code_hashes: tracks which of the ten recovery codes
--   generated at enroll time have already been redeemed, so each one is
--   single-use. Mirrors the used_at/consumed_at idiom already used by
--   security_step_up_proofs and security_invitation_tokens, but as a set
--   rather than a used_at column, since ten codes live in one row instead
--   of one row per code.
--
--   last_totp_step: the most recent 30-second TOTP time-step that was
--   successfully verified (confirm or verify), so a captured/replayed code
--   cannot be accepted a second time within its acceptance window (RFC 6238
--   S5.2 anti-replay recommendation). Steps only ever move forward, so this
--   also rejects an attacker replaying an older, still-numerically-valid
--   code once a newer one has already been consumed.
alter table app.security_mfa_enrollments
  add column if not exists used_recovery_code_hashes jsonb not null default '[]'::jsonb,
  add column if not exists last_totp_step bigint;

commit;
