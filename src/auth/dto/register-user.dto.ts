import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterUserDto {
    @IsNotEmpty({ message: 'O nome não pode ser vazio.' })
    name: string;

    @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
    email: string;

    @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
    @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres.' })
    password: string;
}