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
      where: { id: createRecordDto.habito, usuarioId },
    });
    if (!habit) {
      throw new NotFoundException('Hábito no encontrado');
    }
    if (!habit.activo) {
      throw new BadRequestException('El hábito está desactivado');
    }

    const exists = await this.prisma.record.findFirst({
      where: {
        habitoId: habit.id,
        usuarioId,
        fecha: recordDay,
      },
    });
    if (exists) {
      throw new ConflictException('El hábito ya está registrado para esta fecha');
    }

    const record = await this.prisma.record.create({
      data: {
        habito: { connect: { id: habit.id } },
        usuario: { connect: { id: usuarioId } },
        fecha: recordDay,
        completado: createRecordDto.completado ?? true,
      },
    });

    return { message: 'Hábito marcado como completado', record };
  }

  async findAll(usuarioId: string, query: QueryRecordDto) {
    const where: Prisma.RecordWhereInput = { usuarioId };

    if (query.habito) {
      const habit = await this.prisma.habit.findFirst({
        where: { id: query.habito, usuarioId },
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
      orderBy: { fecha: 'desc' },
    });
  }
}