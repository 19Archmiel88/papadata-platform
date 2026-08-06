import { IsObject, IsOptional, IsString, Length, MaxLength } from "class-validator";

export class ProductRecordMutationDto {
  @IsString()
  @Length(1, 180)
  readonly externalKey!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  readonly status?: string;

  @IsObject()
  readonly data!: Record<string, unknown>;
}

export class ProductRecordPatchDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  readonly status?: string;

  @IsObject()
  readonly data!: Record<string, unknown>;
}

export class SearchDto {
  @IsString()
  @Length(2, 160)
  readonly query!: string;
}
