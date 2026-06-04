import { IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreateStoreDto {
  @IsString()
  @Length(2, 60, { message: 'Name must be between 2 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @Length(1, 400, { message: 'Address must be max 400 characters' })
  address: string;

  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
