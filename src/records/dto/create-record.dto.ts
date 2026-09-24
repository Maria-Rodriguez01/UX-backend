import {
  IsBoolean,
  IsDateString,
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateRecordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  habito: string;

  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsBoolean()
  completado?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;
}
