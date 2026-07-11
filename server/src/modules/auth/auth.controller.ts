import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Authenticated } from './decorators/authenticated.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import type { AuthUser } from './interfaces/jwt-payload.interface';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.authService.validateUser(dto.email, dto.password);
    return this.authService.login(user);
  }

  @Get('me')
  @Authenticated()
  me(@CurrentUser() user: AuthUser): AuthUser {
    return user;
  }

  /**
   * JWTs are stateless, so logout is a client-side token discard. This
   * endpoint exists to confirm the token is valid and give clients a
   * single place to call when signing out.
   */
  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Authenticated()
  logout(): void {}
}
