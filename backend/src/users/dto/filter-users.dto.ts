import { IsOptional, IsString, IsEnum } from 'class-validator';
import { UserRole } from '../user.entity';

export class FilterUsersDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsEnum(UserRole) role?: UserRole;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'ASC' | 'DESC';
}
