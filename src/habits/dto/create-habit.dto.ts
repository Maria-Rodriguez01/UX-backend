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

export enum HabitFrecuencia {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  CUSTOM = 'custom',
  MONTHLY = 'monthly',
}

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

  @IsString()
  @IsNotEmpty()
  prioridad: string;

  @IsDateString()
  fechaInicio: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsBoolean()
  esCuantificable?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidadObjetivo?: number;

  @IsOptional()
  @IsString()
  unidadObjetivo?: string;
}
