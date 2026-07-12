import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateBusinessTravelDto,
  UpdateBusinessTravelDto,
} from './dto/business-travel.dto';

@Injectable()
export class BusinessTravelService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateBusinessTravelDto) {
    return this.prisma.businessTravel.create({
      data: {
        employeeId: dto.employeeId,
        mode: dto.mode,
        origin: dto.origin ?? null,
        destination: dto.destination ?? null,
        distanceKm: dto.distanceKm ?? null,
        date: new Date(dto.date),
        purpose: dto.purpose ?? null,
      },
    });
  }

  findAll() {
    return this.prisma.businessTravel.findMany({ orderBy: { date: 'desc' } });
  }

  async findOne(id: number) {
    const travel = await this.prisma.businessTravel.findUnique({
      where: { id },
    });
    if (!travel) {
      throw new NotFoundException(`Business travel ${id} not found`);
    }
    return travel;
  }

  async update(id: number, dto: UpdateBusinessTravelDto) {
    await this.findOne(id);
    return this.prisma.businessTravel.update({
      where: { id },
      data: {
        mode: dto.mode,
        origin: dto.origin,
        destination: dto.destination,
        distanceKm: dto.distanceKm,
        date: dto.date ? new Date(dto.date) : undefined,
        purpose: dto.purpose,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.businessTravel.delete({ where: { id } });
  }
}
