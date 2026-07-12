import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CsvImportResult,
  importRows,
  parseCsv,
} from '../../common/csv/csv-import';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateFleetModelDto,
  CreateFleetVehicleDto,
  UpdateFleetModelDto,
  UpdateFleetVehicleDto,
} from './dto/fleet.dto';

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Vehicle models ────────────────────────────────────────────────────────

  createModel(dto: CreateFleetModelDto) {
    return this.prisma.fleetVehicleModel.create({ data: dto });
  }

  findAllModels() {
    return this.prisma.fleetVehicleModel.findMany({ orderBy: { name: 'asc' } });
  }

  async findModel(id: number) {
    const model = await this.prisma.fleetVehicleModel.findUnique({
      where: { id },
    });
    if (!model) {
      throw new NotFoundException(`Fleet model ${id} not found`);
    }
    return model;
  }

  async updateModel(id: number, dto: UpdateFleetModelDto) {
    await this.findModel(id);
    return this.prisma.fleetVehicleModel.update({ where: { id }, data: dto });
  }

  async removeModel(id: number) {
    await this.findModel(id);
    return this.prisma.fleetVehicleModel.delete({ where: { id } });
  }

  /** Bulk-create vehicle models from CSV columns: name, co2Emissions, status?. */
  importModelsCsv(csv: string): Promise<CsvImportResult> {
    const rows = parseCsv(csv);
    return importRows(rows, async (row) => {
      if (!row.name) {
        throw new Error('name is required');
      }
      const co2Emissions = Number(row.co2Emissions);
      if (!Number.isFinite(co2Emissions) || co2Emissions < 0) {
        throw new Error('co2Emissions must be a non-negative number');
      }
      await this.prisma.fleetVehicleModel.create({
        data: {
          name: row.name,
          co2Emissions,
          status: row.status || 'active',
        },
      });
    });
  }

  // ── Vehicle assignments ───────────────────────────────────────────────────

  async createVehicle(dto: CreateFleetVehicleDto) {
    await this.findModel(dto.modelId);
    if (!dto.endDate) {
      await this.assertNoActiveVehicle(dto.employeeId);
    }
    return this.prisma.fleetVehicle.create({
      data: {
        employeeId: dto.employeeId,
        modelId: dto.modelId,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  findAllVehicles() {
    return this.prisma.fleetVehicle.findMany({
      orderBy: { startDate: 'desc' },
      include: { model: true },
    });
  }

  async findVehicle(id: number) {
    const vehicle = await this.prisma.fleetVehicle.findUnique({
      where: { id },
      include: { model: true },
    });
    if (!vehicle) {
      throw new NotFoundException(`Fleet vehicle ${id} not found`);
    }
    return vehicle;
  }

  async updateVehicle(id: number, dto: UpdateFleetVehicleDto) {
    await this.findVehicle(id);
    if (dto.modelId) {
      await this.findModel(dto.modelId);
    }
    return this.prisma.fleetVehicle.update({
      where: { id },
      data: {
        modelId: dto.modelId,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async removeVehicle(id: number) {
    await this.findVehicle(id);
    return this.prisma.fleetVehicle.delete({ where: { id } });
  }

  /** An employee may have only one active (open-ended) vehicle at a time. */
  private async assertNoActiveVehicle(employeeId: number) {
    const active = await this.prisma.fleetVehicle.findFirst({
      where: { employeeId, endDate: null },
    });
    if (active) {
      throw new ConflictException(
        `Employee ${employeeId} already has an active vehicle (id ${active.id})`,
      );
    }
  }
}
