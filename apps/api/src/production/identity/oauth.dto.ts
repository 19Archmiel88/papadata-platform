import {
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from "class-validator";

const providers = ["google", "microsoft"] as const;

export class OAuthStartDto {
  @IsIn(providers)
  readonly provider!: "google" | "microsoft";

  @IsIn(["login", "register", "accept_invitation"])
  readonly intent!: "login" | "register" | "accept_invitation";

  @IsOptional()
  @IsUUID()
  readonly invitationId?: string;

  @IsOptional()
  @IsString()
  @Length(1, 512)
  readonly invitationToken?: string;

  @IsOptional()
  @IsString()
  @Length(1, 2048)
  readonly returnTo?: string;
}

export class OAuthLinkOrReauthStartDto {
  @IsIn(providers)
  readonly provider!: "google" | "microsoft";

  @IsOptional()
  @IsString()
  @Length(1, 2048)
  readonly returnTo?: string;
}

// No `provider` field: the callback's provider is recovered from the
// consumed app.security_oauth_transactions row (keyed by `state`), which
// the frontend never needs to know or send — one less thing a client could
// get wrong or spoof.
export class OAuthCallbackDto {
  @IsString()
  @Length(1, 8192)
  readonly code!: string;

  @IsString()
  @Length(1, 512)
  readonly state!: string;
}
