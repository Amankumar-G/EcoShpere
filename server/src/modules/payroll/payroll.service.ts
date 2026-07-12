import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreatePayrollContractDto,
  UpdatePayrollContractDto,
} from './dto/payroll.dto';

@Injectable()
export class PayrollService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreatePayrollContractDto) {
    return this.prisma.payrollContract.create({
      data: {
        employeeId: dto.employeeId,
        jobPosition: dto.jobPosition,
        contractType: dto.contractType,
        leadershipLevel: dto.leadershipLevel ?? null,
        country: dto.country ?? null,
        wage: dto.wage,
        startDate: new Date(dto.startDate),
        endDate: dto.endDate ? new Date(dto.endDate) : null,
      },
    });
  }

  findAll() {
    return this.prisma.payrollContract.findMany({
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: number) {
    const contract = await this.prisma.payrollContract.findUnique({
      where: { id },
    });
    if (!contract) {
      throw new NotFoundException(`Payroll contract ${id} not found`);
    }
    return contract;
  }

  async update(id: number, dto: UpdatePayrollContractDto) {
    await this.findOne(id);
    return this.prisma.payrollContract.update({
      where: { id },
      data: {
        jobPosition: dto.jobPosition,
        contractType: dto.contractType,
        leadershipLevel: dto.leadershipLevel,
        country: dto.country,
        wage: dto.wage,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.payrollContract.delete({ where: { id } });
  }
}
