import {
    Controller,
    Patch,
    Body,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
    BadRequestException,
    Get,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Req() req: any) {
        const userId = req.user.userId;
        return this.usersService.findMe(userId);
    }

  @Patch('profile')
@UseGuards(JwtAuthGuard)
@UseInterceptors(
    FileInterceptor('profileImage', {
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
async updateProfile(
    @Req() req: any,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
) {
    const userId = req.user.userId;

    let profileImagePath: string | undefined;

    if (file) {
        const allowedMimes = ['image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedMimes.includes(file.mimetype)) {
            throw new BadRequestException(
                `Tipo de arquivo inválido. Permitido: ${allowedMimes.join(', ')}`,
            );
        }

        if (file.size > 5 * 1024 * 1024) {
            throw new BadRequestException('Arquivo muito grande. Máx 5MB');
        }

         profileImagePath = file.path.replace(/\\/g, '/');
    }

    return this.usersService.update(userId, updateUserDto, profileImagePath);
}

}
