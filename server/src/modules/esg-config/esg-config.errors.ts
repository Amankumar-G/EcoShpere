import { BadRequestException, NotFoundException } from '@nestjs/common';

export class EsgConfigKeyNotFoundException extends NotFoundException {
  constructor(key: string) {
    super(`No config value or documented default exists for key "${key}"`);
  }
}

export class InvalidEsgWeightsException extends BadRequestException {
  constructor() {
    super('esg_weights must have e + s + g summing to 1');
  }
}
