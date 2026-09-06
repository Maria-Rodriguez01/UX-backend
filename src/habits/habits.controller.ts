import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import type { AuthUser } from '../auth/strategies/jwt.strategy.js';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';
import { HabitsService } from './habits.service.js';

@Controller('habits')
@UseGuards(JwtAuthGuard)
export class HabitsController {
  constructor(private readonly habitsService: HabitsService) {}

  @Post()
  create(@Req() req: Request & { user: AuthUser }, @Body() createHabitDto: CreateHabitDto) {
    return this.habitsService.create(req.user.id, createHabitDto);
  }

  @Get()
  findAll(@Req() req: Request & { user: AuthUser }) {
    return this.habitsService.findAll(req.user.id);
  }

  @Get(':id')
  findOne(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.habitsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  update(
    @Req() req: Request & { user: AuthUser },
    @Param('id') id: string,
    @Body() updateHabitDto: UpdateHabitDto,
  ) {
    return this.habitsService.update(req.user.id, id, updateHabitDto);
  }

  @Delete(':id')
  remove(@Req() req: Request & { user: AuthUser }, @Param('id') id: string) {
    return this.habitsService.remove(req.user.id, id);
  }
}