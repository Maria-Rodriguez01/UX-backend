import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';

import type { Request } from 'express';

import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';
import { HabitsService } from './habits.service.js';

@Controller('habits')
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Req() req: Request, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(req.user!.id!, createHabitDto);
  }

  @Get()
  findAll(@Req() req: Request) {
    return this.habitsService.findAll(req.user!.id!);
  }

  @Get(':id')
  findOne(@Req() req: Request, @Param('id') id: string) {
    return this.habitsService.findOne(req.user!.id!, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ) {
    return this.habitsService.update(req.user!.id!, id, updateHabitDto);
  }

  @Delete(':id')
  remove(@Req() req: Request, @Param('id') id: string) {
    return this.habitsService.remove(req.user!.id!, id);
  }
}
