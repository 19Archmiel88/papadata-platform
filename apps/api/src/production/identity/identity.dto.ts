import { IsEmail, IsString, Length, Matches } from "class-validator";

export class IdentityRegisterDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @Length(12, 256)
  @Matches(/[a-z]/u)
  @Matches(/[A-Z]/u)
  @Matches(/[0-9]/u)
  readonly password!: string;

  @IsString()
  @Length(1, 120)
  readonly displayName!: string;

  @IsString()
  @Length(1, 160)
  readonly organizationName!: string;

  @IsString()
  @Length(1, 160)
  readonly workspaceName!: string;
}

export class IdentityLoginDto {
  @IsEmail()
  readonly email!: string;

  @IsString()
  @Length(1, 256)
  readonly password!: string;
}
