import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import * as passwordUtil from '../../common/utils/password.util';
import { UserService } from './user.service';

vi.mock('../../common/utils/password.util', () => ({
  hashPassword: vi.fn(),
}));

describe('UserService', () => {
  let service: UserService;
  let prisma: {
    user: {
      create: ReturnType<typeof vi.fn>;
      findMany: ReturnType<typeof vi.fn>;
      findUnique: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      user: {
        create: vi.fn(),
        findMany: vi.fn(),
        findUnique: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('hashes the password and creates the user with public fields only', async () => {
      vi.mocked(passwordUtil.hashPassword).mockResolvedValue('hashed-password');
      const createdUser = {
        id: 'user-1',
        email: 'jane@example.com',
        name: 'Jane',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      prisma.user.create.mockResolvedValue(createdUser);

      const result = await service.create({
        email: 'jane@example.com',
        password: 'plain-password',
        name: 'Jane',
      });

      expect(passwordUtil.hashPassword).toHaveBeenCalledWith('plain-password');
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: 'jane@example.com',
          name: 'Jane',
          passwordHash: 'hashed-password',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toBe(createdUser);
    });
  });

  describe('findAll', () => {
    it('returns users with public fields only', () => {
      const users = [{ id: 'user-1', email: 'jane@example.com' }];
      prisma.user.findMany.mockResolvedValue(users);

      const result = service.findAll();

      expect(prisma.user.findMany).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).resolves.toBe(users);
    });
  });

  describe('findOne', () => {
    it('finds a user by id with public fields only', () => {
      const user = { id: 'user-1', email: 'jane@example.com' };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = service.findOne('user-1');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).resolves.toBe(user);
    });
  });

  describe('findByEmail', () => {
    it('finds a user by email including sensitive fields', () => {
      const user = {
        id: 'user-1',
        email: 'jane@example.com',
        passwordHash: 'x',
      };
      prisma.user.findUnique.mockResolvedValue(user);

      const result = service.findByEmail('jane@example.com');

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(result).resolves.toBe(user);
    });
  });
});
