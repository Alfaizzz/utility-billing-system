import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tariff } from '../entities/tariff.entity';
import { CreateTariffDto } from './dto/create-tariff.dto';

@Injectable()
export class TariffsService {
  constructor(
    @InjectRepository(Tariff)
    private readonly tariffRepository: Repository<Tariff>,
  ) {}

  // API-08: Create Tariff (Admin Only)
  async createTariff(dto: CreateTariffDto) {
    // Deactivate previous active tariff for same connection type
    await this.tariffRepository.update(
      { connectionType: dto.connectionType, isActive: true },
      { isActive: false, effectiveTo: new Date(dto.effectiveFrom) },
    );

    const tariff = this.tariffRepository.create({
      connectionType: dto.connectionType,
      ratePerUnit: dto.ratePerUnit,
      fixedCharge: dto.fixedCharge,
      taxPercentage: dto.taxPercentage,
      effectiveFrom: new Date(dto.effectiveFrom),
      isActive: true,
    });

    const savedTariff = await this.tariffRepository.save(tariff);

    return {
      tariffId: savedTariff.id,
      connectionType: savedTariff.connectionType,
      ratePerUnit: Number(savedTariff.ratePerUnit),
      fixedCharge: Number(savedTariff.fixedCharge),
      taxPercentage: Number(savedTariff.taxPercentage),
      effectiveFrom: savedTariff.effectiveFrom,
      isActive: savedTariff.isActive,
    };
  }

  // API-09: Get Active Tariffs (Public / Authenticated)
  async getActiveTariffs() {
    const tariffs = await this.tariffRepository.find({
      where: { isActive: true },
      order: { connectionType: 'ASC' },
    });

    return tariffs.map((t) => ({
      tariffId: t.id,
      connectionType: t.connectionType,
      ratePerUnit: Number(t.ratePerUnit),
      fixedCharge: Number(t.fixedCharge),
      taxPercentage: Number(t.taxPercentage),
      effectiveFrom: t.effectiveFrom,
    }));
  }
}
