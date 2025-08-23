
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterUserDto } from '../auth/dto/register-user.dto';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs/promises';
import { UpdateUserDto } from './dto/update-user.dto';

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

    async update(userId: string, updateUserDto: UpdateUserDto, profileImagePath?: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        if (profileImagePath && user.profileImage) {
            try {
                await fs.unlink(user.profileImage);
            } catch (error) {
                console.error('Erro ao excluir a foto de perfil antiga:', error);
            }
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: {
                ...updateUserDto,
                ...(profileImagePath && { profileImage: profileImagePath }),
            },
        });

        const { password, ...result } = updatedUser;
        return result;
    }

    async findOneByEmail(email: string) {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }
}
