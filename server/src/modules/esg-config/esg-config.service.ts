import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ESG_CONFIG_DEFAULTS } from './esg-config.defaults';
import {
  EsgConfigKeyNotFoundException,
  InvalidEsgWeightsException,
} from './esg-config.errors';

const ESG_WEIGHTS_KEY = 'esg_weights';
const WEIGHT_SUM_TOLERANCE = 1e-9;

interface EsgWeights {
  e: number;
  s: number;
  g: number;
}

@Injectable()
export class EsgConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get<T>(key: string): Promise<T> {
    const record = await this.prisma.esgConfig.findUnique({ where: { key } });
    if (record) {
      return record.value as T;
    }
    if (key in ESG_CONFIG_DEFAULTS) {
      return ESG_CONFIG_DEFAULTS[key] as T;
    }
    throw new EsgConfigKeyNotFoundException(key);
  }

  async set<T>(key: string, value: T): Promise<T> {
    if (key === ESG_WEIGHTS_KEY) {
      assertEsgWeightsSumToOne(value);
    }
    const record = await this.prisma.esgConfig.upsert({
      where: { key },
      create: { key, value: value as Prisma.InputJsonValue },
      update: { value: value as Prisma.InputJsonValue },
    });
    return record.value as T;
  }

  async seedDefaults(): Promise<void> {
    await this.prisma.esgConfig.createMany({
      data: Object.entries(ESG_CONFIG_DEFAULTS).map(([key, value]) => ({
        key,
        value: value as Prisma.InputJsonValue,
      })),
      skipDuplicates: true,
    });
  }
}

function assertEsgWeightsSumToOne(value: unknown): asserts value is EsgWeights {
  if (!isEsgWeights(value)) {
    throw new InvalidEsgWeightsException();
  }
  const sum = value.e + value.s + value.g;
  if (Math.abs(sum - 1) > WEIGHT_SUM_TOLERANCE) {
    throw new InvalidEsgWeightsException();
  }
}

function isEsgWeights(value: unknown): value is EsgWeights {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as EsgWeights).e === 'number' &&
    typeof (value as EsgWeights).s === 'number' &&
    typeof (value as EsgWeights).g === 'number'
  );
}
