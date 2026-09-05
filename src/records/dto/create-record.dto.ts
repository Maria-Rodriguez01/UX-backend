import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  @IsMongoId()
  habito: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;
}