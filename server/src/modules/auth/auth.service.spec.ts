import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import * as passwordUtil from '../../common/utils/password.util';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from './auth.service';

vi.mock('../../common/utils/password.util', () => ({
  comparePassword: vi.fn(),
  hashPassword: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    employee: {
      create: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };
  let jwtService: { sign: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    prisma = {
      employee: {
        create: vi.fn(),
        findUnique: vi.fn(),
      },
    };
    jwtService = {
      sign: vi.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('creates the employee then logs them in', async () => {
      vi.mocked(passwordUtil.hashPassword).mockResolvedValue('hashed-password');
      prisma.employee.create.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
        name: 'Jane',
        role: 'employee',
        departmentId: null,
      });
      jwtService.sign.mockReturnValue('signed-token');

      const result = await service.register({
        email: 'jane@example.com',
        password: 'plain-password',
        name: 'Jane',
      });

      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('plain-password');
      expect(prisma.employee.create).toHaveBeenCalledWith({
        data: {
          email: 'jane@example.com',
          name: 'Jane',
          passwordHash: 'hashed-password',
        },
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'jane@example.com',
        role: 'employee',
        departmentId: null,
      });
      expect(result).toEqual({ accessToken: 'signed-token', role: 'employee' });
    });
  });

  describe('validateUser', () => {
    it('returns the auth user when credentials match', async () => {
      prisma.employee.findUnique.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
        name: 'Jane',
        passwordHash: 'hashed-password',
        role: 'manager',
        departmentId: 5,
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
        id: 1,
        email: 'jane@example.com',
        name: 'Jane',
        role: 'manager',
        departmentId: 5,
      });
    });

    it('throws when the employee does not exist', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);

      await expect(
        service.validateUser('jane@example.com', 'plain-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws when the password does not match', async () => {
      prisma.employee.findUnique.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
        name: 'Jane',
        passwordHash: 'hashed-password',
        role: 'employee',
        departmentId: null,
      });
      vi.mocked(passwordUtil.comparePassword).mockResolvedValue(false);

      await expect(
        service.validateUser('jane@example.com', 'wrong-password'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects unknown email and wrong password identically', async () => {
      prisma.employee.findUnique.mockResolvedValue(null);
      const unknownEmailError = await service
        .validateUser('missing@example.com', 'whatever')
        .catch((error: unknown) => error);

      prisma.employee.findUnique.mockResolvedValue({
        id: 1,
        email: 'jane@example.com',
        passwordHash: 'hashed-password',
      });
      vi.mocked(passwordUtil.comparePassword).mockResolvedValue(false);
      const wrongPasswordError = await service
        .validateUser('jane@example.com', 'wrong-password')
        .catch((error: unknown) => error);

      expect(unknownEmailError).toBeInstanceOf(UnauthorizedException);
      expect(wrongPasswordError).toBeInstanceOf(UnauthorizedException);
      expect((unknownEmailError as UnauthorizedException).message).toBe(
        (wrongPasswordError as UnauthorizedException).message,
      );
    });
  });

  describe('login', () => {
    it('signs a jwt carrying the role and departmentId', () => {
      jwtService.sign.mockReturnValue('signed-token');

      const result = service.login({
        id: 1,
        email: 'jane@example.com',
        name: 'Jane',
        role: 'admin',
        departmentId: 3,
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: 'jane@example.com',
        role: 'admin',
        departmentId: 3,
      });
      expect(result).toEqual({ accessToken: 'signed-token', role: 'admin' });
    });
  });
});
