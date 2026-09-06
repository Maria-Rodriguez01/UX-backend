import { Injectable } from '@nestjs/common';
import { Habit } from '@prisma/client';
import {
  addDays,
  dateKey,
  endOfMonth,
  parseFecha,
  startOfMonth,
  startOfWeek,
  toDayStart,
  todayStart,
} from '../common/date-utils.js';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class StatisticsService {
  constructor(private readonly prisma: PrismaService) {}

  async daily(usuarioId: string, fecha?: string) {
    const day = toDayStart(fecha ? parseFecha(fecha) : todayStart());

    const habits = await this.prisma.habit.findMany({
      where: { usuarioId, activo: true },
    });
    const expected = habits.filter((habit) => this.isCompletableOn(habit, day));

    const records = await this.prisma.record.findMany({
      where: { usuarioId, fecha: day, completado: true },
      select: { habitoId: true },
    });
    const completedIds = new Set(records.map((record) => record.habitoId));

    const habitsInfo = expected.map((habit) => ({
      id: habit.id,
      nombre: habit.nombre,
      completado: completedIds.has(habit.id),
    }));
    const completados = habitsInfo.filter((habit) => habit.completado).length;

    return {
      fecha: day,
      habitsCount: habitsInfo.length,
      completados,
      pendientes: habitsInfo.length - completados,
      habits: habitsInfo,
    };
  }

  async weekly(usuarioId: string, fecha?: string) {
    const anchor = toDayStart(fecha ? parseFecha(fecha) : todayStart());
    const inicio = startOfWeek(anchor);
    const fin = addDays(inicio, 6);
    const finInstant = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      fin.getDate(),
      23,
      59,
      59,
      999,
    );

    const habits = await this.prisma.habit.findMany({
      where: { usuarioId, activo: true },
    });
    const completedByHabit = await this.countCompletedDays(
      usuarioId,
      inicio,
      finInstant,
    );

    const habitsInfo = habits.map((habit) => ({
      id: habit.id,
      nombre: habit.nombre,
      completados: completedByHabit.get(habit.id) ?? 0,
      totalDias: this.overlapDays(habit, inicio, fin),
    }));

    return {
      inicio,
      fin,
      completados: habitsInfo.reduce((sum, h) => sum + h.completados, 0),
      totalDias: habitsInfo.reduce((sum, h) => sum + h.totalDias, 0),
      habits: habitsInfo,
    };
  }

  async monthly(usuarioId: string, fecha?: string) {
    const anchor = toDayStart(fecha ? parseFecha(fecha) : todayStart());
    const inicio = startOfMonth(anchor);
    const fin = endOfMonth(anchor);
    const finInstant = new Date(
      fin.getFullYear(),
      fin.getMonth(),
      fin.getDate(),
      23,
      59,
      59,
      999,
    );

    const habits = await this.prisma.habit.findMany({
      where: { usuarioId, activo: true },
    });
    const completedDaysByHabit = await this.completedDaysMap(
      usuarioId,
      inicio,
      finInstant,
    );

    const habitsInfo = habits.map((habit) => {
      const days = completedDaysByHabit.get(habit.id) ?? new Set<string>();
      const diasCompletados = [...days].sort();
      return {
        id: habit.id,
        nombre: habit.nombre,
        completados: diasCompletados.length,
        totalDias: this.overlapDays(habit, inicio, fin),
        diasCompletados,
      };
    });

    return {
      inicio,
      fin,
      completados: habitsInfo.reduce((sum, h) => sum + h.completados, 0),
      totalDias: habitsInfo.reduce((sum, h) => sum + h.totalDias, 0),
      habits: habitsInfo,
    };
  }

  private isCompletableOn(habit: Habit, day: Date): boolean {
    const start = toDayStart(habit.fechaInicio);
    if (start.getTime() > day.getTime()) {
      return false;
    }
    if (habit.fechaFin) {
      const end = toDayStart(habit.fechaFin);
      if (end.getTime() < day.getTime()) {
        return false;
      }
    }
    return true;
  }

  private overlapDays(habit: Habit, inicio: Date, fin: Date): number {
    const habitStart = toDayStart(habit.fechaInicio);
    const start = habitStart.getTime() > inicio.getTime() ? habitStart : inicio;
    const habitEnd = habit.fechaFin ? toDayStart(habit.fechaFin) : fin;
    const end = habitEnd.getTime() < fin.getTime() ? habitEnd : fin;
    if (end.getTime() < start.getTime()) {
      return 0;
    }
    return Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  }

  private async countCompletedDays(
    usuarioId: string,
    gte: Date,
    lte: Date,
  ): Promise<Map<string, number>> {
    const map = await this.completedDaysMap(usuarioId, gte, lte);
    const counts = new Map<string, number>();
    for (const [habitoId, days] of map) {
      counts.set(habitoId, days.size);
    }
    return counts;
  }

  private async completedDaysMap(
    usuarioId: string,
    gte: Date,
    lte: Date,
  ): Promise<Map<string, Set<string>>> {
    const records = await this.prisma.record.findMany({
      where: { usuarioId, fecha: { gte, lte }, completado: true },
      select: { habitoId: true, fecha: true },
    });

    const map = new Map<string, Set<string>>();
    for (const record of records) {
      const day = dateKey(record.fecha);
      const days = map.get(record.habitoId) ?? new Set<string>();
      days.add(day);
      map.set(record.habitoId, days);
    }
    return map;
  }
}