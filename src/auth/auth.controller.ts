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

        let profilePicturePath: string | null = null;
        if (file) {
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

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            maxAge: 1000 * 60 * 60 * 24,
            path: '/',
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
        res.clearCookie('access_token', {
            httpOnly: true,
            secure: false,
            sameSite: 'lax',
            path: '/',
        }); return {
            message: 'Deslogado com sucesso!',
        };
    }
}
