import { IsDateString, IsMongoId, IsOptional } from 'class-validator';

export class QueryRecordDto {
  @IsOptional()
  @IsMongoId()
  habito?: string;

  @IsOptional()
  @IsDateString()
  desde?: string;

  @IsOptional()
  @IsDateString()
  hasta?: string;
}