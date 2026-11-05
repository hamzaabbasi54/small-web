// Fills the database with a small, deterministic web. Safe to run any number of times: every
// record is upserted by a natural key (person by name, site by address), so nothing is doubled,
// and nothing a user published is touched. Run with: npm run seed
import mongoose from 'mongoose';
import { normalizeAddress } from '@smallweb/shared';
import { Person, PersonSchema } from '../people/person.schema';
import { Site, SiteSchema } from '../sites/site.schema';
import { sanitizeSiteHtml } from '../sites/html-sanitizer';
import { PEOPLE } from './data/people';
import { SEED_BASE_TIME, SITES } from './data/sites';

const PersonModel = mongoose.model(Person.name, PersonSchema);
const SiteModel = mongoose.model(Site.name, SiteSchema);

async function seedPeople(): Promise<Map<string, mongoose.Types.ObjectId>> {
  const idsByName = new Map<string, mongoose.Types.ObjectId>();
  for (const name of PEOPLE) {
    const person = await PersonModel.findOneAndUpdate(
      { name },
      { $set: { name } },
      { upsert: true, returnDocument: 'after' },
    );
    idsByName.set(name, person._id);
  }
  console.log(`people: ${PEOPLE.length} upserted`);
  return idsByName;
}

async function seedSites(personIds: Map<string, mongoose.Types.ObjectId>): Promise<void> {
  for (const site of SITES) {
    const authorId = personIds.get(site.author);
    if (!authorId) {
      throw new Error(`Seed site ${site.address} has unknown author ${site.author}`);
    }
    // The same sanitizer as publishing, so seeded sites are stored exactly like published ones.
    const { safeHtml, text } = sanitizeSiteHtml(site.html);
    const address = normalizeAddress(site.address);
    await SiteModel.updateOne(
      { address },
      {
        $set: {
          address,
          title: site.title,
          rawHtml: site.html,
          safeHtml,
          text,
          authorId,
          createdAt: SEED_BASE_TIME,
          updatedAt: SEED_BASE_TIME,
        },
      },
      // timestamps: false keeps the fixed dates above instead of "now".
      { upsert: true, timestamps: false },
    );
  }
  console.log(`sites: ${SITES.length} upserted`);
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set (see apps/api/.env.example)');
  }
  await mongoose.connect(uri);
  try {
    // Build the indexes first, so the unique ones are in place before any upsert.
    await Promise.all([PersonModel.syncIndexes(), SiteModel.syncIndexes()]);
    const personIds = await seedPeople();
    await seedSites(personIds);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
