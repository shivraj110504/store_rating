import { IsEmail, IsEnum, IsString, Length, Matches } from 'class-validator';
import { UserRole } from '../user.entity';

export class CreateUserDto {
  @IsString()
  @Length(2, 60, { message: 'Name must be between 2 and 60 characters' })
  name: string;

  @IsEmail({}, { message: 'Invalid email address' })
  email: string;

  @IsString()
  @Length(8, 16, { message: 'Password must be between 8 and 16 characters' })
  @Matches(/^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/, {
    message: 'Password must contain at least one uppercase letter and one special character',
  })
  password: string;

  @IsString()
  @Length(1, 400, { message: 'Address must be max 400 characters' })
  address: string;

  @IsEnum(UserRole)
  role: UserRole;
}
