import { Role } from '@prisma/client';

export class AuthResponseDto {
  accessToken: string;
  role: Role;
}
