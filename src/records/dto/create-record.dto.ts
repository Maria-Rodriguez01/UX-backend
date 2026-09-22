import {
  IsBoolean,
  IsDateString,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
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

  @IsOptional()
  @IsNumber()
  @Min(0)
  cantidad?: number;
}
