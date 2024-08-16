import { IsString, IsEmail, IsInt, Min } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsInt()
  @Min(18, { message: 'User must be at least 18 years old.' })
  age: number;
}
