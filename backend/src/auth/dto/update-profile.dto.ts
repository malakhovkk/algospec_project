import { IsOptional, IsEmail, MinLength } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @MinLength(6)
  password?: string;
}

