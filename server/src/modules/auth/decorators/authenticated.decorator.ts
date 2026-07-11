import { applyDecorators, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

/**
 * Documentation: https://docs.nestjs.com/custom-decorators#decorator-composition
 */
export function Authenticated() {
  return applyDecorators(UseGuards(JwtAuthGuard));
}
