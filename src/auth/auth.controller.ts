import { Controller, Post, Body, UseGuards, Req, Res, Get, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, BadRequestException } from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import type { Request, Response } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { diskStorage } from 'multer';
import type { Express } from 'express';
import * as fs from 'fs';
import { extname } from 'path';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('register')
    @UseInterceptors(
        FileInterceptor('profilePicture', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const uploadPath = './uploads/profile';
                    fs.mkdirSync(uploadPath, { recursive: true });
                    cb(null, uploadPath);
                },
                filename: (_, file, cb) => {
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    cb(null, uniqueSuffix + extname(file.originalname));
                },
            }),
        }),
    )
    async register(
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
                ],
                fileIsRequired: false,
            }),
        )
        file: Express.Multer.File,
        @Body() registerUserDto: RegisterUserDto,
    ) {
        let profilePicturePath: string | null = null;

        if (file) {
            // Validação manual do tipo de arquivo (mais confiável)
            const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
            if (!allowedMimes.includes(file.mimetype.toLowerCase())) {
                throw new BadRequestException(
                    `Tipo de arquivo inválido. Permitido: ${allowedMimes.join(', ')}`
                );
            }

             profilePicturePath = `uploads/profile/${file.filename}`;
        }

        return this.usersService.create(registerUserDto, profilePicturePath);
    }


    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
        const { access_token } = await this.authService.login(req.user);

        res.cookie('access_token', access_token, {
            httpOnly: true,
            secure: true,
            sameSite: 'none',
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
