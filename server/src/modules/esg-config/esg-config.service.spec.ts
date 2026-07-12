import { Test, TestingModule } from '@nestjs/testing';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { PrismaService } from '../../prisma/prisma.service';
import { EsgConfigService } from './esg-config.service';
import { InvalidEsgWeightsException } from './esg-config.errors';

describe('EsgConfigService', () => {
  let service: EsgConfigService;
  let prisma: {
    esgConfig: {
      findUnique: ReturnType<typeof vi.fn>;
      upsert: ReturnType<typeof vi.fn>;
      createMany: ReturnType<typeof vi.fn>;
    };
  };

  beforeEach(async () => {
    prisma = {
      esgConfig: {
        findUnique: vi.fn(),
        upsert: vi.fn(),
        createMany: vi.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EsgConfigService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<EsgConfigService>(EsgConfigService);
  });

  describe('get', () => {
    it('returns a stored boolean as a real boolean, not a JSON string', async () => {
      prisma.esgConfig.findUnique.mockResolvedValue({
        key: 'badge_auto_award',
        value: true,
      });

      const result = await service.get<boolean>('badge_auto_award');

      expect(result).toBe(true);
      expect(typeof result).toBe('boolean');
    });

    it('returns a stored number as a real number', async () => {
      prisma.esgConfig.findUnique.mockResolvedValue({
        key: 'weekly_office_attendance',
        value: 5,
      });

      const result = await service.get<number>('weekly_office_attendance');

      expect(result).toBe(5);
      expect(typeof result).toBe('number');
    });

    it('returns a stored esg_weights value as a real object', async () => {
      const weights = { e: 0.5, s: 0.25, g: 0.25 };
      prisma.esgConfig.findUnique.mockResolvedValue({
        key: 'esg_weights',
        value: weights,
      });

      const result = await service.get<typeof weights>('esg_weights');

      expect(result).toEqual(weights);
    });

    it('returns the documented default when the key is unknown to the store', async () => {
      prisma.esgConfig.findUnique.mockResolvedValue(null);

      const result = await service.get<boolean>('auto_emission_calculation');

      expect(result).toBe(false);
    });

    it('throws a clean error for a key with no stored value and no documented default', async () => {
      prisma.esgConfig.findUnique.mockResolvedValue(null);

      await expect(service.get('totally_unknown_key')).rejects.toThrow();
    });
  });

  describe('set', () => {
    it('persists a value and returns the persisted value', async () => {
      prisma.esgConfig.upsert.mockResolvedValue({
        key: 'weekly_office_attendance',
        value: 4,
      });

      const result = await service.set('weekly_office_attendance', 4);

      expect(result).toBe(4);
      expect(prisma.esgConfig.upsert).toHaveBeenCalledWith({
        where: { key: 'weekly_office_attendance' },
        create: { key: 'weekly_office_attendance', value: 4 },
        update: { value: 4 },
      });
    });

    it('rejects esg_weights when e + s + g do not sum to 1', async () => {
      await expect(
        service.set('esg_weights', { e: 0.5, s: 0.3, g: 0.3 }),
      ).rejects.toThrow(InvalidEsgWeightsException);
      expect(prisma.esgConfig.upsert).not.toHaveBeenCalled();
    });

    it('accepts esg_weights when e + s + g sum to 1', async () => {
      const weights = { e: 0.4, s: 0.3, g: 0.3 };
      prisma.esgConfig.upsert.mockResolvedValue({
        key: 'esg_weights',
        value: weights,
      });

      await expect(service.set('esg_weights', weights)).resolves.toEqual(
        weights,
      );
    });
  });

  describe('seedDefaults', () => {
    it('upserts every documented default key using create-only-if-absent semantics', async () => {
      prisma.esgConfig.createMany.mockResolvedValue({ count: 9 });

      await service.seedDefaults();

      expect(prisma.esgConfig.createMany).toHaveBeenCalledWith(
        expect.objectContaining({ skipDuplicates: true }),
      );
      const call = prisma.esgConfig.createMany.mock.calls[0][0];
      const keys = call.data.map((entry: { key: string }) => entry.key);
      expect(keys).toEqual(
        expect.arrayContaining([
          'auto_emission_calculation',
          'evidence_required_for_approval',
          'badge_auto_award',
          'esg_weights',
          'weekly_office_attendance',
          'e_pillar_sub_weights',
          'g_pillar_sub_weights',
          'compliance_severity_weights',
          'penalty_constants',
        ]),
      );
    });

    it('is idempotent: re-running relies on skipDuplicates so customized values are not overwritten', async () => {
      prisma.esgConfig.createMany.mockResolvedValue({ count: 0 });

      await service.seedDefaults();
      await service.seedDefaults();

      expect(prisma.esgConfig.createMany).toHaveBeenCalledTimes(2);
      for (const call of prisma.esgConfig.createMany.mock.calls) {
        expect(call[0].skipDuplicates).toBe(true);
      }
    });
  });
});
