import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import * as passwordUtil from '../../common/utils/password.util';
import { UserService } from '../user/user.service';
import { AuthService } from './auth.service';

vi.mock('../../common/utils/password.util', () => ({
  comparePassword: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let userService: { create: ReturnType<typeof vi.fn>; findByEmail: ReturnType<typeof vi.fn> };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    userService = {
      create: vi.fn(),
      findByEmail: vi.fn(),
    };
    jwtService = {
      sign: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: userService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates the user then logs them in', async () => {
      userService.create.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
      });
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.register({
        email: 'jane@example.com',
        password: 'plain-password',
        name: 'Jane',
      });

      expect(userService.create).toHaveBeenCalledWith({
        email: 'jane@example.com',
        password: 'plain-password',
        name: 'Jane',
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'jane@example.com',
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });

  describe('validateUser', () => {
    it('returns the auth user when credentials match', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
        passwordHash: 'hashed-password',
      });
      vi.mocked(passwordUtil.comparePassword).mockResolvedValue(true);

      const result = await service.validateUser(
        'jane@example.com',
        'plain-password',
      );

      expect(passwordUtil.comparePassword).toHaveBeenCalledWith(
        'plain-password',
        'hashed-password',
      );
      expect(result).toEqual({
        id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
      });
    });

    it('throws when the user does not exist', async () => {
      userService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('jane@example.com', 'plain-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when the password does not match', async () => {
      userService.findByEmail.mockResolvedValue({
        id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
        passwordHash: 'hashed-password',
      });
      vi.mocked(passwordUtil.comparePassword).mockResolvedValue(false);

      await expect(
        service.validateUser('jane@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('signs a jwt for the given user', () => {
      jwtService.sign.mockReturnValue('signed-token');

      const result = service.login({
        id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'jane@example.com',
      });
      expect(result).toEqual({ accessToken: 'signed-token' });
    });
  });
});
