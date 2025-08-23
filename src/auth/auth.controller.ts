import { Controller, Post, Body, UseGuards, Req, Res, Get, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { diskStorage, memoryStorage } from 'multer';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('register')
    @UseInterceptors(FileInterceptor('profilePicture', {
        storage: memoryStorage(),
    }))
    async register(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: /^(image\/jpeg|image\/png)$/ }),
                ],
                fileIsRequired: false,
            }),
        )
        file: Express.Multer.File,
        @Body() registerUserDto: RegisterUserDto
    ) {
        // Aqui é o log que você pediu
        console.log('Arquivo recebido:', file);
        console.log('Campos do usuário:', registerUserDto);

        // Só depois da validação você persiste o arquivo no disco
        let profilePicturePath: string | null = null;
        if (file) {
            // Exemplo de gravação manual
            const fs = require('fs');
            const path = `./uploads/${Date.now()}-${file.originalname}`;
            fs.writeFileSync(path, file.buffer);
            profilePicturePath = path;
        }

        return this.usersService.create(registerUserDto, profilePicturePath);
    }
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { access_token } = await this.authService.login(req.user);

        // Setando cookie HttpOnly
        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
        });


        return { message: 'Login realizado com sucesso' };
    }


    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: Request) {
        return req.user;
    }

    @Post('logout')
    logout(@Res({ passthrough: true }) res: Response) {
        res.clearCookie('jwt');
        return {
            message: 'Deslogado com sucesso!',
        };
    }
}
