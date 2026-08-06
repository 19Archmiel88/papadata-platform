import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsISO8601,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import {
  mvpIntegrationCatalogProviderIds,
  privacyRequestTypes,
  reportFormats,
} from "@papadata/contracts";

const idempotencyPattern = /^[A-Za-z0-9._:-]{8,128}$/u;
const scopePattern = /^[A-Za-z0-9._:/-]{1,160}$/u;

export class CreateIntegrationConnectionDto {
  @IsIn(mvpIntegrationCatalogProviderIds)
  providerId!: (typeof mvpIntegrationCatalogProviderIds)[number];

  @IsString()
  @Length(1, 500)
  credentialReference!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsString({ each: true })
  @Matches(scopePattern, { each: true })
  requestedScopes!: string[];

  @IsString()
  @Matches(idempotencyPattern)
  idempotencyKey!: string;
}

export class StartIntegrationSyncDto {
  @IsIn(mvpIntegrationCatalogProviderIds)
  providerId!: (typeof mvpIntegrationCatalogProviderIds)[number];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsString({ each: true })
  @Matches(scopePattern, { each: true })
  streams!: string[];

  @IsString()
  @Matches(idempotencyPattern)
  idempotencyKey!: string;
}

export class StartIntegrationBackfillDto extends StartIntegrationSyncDto {
  @IsISO8601({ strict: true })
  from!: string;

  @IsISO8601({ strict: true })
  to!: string;
}

export class CreatePrivacyRequestDto {
  @IsString()
  @Length(1, 500)
  subjectReference!: string;

  @IsIn(privacyRequestTypes)
  requestType!: (typeof privacyRequestTypes)[number];
}


export class RecordPrivacyIdentityVerificationDto {
  @IsString()
  @Length(1, 500)
  subjectReference!: string;

  @IsString()
  @Matches(/^[A-Za-z0-9._:-]{2,80}$/u)
  verificationMethod!: string;

  @IsString()
  @Length(8, 1000)
  evidenceReference!: string;

  @IsISO8601({ strict: true })
  expiresAt!: string;
}

export class ApprovePrivacyRequestDto {
  @IsUUID()
  identityVerificationEvidenceId!: string;
}

export class CreateReportDto {
  @IsString()
  @Length(1, 100)
  reportType!: string;

  @IsIn(reportFormats)
  format!: (typeof reportFormats)[number];

  @IsISO8601({ strict: true })
  dateFrom!: string;

  @IsISO8601({ strict: true })
  dateTo!: string;

  @IsObject()
  filters!: Record<string, unknown>;

  @IsString()
  @Matches(idempotencyPattern)
  idempotencyKey!: string;
}

export class MfaEnrollDto {
  @IsString()
  @Length(3, 254)
  accountName!: string;
}

export class MfaCodeDto {
  @IsString()
  @Matches(/^\d{6}$/u)
  code!: string;
}

export class StepUpDto extends MfaCodeDto {
  @IsString()
  @Matches(scopePattern)
  operationScope!: string;

  @IsOptional()
  @IsString()
  @Length(1, 500)
  targetReference?: string | null;
}

export class InvitationTokenDto {
  @IsUUID()
  invitationId!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(1_000_000)
  tokenVersion!: number;
}

export class VerifyAuditChainDto {
  @IsString()
  @Length(1, 200)
  chainScope!: string;
}

export class ProviderWebhookEnvelopeDto {
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @IsObject()
  payload!: Record<string, unknown>;
}

export class BatchEnvelopeDto<T extends object> {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  items!: T[];
}
