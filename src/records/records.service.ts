import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma } from '@prisma/client';

import {
  endOfDay,
  isValidDate,
  parseFecha,
  toDayStart,
  todayStart,
} from '../common/date-utils.js';

import { PrismaService } from '../prisma/prisma.service.js';

import { CreateRecordDto } from './dto/create-record.dto.js';

import { QueryRecordDto } from './dto/query-record.dto.js';

@Injectable()
export class RecordsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(usuarioId: string, createRecordDto: CreateRecordDto) {
    const fechaRecibida = parseFecha(createRecordDto.fecha);

    if (!isValidDate(fechaRecibida)) {
      throw new BadRequestException('La fecha proporcionada no es válida');
    }

    const recordDay = toDayStart(fechaRecibida);

    if (recordDay.getTime() > todayStart().getTime()) {
      throw new BadRequestException(
        'No se puede registrar un hábito en una fecha futura',
      );
    }

    const habit = await this.prisma.habit.findFirst({
      where: {
        id: createRecordDto.habito,
        usuarioId,
        activo: true,
        eliminado: false,
      },
    });

    if (!habit) {
      throw new NotFoundException('Hábito no encontrado');
    }

    if (!habit.activo) {
      throw new BadRequestException('El hábito está desactivado');
    }

    if (habit.esCuantificable) {
      if (
        habit.cantidadObjetivo === null ||
        habit.cantidadObjetivo === undefined ||
        habit.cantidadObjetivo <= 0
      ) {
        throw new BadRequestException(
          'El hábito cuantificable debe tener una cantidad objetivo válida',
        );
      }

      if (
        createRecordDto.cantidad === undefined ||
        createRecordDto.cantidad === null
      ) {
        throw new BadRequestException(
          'Debes proporcionar una cantidad para este hábito',
        );
      }

      const cantidadRegistrada = createRecordDto.cantidad;

      const existingRecord = await this.prisma.record.findFirst({
        where: {
          habitoId: habit.id,
          usuarioId,
          fecha: recordDay,
        },
      });

      if (existingRecord) {
        const cantidadAnterior = existingRecord.cantidad ?? 0;

        const nuevaCantidad = cantidadAnterior + cantidadRegistrada;

        const completado = nuevaCantidad >= habit.cantidadObjetivo;

        const record = await this.prisma.record.update({
          where: {
            id: existingRecord.id,
          },
          data: {
            cantidad: nuevaCantidad,
            completado,
          },
        });

        return {
          message: completado
            ? 'Meta completada correctamente'
            : 'Cantidad registrada correctamente',
          record,
          progreso: {
            cantidadActual: nuevaCantidad,
            cantidadObjetivo: habit.cantidadObjetivo,
            porcentaje: Math.min(
              100,
              (nuevaCantidad / habit.cantidadObjetivo) * 100,
            ),
          },
        };
      }

      const completado = cantidadRegistrada >= habit.cantidadObjetivo;

      const record = await this.prisma.record.create({
        data: {
          habito: {
            connect: {
              id: habit.id,
            },
          },

          usuario: {
            connect: {
              id: usuarioId,
            },
          },

          fecha: recordDay,

          cantidad: cantidadRegistrada,

          completado,
        },
      });

      return {
        message: completado
          ? 'Meta completada correctamente'
          : 'Cantidad registrada correctamente',

        record,

        progreso: {
          cantidadActual: cantidadRegistrada,
          cantidadObjetivo: habit.cantidadObjetivo,
          porcentaje: Math.min(
            100,
            (cantidadRegistrada / habit.cantidadObjetivo) * 100,
          ),
        },
      };
    }

    const exists = await this.prisma.record.findFirst({
      where: {
        habitoId: habit.id,
        usuarioId,
        fecha: recordDay,
      },
    });

    if (exists) {
      throw new ConflictException(
        'El hábito ya está registrado para esta fecha',
      );
    }

    const record = await this.prisma.record.create({
      data: {
        habito: {
          connect: {
            id: habit.id,
          },
        },

        usuario: {
          connect: {
            id: usuarioId,
          },
        },

        fecha: recordDay,

        completado: createRecordDto.completado ?? true,

        cantidad: null,
      },
    });

    return {
      message: 'Hábito marcado como completado',
      record,
    };
  }

  async findAll(usuarioId: string, query: QueryRecordDto) {
    const where: Prisma.RecordWhereInput = {
      usuarioId,
    };

    if (query.habito) {
      const habit = await this.prisma.habit.findFirst({
        where: {
          id: query.habito,
          usuarioId,
        },
      });

      if (!habit) {
        throw new NotFoundException('Hábito no encontrado');
      }

      where.habitoId = query.habito;
    }

    const dateFilter: Prisma.DateTimeFilter = {};

    if (query.desde) {
      const desde = parseFecha(query.desde);

      if (isValidDate(desde)) {
        dateFilter.gte = toDayStart(desde);
      }
    }

    if (query.hasta) {
      const hasta = parseFecha(query.hasta);

      if (isValidDate(hasta)) {
        dateFilter.lte = endOfDay(hasta);
      }
    }

    if (query.desde || query.hasta) {
      where.fecha = dateFilter;
    }

    return this.prisma.record.findMany({
      where,
      orderBy: {
        fecha: 'desc',
      },
    });
  }
}
