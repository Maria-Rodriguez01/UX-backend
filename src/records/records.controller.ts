import { Body, Controller, Get, Post, Query, Req } from '@nestjs/common';

import type { Request } from 'express';

import { CreateRecordDto } from './dto/create-record.dto.js';
import { QueryRecordDto } from './dto/query-record.dto.js';
import { RecordsService } from './records.service.js';

@Controller('records')
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@Req() req: Request, @Body() createRecordDto: CreateRecordDto) {
    return this.recordsService.create(req.user!.id!, createRecordDto);
  }

  @Get()
  findAll(@Req() req: Request, @Query() query: QueryRecordDto) {
    return this.recordsService.findAll(req.user!.id!, query);
  }
}
