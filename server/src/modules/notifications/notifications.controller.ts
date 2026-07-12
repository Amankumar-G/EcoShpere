import { Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Authenticated } from '../auth/decorators/authenticated.decorator';
import type { AuthUser } from '../auth/interfaces/jwt-payload.interface';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@Authenticated()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  list(@CurrentUser() actor: AuthUser) {
    return this.notificationsService.list(actor);
  }

  @Patch(':id/read')
  markRead(
    @CurrentUser() actor: AuthUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markRead(actor, id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() actor: AuthUser) {
    return this.notificationsService.markAllRead(actor);
  }
}
