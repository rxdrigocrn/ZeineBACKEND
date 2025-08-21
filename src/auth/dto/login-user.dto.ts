import { IsEmail, IsNotEmpty } from 'class-validator';

export class LoginDto {
    @IsEmail({}, { message: 'Por favor, insira um e-mail válido.' })
    email: string;

    @IsNotEmpty({ message: 'A senha não pode ser vazia.' })
    password: string;
}