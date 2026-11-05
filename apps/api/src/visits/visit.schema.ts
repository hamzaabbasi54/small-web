import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { VISIT_VIAS, type VisitVia } from '@smallweb/shared';
import { Person } from '../people/person.schema';

// A recorded fact: this person arrived at this address at this time, this way.
// Append-only: the app inserts visits and never updates or deletes them.
@Schema({ collection: 'visits' })
export class Visit {
  @Prop({ type: Types.ObjectId, ref: Person.name, required: true })
  personId!: Types.ObjectId;

  // Normalized. May point at an address where no site exists.
  @Prop({ required: true })
  address!: string;

  // The site's title at the moment of the visit, so history shows what the page was called then.
  // null when the address led nowhere.
  @Prop({ type: String, default: null })
  title!: string | null;

  // Whether a site existed at that moment. Set by the server, never taken from the client.
  @Prop({ required: true })
  found!: boolean;

  @Prop({ type: String, required: true, enum: VISIT_VIAS })
  via!: VisitVia;

  @Prop({ required: true })
  visitedAt!: Date;

  // Only on seeded visits, so running the seed again updates them instead of adding copies.
  @Prop()
  seedKey?: string;
}

export type VisitDocument = HydratedDocument<Visit>;
export const VisitSchema = SchemaFactory.createForClass(Visit);

// A person's history, newest first. _id breaks ties between visits with the same time.
VisitSchema.index({ personId: 1, visitedAt: -1, _id: -1 });
// sparse: visits without a seedKey are left out of the index, so they don't clash with each other.
VisitSchema.index({ seedKey: 1 }, { unique: true, sparse: true });
