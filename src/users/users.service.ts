// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import { UpdateUserDto } from './dto/update-user.dto';
const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

@Injectable()
export class UsersService {

    constructor(private prisma: PrismaService) { }

    async create(registerUserDto: RegisterUserDto, profileImagePath: string | null) {
        const { name, email, password, phone } = registerUserDto;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                profileImage: profileImagePath,
            },
        });

        const { password: _, ...result } = user;
        return result;
    }



    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }


    async findMe(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                profileImage: true,
            },
        });

        if (!user) throw new NotFoundException('Usuário não encontrado.');

        return {
            ...user,
            profileImage: user.profileImage
                ? `${BASE_URL}/${user.profileImage.replace(/\\/g, '/')}`
                : null,
        };
    }

    async update(userId: string, updateUserDto: UpdateUserDto, profileImagePath?: string) {
        const user = await this.prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new NotFoundException('Usuário não encontrado.');

        if (profileImagePath && user.profileImage) {
            try { await fs.unlink(user.profileImage); } catch (error) { console.error(error); }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...updateUserDto,
                ...(profileImagePath && { profileImage: profileImagePath }),
            },
        });

        return {
            ...updatedUser,
            profileImage: updatedUser.profileImage
                ? `${BASE_URL}/${updatedUser.profileImage.replace(/\\/g, '/')}`
                : null,
        };
    }


}
