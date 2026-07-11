import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { comparePassword } from '../../common/utils/password.util';
import { UserService } from '../user/user.service';
import { AuthResponseDto } from './dto/auth-response.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthUser } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AuthResponseDto> {
    const user = await this.userService.create(dto);
    return this.login({ id: user.id, email: user.email, name: user.name });
  }

  async validateUser(email: string, password: string): Promise<AuthUser> {
    const user = await this.userService.findByEmail(email);
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return { id: user.id, email: user.email, name: user.name };
  }

  login(user: AuthUser): AuthResponseDto {
    const accessToken = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
    return { accessToken };
  }
}
