import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuthUser, JwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthUser> {
    const employee = await this.prisma.employee.findUnique({
      where: { id: payload.sub },
      include: { department: { select: { name: true } } },
    });
    return {
      id: payload.sub,
      email: payload.email,
      name: employee?.name ?? null,
      role: payload.role,
      departmentId: employee?.departmentId ?? payload.departmentId,
      departmentName: employee?.department?.name ?? null,
      xp: employee?.xp ?? 0,
      points: employee?.points ?? 0,
    };
  }
}
