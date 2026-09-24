import { Injectable } from '@nestjs/common';

import { Habit, HabitFrecuencia } from '@prisma/client';

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
      where: {
        usuarioId,
        activo: true,
        eliminado: false,
      },
    });

    const expected = habits.filter((habit) => this.isCompletableOn(habit, day));

    const records = await this.prisma.record.findMany({
      where: {
        usuarioId,
        fecha: day,
        completado: true,
      },

      select: {
        habitoId: true,
      },
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
      where: {
        usuarioId,
        activo: true,
        eliminado: false,
      },
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

      completados: habitsInfo.reduce(
        (sum, habit) => sum + habit.completados,
        0,
      ),

      totalDias: habitsInfo.reduce((sum, habit) => sum + habit.totalDias, 0),

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
      where: {
        usuarioId,
        activo: true,
        eliminado: false,
      },
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

      completados: habitsInfo.reduce(
        (sum, habit) => sum + habit.completados,
        0,
      ),

      totalDias: habitsInfo.reduce((sum, habit) => sum + habit.totalDias, 0),

      habits: habitsInfo,
    };
  }

  async streaks(usuarioId: string) {
    const dailyHabits = await this.getCompletedDatesByHabit(usuarioId, 'daily');

    const weeklyHabits = await this.getCompletedDatesByHabit(
      usuarioId,
      'weekly',
    );

    const monthlyHabits = await this.getCompletedDatesByHabit(
      usuarioId,
      'monthly',
    );

    return {
      daily: this.getBestHabitStreak(dailyHabits, 'daily'),

      weekly: this.getBestHabitStreak(weeklyHabits, 'weekly'),

      monthly: this.getBestHabitStreak(monthlyHabits, 'monthly'),
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
      where: {
        usuarioId,

        fecha: {
          gte,
          lte,
        },

        completado: true,
      },

      select: {
        habitoId: true,
        fecha: true,
      },
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

  private async getCompletedDatesByHabit(
    usuarioId: string,
    frecuencia: HabitFrecuencia,
  ) {
    const habits = await this.prisma.habit.findMany({
      where: {
        usuarioId,
        frecuencia,
      },

      include: {
        records: {
          orderBy: {
            fecha: 'asc',
          },
        },
      },
    });

    return habits.map((habit) => {
      const completedDates = habit.records
        .filter((record) => record.completado)
        .map((record) => record.fecha);

      return {
        habitId: habit.id,

        nombre: habit.nombre,

        dates: completedDates,
      };
    });
  }

  private getBestHabitStreak(
    habits: {
      habitId: string;
      nombre: string;
      dates: Date[];
    }[],

    type: 'daily' | 'weekly' | 'monthly',
  ) {
    let bestCurrent = {
      value: 0,

      habitId: null as string | null,

      habitName: null as string | null,
    };

    let bestHistorical = {
      value: 0,

      habitId: null as string | null,

      habitName: null as string | null,
    };

    for (const habit of habits) {
      let streak: {
        current: number;
        best: number;
      };

      if (type === 'daily') {
        streak = this.calculateDailyStreak(habit.dates);
      } else if (type === 'weekly') {
        streak = this.calculateWeeklyStreak(habit.dates);
      } else {
        streak = this.calculateMonthlyStreak(habit.dates);
      }

      if (streak.current > bestCurrent.value) {
        bestCurrent = {
          value: streak.current,

          habitId: habit.habitId,

          habitName: habit.nombre,
        };
      }

      if (streak.best > bestHistorical.value) {
        bestHistorical = {
          value: streak.best,

          habitId: habit.habitId,

          habitName: habit.nombre,
        };
      }
    }

    return {
      current: bestCurrent,
      best: bestHistorical,
    };
  }

  private calculateDailyStreak(dates: Date[]) {
    if (dates.length === 0) {
      return {
        current: 0,
        best: 0,
      };
    }

    const uniqueDays = [...new Set(dates.map((date) => dateKey(date)))].sort();

    let best = 1;

    let currentStreak = 1;

    for (let i = 1; i < uniqueDays.length; i++) {
      const previous = parseFecha(uniqueDays[i - 1]);

      const current = parseFecha(uniqueDays[i]);

      const difference = Math.round(
        (current.getTime() - previous.getTime()) / 86400000,
      );

      if (difference === 1) {
        currentStreak++;
      } else {
        currentStreak = 1;
      }

      best = Math.max(best, currentStreak);
    }

    const today = todayStart();

    const lastDay = parseFecha(uniqueDays[uniqueDays.length - 1]);

    const daysSinceLast = Math.round(
      (today.getTime() - lastDay.getTime()) / 86400000,
    );

    const current = daysSinceLast === 0 ? currentStreak : 0;

    return {
      current,
      best,
    };
  }

  private calculateWeeklyStreak(dates: Date[]) {
    if (dates.length === 0) {
      return {
        current: 0,
        best: 0,
      };
    }

    const weeks = [
      ...new Set(dates.map((date) => this.getWeekKey(date))),
    ].sort();

    let best = 1;

    let streak = 1;

    for (let i = 1; i < weeks.length; i++) {
      const previous = this.getWeekStartFromKey(weeks[i - 1]);

      const current = this.getWeekStartFromKey(weeks[i]);

      const difference = Math.round(
        (current.getTime() - previous.getTime()) / (86400000 * 7),
      );

      if (difference === 1) {
        streak++;
      } else {
        streak = 1;
      }

      best = Math.max(best, streak);
    }

    const currentWeek = this.getWeekKey(todayStart());

    const lastWeek = weeks[weeks.length - 1];

    const current = lastWeek === currentWeek ? streak : 0;

    return {
      current,
      best,
    };
  }

  private calculateMonthlyStreak(dates: Date[]) {
    if (dates.length === 0) {
      return {
        current: 0,
        best: 0,
      };
    }

    const months = [
      ...new Set(
        dates.map(
          (date) =>
            `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
              2,
              '0',
            )}`,
        ),
      ),
    ].sort();

    let best = 1;

    let streak = 1;

    for (let i = 1; i < months.length; i++) {
      const [previousYear, previousMonth] = months[i - 1]
        .split('-')
        .map(Number);

      const [currentYear, currentMonth] = months[i].split('-').map(Number);

      const previousValue = previousYear * 12 + previousMonth;

      const currentValue = currentYear * 12 + currentMonth;

      if (currentValue - previousValue === 1) {
        streak++;
      } else {
        streak = 1;
      }

      best = Math.max(best, streak);
    }

    const today = todayStart();

    const currentMonth = `${today.getFullYear()}-${String(
      today.getMonth() + 1,
    ).padStart(2, '0')}`;

    const lastMonth = months[months.length - 1];

    const current = lastMonth === currentMonth ? streak : 0;

    return {
      current,
      best,
    };
  }

  private getWeekKey(date: Date): string {
    const weekStart = startOfWeek(toDayStart(date));

    return dateKey(weekStart);
  }

  private getWeekStartFromKey(key: string): Date {
    return parseFecha(key);
  }
}
