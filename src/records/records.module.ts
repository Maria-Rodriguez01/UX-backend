import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RecordsController } from './records.controller.js';
import { RecordsService } from './records.service.js';
import { Record, RecordSchema } from './schemas/record.schema.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Record.name, schema: RecordSchema }]),
  ],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}