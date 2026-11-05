import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Person } from '../people/person.schema';

// One page of HTML published at its own address. `timestamps` adds createdAt and updatedAt.
@Schema({ collection: 'sites', timestamps: true })
export class Site {
  // Always normalized (lowercase). `unique` creates the unique index; a duplicate insert fails,
  // which is how "address already taken" is detected.
  @Prop({ required: true, unique: true })
  address!: string;

  @Prop({ required: true })
  title!: string;

  // Exactly what the author submitted. Never sent to the browser.
  @Prop({ required: true })
  rawHtml!: string;

  // Sanitized HTML. The only HTML ever sent to the browser.
  @Prop({ required: true })
  safeHtml!: string;

  // Plain text pulled out of the HTML, used for search and snippets.
  @Prop({ required: true })
  text!: string;

  @Prop({ type: Types.ObjectId, ref: Person.name, required: true })
  authorId!: Types.ObjectId;

  createdAt!: Date;
}

export type SiteDocument = HydratedDocument<Site>;
export const SiteSchema = SchemaFactory.createForClass(Site);

// Full-text search over title and body. A match in the title counts 5 times as much.
SiteSchema.index({ title: 'text', text: 'text' }, { weights: { title: 5, text: 1 } });
