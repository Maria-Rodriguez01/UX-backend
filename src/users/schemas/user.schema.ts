import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true })
  nombre: string;

  @Prop({ required: true, unique: true })
  correo: string;

  @Prop({ required: true })
  contraseña: string;

  @Prop({ default: () => new Date() })
  fechaRegistro: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);