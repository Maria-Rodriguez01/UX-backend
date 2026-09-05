import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type HabitDocument = HydratedDocument<Habit>;

@Schema()
export class Habit {
  @Prop({ required: true })
  nombre: string;

  @Prop()
  descripcion?: string;

  @Prop()
  categoria?: string;

  @Prop({ required: true, enum: ['daily', 'weekly', 'custom'] })
  frecuencia: string;

  @Prop({ required: true })
  prioridad: string;

  @Prop({ required: true })
  fechaInicio: Date;

  @Prop()
  fechaFin?: Date;

  @Prop({ default: true })
  activo: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  usuario: Types.ObjectId;
}

export const HabitSchema = SchemaFactory.createForClass(Habit);