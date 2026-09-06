import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { AuthUser } from '../auth/strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { isValidDate, parseFecha, toDayStart } from '../common/date-utils.js';
import { StatisticsService } from './statistics.service.js';

function assertValidFecha(fecha?: string) {
  if (fecha === undefined) {
    return;
  }
  if (!isValidDate(toDayStart(parseFecha(fecha)))) {
    throw new BadRequestException('Fecha inválida');
  }
}

@Controller('statistics')
@UseGuards(JwtAuthGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('daily')
  daily(
    @Req() req: Request & { user: AuthUser },
    @Query('fecha') fecha?: string,
  ) {
    assertValidFecha(fecha);
    return this.statisticsService.daily(req.user.id, fecha);
  }

  @Get('weekly')
  weekly(
    @Req() req: Request & { user: AuthUser },
    @Query('fecha') fecha?: string,
  ) {
    assertValidFecha(fecha);
    return this.statisticsService.weekly(req.user.id, fecha);
  }

  @Get('monthly')
  monthly(
    @Req() req: Request & { user: AuthUser },
    @Query('fecha') fecha?: string,
  ) {
    assertValidFecha(fecha);
    return this.statisticsService.monthly(req.user.id, fecha);
  }
}