import { Injectable } from '@nestjs/common';
import { hashPassword } from '../../common/utils/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

const PUBLIC_USER_SELECT = {
  id: true,
  email: true,
  name: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const passwordHash = await hashPassword(dto.password);
    return this.prisma.user.create({
      data: { email: dto.email, name: dto.name, passwordHash },
      select: PUBLIC_USER_SELECT,
    });
  }

  findAll() {
    return this.prisma.user.findMany({ select: PUBLIC_USER_SELECT });
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: PUBLIC_USER_SELECT,
    });
  }

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
