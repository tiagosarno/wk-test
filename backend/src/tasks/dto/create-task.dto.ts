import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTaskDto {
  @IsString({ message: 'Nome precisa ser um texto' })
  @MinLength(5, { message: 'Nome precisa ter no mínimo 5 caracteres' })
  @IsNotEmpty()
  readonly name: string;

  @IsString()
  @MinLength(5)
  @MaxLength(255)
  @IsNotEmpty()
  readonly description: string;
}
