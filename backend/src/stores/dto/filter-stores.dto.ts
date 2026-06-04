import { IsOptional, IsString } from 'class-validator';

export class FilterStoresDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() sortBy?: string;
  @IsOptional() @IsString() sortOrder?: 'ASC' | 'DESC';
}
