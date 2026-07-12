import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: ReturnType<typeof vi.fn> };

  const buildContext = (role: string): ExecutionContext => {
    const request = { user: { role } };
    return {
      getHandler: () => ({}),
      getClass: () => ({}),
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    reflector = { getAllAndOverride: vi.fn() };
    guard = new RolesGuard(reflector as unknown as Reflector);
  });

  it('allows the request when no roles metadata is present', () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);

    expect(guard.canActivate(buildContext('employee'))).toBe(true);
  });

  it('allows the request when the user role is in the allowed set', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin', 'manager']);

    expect(guard.canActivate(buildContext('manager'))).toBe(true);
  });

  it('rejects with a forbidden error when the user role is not allowed', () => {
    reflector.getAllAndOverride.mockReturnValue(['admin']);

    expect(() => guard.canActivate(buildContext('employee'))).toThrow(
      ForbiddenException,
    );
  });
});
