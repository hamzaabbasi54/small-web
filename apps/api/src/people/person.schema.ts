import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

// A person you can browse or publish as. The seed upserts people by name, so names are unique.
@Schema({ collection: 'people' })
export class Person {
  @Prop({ required: true, unique: true })
  name!: string;
}

export type PersonDocument = HydratedDocument<Person>;
export const PersonSchema = SchemaFactory.createForClass(Person);
