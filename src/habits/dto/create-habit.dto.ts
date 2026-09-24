import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

import { HabitFrecuencia, HabitPrioridad } from '@prisma/client';

export class CreateHabitDto {
  @IsString()
  @IsNotEmpty()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsEnum(HabitFrecuencia)
  frecuencia: HabitFrecuencia;

  @IsEnum(HabitPrioridad)
  prioridad: HabitPrioridad;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsBoolean()
  esCuantificable?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  cantidadObjetivo?: number;

  @IsOptional()
  @IsString()
  unidadObjetivo?: string;
}
