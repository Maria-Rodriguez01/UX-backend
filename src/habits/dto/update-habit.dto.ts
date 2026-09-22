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

import { HabitFrecuencia } from './create-habit.dto.js';

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
  @IsString()
  @IsNotEmpty()
  prioridad?: string;

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
  @IsNumber()
  @Min(0)
  cantidadObjetivo?: number;

  @IsOptional()
  @IsString()
  unidadObjetivo?: string;
}
