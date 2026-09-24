import {
  BadRequestException,
  Controller,
  Get,
  Query,
  Req,
} from '@nestjs/common';

import type { Request } from 'express';

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
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('daily')
  daily(@Req() req: Request, @Query('fecha') fecha?: string) {
    assertValidFecha(fecha);

    return this.statisticsService.daily(req.user!.id!, fecha);
  }

  @Get('weekly')
  weekly(@Req() req: Request, @Query('fecha') fecha?: string) {
    assertValidFecha(fecha);

    return this.statisticsService.weekly(req.user!.id!, fecha);
  }

  @Get('monthly')
  monthly(@Req() req: Request, @Query('fecha') fecha?: string) {
    assertValidFecha(fecha);

    return this.statisticsService.monthly(req.user!.id!, fecha);
  }
  @Get('streaks')
  streaks(@Req() req: Request) {
    return this.statisticsService.streaks(req.user!.id!);
  }
}
