import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  comparePassword,
  hashPassword,
} from '../../common/utils/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthUser, JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const passwordHash = await hashPassword(dto.password);
    const employee = await this.prisma.employee.create({
      data: { email: dto.email, name: dto.name ?? dto.email, passwordHash },
    });
    return this.login({
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      departmentId: employee.departmentId,
    });
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const employee = await this.prisma.employee.findUnique({
      where: { email },
    });
    if (
      !employee ||
      !(await comparePassword(password, employee.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return {
      id: employee.id,
      email: employee.email,
      name: employee.name,
      role: employee.role,
      departmentId: employee.departmentId,
    };
  }

  login(user: AuthUser): AuthResponseDto {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken, role: user.role };
  }
}
