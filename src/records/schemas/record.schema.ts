import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type RecordDocument = HydratedDocument<Record>;

@Schema()
export class Record {
  @Prop({ type: Types.ObjectId, ref: 'Habit', required: true })
  habito: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  usuario: Types.ObjectId;

  @Prop({ required: true })
  fecha: Date;

  @Prop({ default: true })
  completado: boolean;
}

export const RecordSchema = SchemaFactory.createForClass(Record);

RecordSchema.index({ usuario: 1, fecha: 1 });
RecordSchema.index({ habito: 1, fecha: 1 });