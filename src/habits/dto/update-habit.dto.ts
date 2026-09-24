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

export class UpdateHabitDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsOptional()
  @IsString()
  categoria?: string;

  @IsOptional()
  @IsEnum(HabitFrecuencia)
  frecuencia?: HabitFrecuencia;

  @IsOptional()
  @IsEnum(HabitPrioridad)
  prioridad?: HabitPrioridad;

  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsBoolean()
  activo?: boolean;

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
