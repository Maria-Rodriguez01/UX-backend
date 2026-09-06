import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateHabitDto } from './dto/create-habit.dto.js';
import { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(usuarioId: string, createHabitDto: CreateHabitDto) {
    return this.prisma.habit.create({
      data: {
        nombre: createHabitDto.nombre,
        descripcion: createHabitDto.descripcion ?? undefined,
        categoria: createHabitDto.categoria ?? undefined,
        frecuencia: createHabitDto.frecuencia,
        prioridad: createHabitDto.prioridad,
        fechaInicio: new Date(createHabitDto.fechaInicio),
        fechaFin: createHabitDto.fechaFin
          ? new Date(createHabitDto.fechaFin)
          : null,
        activo: createHabitDto.activo ?? true,
        usuario: {
          connect: { id: usuarioId },
        },
      },
    });
  }

  findAll(usuarioId: string) {
    return this.prisma.habit.findMany({
      where: { usuarioId },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const habit = await this.prisma.habit.findFirst({
      where: { id, usuarioId },
    });
    if (!habit) {
      throw new NotFoundException('Hábito no encontrado');
    }
    return habit;
  }

  async update(usuarioId: string, id: string, updateHabitDto: UpdateHabitDto) {
    const data: Prisma.HabitUpdateManyMutationInput = {};
    if (updateHabitDto.nombre !== undefined) {
      data.nombre = updateHabitDto.nombre;
    }
    if (updateHabitDto.descripcion !== undefined) {
      data.descripcion = updateHabitDto.descripcion;
    }
    if (updateHabitDto.categoria !== undefined) {
      data.categoria = updateHabitDto.categoria;
    }
    if (updateHabitDto.frecuencia !== undefined) {
      data.frecuencia = updateHabitDto.frecuencia;
    }
    if (updateHabitDto.prioridad !== undefined) {
      data.prioridad = updateHabitDto.prioridad;
    }
    if (updateHabitDto.fechaInicio !== undefined) {
      data.fechaInicio = new Date(updateHabitDto.fechaInicio);
    }
    if (updateHabitDto.fechaFin !== undefined) {
      data.fechaFin = updateHabitDto.fechaFin
        ? new Date(updateHabitDto.fechaFin)
        : null;
    }
    if (updateHabitDto.activo !== undefined) {
      data.activo = updateHabitDto.activo;
    }

    const result = await this.prisma.habit.updateMany({
      where: { id, usuarioId },
      data,
    });
    if (result.count === 0) {
      throw new NotFoundException('Hábito no encontrado');
    }
    return this.prisma.habit.findFirst({
      where: { id, usuarioId },
    });
  }

  async remove(usuarioId: string, id: string) {
    const result = await this.prisma.habit.deleteMany({
      where: { id, usuarioId },
    });
    if (result.count === 0) {
      throw new NotFoundException('Hábito no encontrado');
    }
    return { message: 'Hábito eliminado correctamente' };
  }
}