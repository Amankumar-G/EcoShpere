import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { EsgEvents } from '../../common/events/esg.events';
import type { EmployeeScoreChangedEvent } from '../../common/events/esg.events';
import { BadgesService } from './badges.service';

/**
 * Re-evaluates badge unlock rules whenever an employee's XP or points change
 * (CSR / challenge approvals emit these). Decouples the badge engine from the
 * Social / Gamification modules that award score.
 */
@Injectable()
export class BadgesListener {
  constructor(private readonly badgesService: BadgesService) {}

  @OnEvent(EsgEvents.EmployeeXpChanged)
  @OnEvent(EsgEvents.EmployeePointsChanged)
  async handleScoreChanged(event: EmployeeScoreChangedEvent): Promise<void> {
    await this.badgesService.evaluateForEmployee(event.employeeId);
  }
}
