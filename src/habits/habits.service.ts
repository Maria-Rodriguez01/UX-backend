import { Injectable, NotFoundException } from '@nestjs/common';

import { parseFecha, toDayStart } from '../common/date-utils.js';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateHabitDto } from './dto/create-habit.dto.js';

import { UpdateHabitDto } from './dto/update-habit.dto.js';

@Injectable()
export class HabitsService {
  constructor(private readonly prisma: PrismaService) {}

  create(usuarioId: string, createHabitDto: CreateHabitDto) {
    const esCuantificable = createHabitDto.esCuantificable ?? true;

    return this.prisma.habit.create({
      data: {
        nombre: createHabitDto.nombre,
        descripcion: createHabitDto.descripcion ?? undefined,
        categoria: createHabitDto.categoria ?? undefined,
        frecuencia: createHabitDto.frecuencia,
        prioridad: createHabitDto.prioridad,

        fechaInicio: toDayStart(parseFecha(createHabitDto.fechaInicio)),

        fechaFin: createHabitDto.fechaFin
          ? toDayStart(parseFecha(createHabitDto.fechaFin))
          : null,

        esCuantificable,

        cantidadObjetivo: esCuantificable
          ? (createHabitDto.cantidadObjetivo ?? undefined)
          : null,

        unidadObjetivo: esCuantificable
          ? (createHabitDto.unidadObjetivo ?? undefined)
          : null,

        activo: true,

        usuario: {
          connect: { id: usuarioId },
        },
      },
    });
  }

  findAll(usuarioId: string) {
    return this.prisma.habit.findMany({
      where: {
        usuarioId,
        activo: true,
        eliminado: false,
      },
      orderBy: { fechaInicio: 'desc' },
    });
  }

  async findOne(usuarioId: string, id: string) {
    const habit = await this.prisma.habit.findFirst({
      where: {
        id,
        usuarioId,
        activo: true,
      },
    });

    if (!habit) {
      throw new NotFoundException('Hábito no encontrado');
    }

    return habit;
  }

  async update(usuarioId: string, id: string, updateHabitDto: UpdateHabitDto) {
    const data: Record<string, unknown> = {};

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
      data.fechaInicio = toDayStart(parseFecha(updateHabitDto.fechaInicio));
    }

    if (updateHabitDto.fechaFin !== undefined) {
      data.fechaFin = updateHabitDto.fechaFin
        ? toDayStart(parseFecha(updateHabitDto.fechaFin))
        : null;
    }

    if (updateHabitDto.activo !== undefined) {
      data.activo = updateHabitDto.activo;
    }

    if (updateHabitDto.esCuantificable !== undefined) {
      data.esCuantificable = updateHabitDto.esCuantificable;

      if (!updateHabitDto.esCuantificable) {
        data.cantidadObjetivo = null;
        data.unidadObjetivo = null;
      }
    }

    if (updateHabitDto.cantidadObjetivo !== undefined) {
      data.cantidadObjetivo = updateHabitDto.cantidadObjetivo;
    }

    if (updateHabitDto.unidadObjetivo !== undefined) {
      data.unidadObjetivo = updateHabitDto.unidadObjetivo;
    }

    const result = await this.prisma.habit.updateMany({
      where: {
        id,
        usuarioId,
      },
      data,
    });

    if (result.count === 0) {
      throw new NotFoundException('Hábito no encontrado');
    }

    return this.prisma.habit.findFirst({
      where: {
        id,
        usuarioId,
      },
    });
  }

  async remove(usuarioId: string, id: string) {
    const habit = await this.prisma.habit.findFirst({
      where: {
        id,
        usuarioId,
        activo: true,
      },
    });

    if (!habit) {
      throw new NotFoundException('Hábito no encontrado');
    }

    await this.prisma.habit.updateMany({
      where: {
        id,
        usuarioId,
      },
      data: {
        activo: false,
      },
    });

    return {
      message: 'Hábito eliminado correctamente',
    };
  }
}
