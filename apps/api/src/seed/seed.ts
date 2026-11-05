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
import { VISITS } from './data/visits';
import { Visit, VisitSchema } from '../visits/visit.schema';

const MS_PER_MINUTE = 60_000;

const PersonModel = mongoose.model(Person.name, PersonSchema);
const SiteModel = mongoose.model(Site.name, SiteSchema);
const VisitModel = mongoose.model(Visit.name, VisitSchema);

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

async function seedVisits(personIds: Map<string, mongoose.Types.ObjectId>): Promise<void> {
  // found and title come from the sites in the database, the same way the real endpoint sets them.
  const sites = await SiteModel.find({}, { address: 1, title: 1 });
  const titlesByAddress = new Map(sites.map((site) => [site.address, site.title]));

  for (const visit of VISITS) {
    const personId = personIds.get(visit.person);
    if (!personId) {
      throw new Error(`Seed visit ${visit.seedKey} has unknown person ${visit.person}`);
    }
    const address = normalizeAddress(visit.address);
    const title = titlesByAddress.get(address) ?? null;
    await VisitModel.updateOne(
      { seedKey: visit.seedKey },
      {
        $set: {
          seedKey: visit.seedKey,
          personId,
          address,
          title,
          found: title !== null,
          via: visit.via,
          visitedAt: new Date(SEED_BASE_TIME.getTime() + visit.minute * MS_PER_MINUTE),
        },
      },
      { upsert: true },
    );
  }
  console.log(`visits: ${VISITS.length} upserted`);
}

async function main(): Promise<void> {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set (see apps/api/.env.example)');
  }
  await mongoose.connect(uri);
  try {
    // Build the indexes first, so the unique ones are in place before any upsert.
    await Promise.all([
      PersonModel.syncIndexes(),
      SiteModel.syncIndexes(),
      VisitModel.syncIndexes(),
    ]);
    const personIds = await seedPeople();
    await seedSites(personIds);
    await seedVisits(personIds);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
