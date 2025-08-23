// src/users/users.controller.ts

import {
    Controller,
    Patch,
    Body,
    UseGuards,
    Req,
    UseInterceptors,
    UploadedFile,
    ParseFilePipe,
    MaxFileSizeValidator,
    FileTypeValidator,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    @UseInterceptors(FileInterceptor('profileImage'))
    async updateProfile(
        @Req() req: any,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile(
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 1024 * 1024 * 5 }),
                    new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' }),
                ],
                fileIsRequired: false,
            }),
        )
        file: Express.Multer.File,
    ) {
        const userId = req.user.id;
        const profileImagePath = file ? file.path : undefined;

        return this.usersService.update(userId, updateUserDto, profileImagePath);
    }
}
