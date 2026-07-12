import { Injectable } from '@nestjs/common';
import { EmissionSourceType } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from '../esg-config/esg-config.service';
import { FleetCommutingRunResultDto } from './dto/fleet-commuting-run-result.dto';

const WEEKLY_OFFICE_ATTENDANCE_KEY = 'weekly_office_attendance';
const DAYS_PER_WEEK = 7;

interface Period {
  start: Date;
  end: Date;
  weeksInPeriod: number;
}

/**
 * Path B — batch-computes commuting emissions for every active FleetVehicle
 * assignment over a given month. Directly uses FleetVehicleModel.co2Emissions
 * (no EmissionFactor involved). Idempotent per (employee, period): rerunning
 * a period replaces that employee's prior fleet-commuting rows for it.
 */
@Injectable()
export class FleetCommutingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly esgConfig: EsgConfigService,
  ) {}

  async run(periodString: string): Promise<FleetCommutingRunResultDto> {
    const period = parsePeriod(periodString);
    const weeklyOfficeAttendance = await this.esgConfig.get<number>(
      WEEKLY_OFFICE_ATTENDANCE_KEY,
    );

    const vehicles = await this.prisma.fleetVehicle.findMany({
      where: {
        startDate: { lte: period.end },
        OR: [{ endDate: null }, { endDate: { gte: period.start } }],
      },
      include: { employee: true, model: true },
    });

    let employeesProcessed = 0;
    let employeesSkipped = 0;
    let totalCo2eValue = 0;

    for (const vehicle of vehicles) {
      const homeWorkDistance = vehicle.employee.homeWorkDistance;
      if (homeWorkDistance === null) {
        employeesSkipped += 1;
        continue;
      }

      const roundTripKm = Number(homeWorkDistance) * 2;
      const totalKm = roundToFourDecimals(
        weeklyOfficeAttendance * period.weeksInPeriod * roundTripKm,
      );
      const co2eValue = roundToFourDecimals(
        totalKm * Number(vehicle.model.co2Emissions),
      );

      await this.prisma.emittedEmission.deleteMany({
        where: {
          sourceType: EmissionSourceType.fleet_commuting,
          employeeId: vehicle.employeeId,
          periodStart: period.start,
        },
      });
      await this.prisma.emittedEmission.create({
        data: {
          name: `Fleet commuting — ${vehicle.employee.name} — ${periodString}`,
          sourceType: EmissionSourceType.fleet_commuting,
          sourceRefId: vehicle.id,
          employeeId: vehicle.employeeId,
          departmentId: vehicle.employee.departmentId,
          quantity: totalKm,
          co2eValue,
          periodStart: period.start,
          periodEnd: period.end,
          date: period.end,
        },
      });

      employeesProcessed += 1;
      totalCo2eValue += co2eValue;
    }

    return {
      period: periodString,
      employeesProcessed,
      employeesSkipped,
      totalCo2eValue,
    };
  }
}

function roundToFourDecimals(value: number): number {
  return Math.round(value * 10000) / 10000;
}

function parsePeriod(periodString: string): Period {
  const [yearStr, monthStr] = periodString.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 0));
  const daysInMonth = end.getUTCDate();
  return { start, end, weeksInPeriod: daysInMonth / DAYS_PER_WEEK };
}
