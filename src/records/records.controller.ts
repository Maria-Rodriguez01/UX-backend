import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { AuthUser } from '../auth/strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateRecordDto } from './dto/create-record.dto.js';
import { QueryRecordDto } from './dto/query-record.dto.js';
import { RecordsService } from './records.service.js';

@Controller('records')
@UseGuards(JwtAuthGuard)
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() createRecordDto: CreateRecordDto,
  ) {
    return this.recordsService.create(req.user.id, createRecordDto);
  }

  @Get()
  findAll(
    @Req() req: Request & { user: AuthUser },
    @Query() query: QueryRecordDto,
  ) {
    return this.recordsService.findAll(req.user.id, query);
  }
}