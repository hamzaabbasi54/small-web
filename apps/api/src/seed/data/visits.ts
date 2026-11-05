import type { VisitVia } from '@smallweb/shared';

export interface SeedVisit {
  seedKey: string;
  person: string;
  address: string;
  via: VisitVia;
  minute: number; // minutes after SEED_BASE_TIME
}

interface Step {
  address: string;
  via: VisitVia;
}

// One person's walk: the first step at startMinute, then one step every stepMinutes.
// seedKey is "<person>-<n>", so re-running the seed finds the same visit instead of adding one.
function trail(
  person: string,
  startMinute: number,
  stepMinutes: number,
  steps: Step[],
): SeedVisit[] {
  return steps.map((step, index) => ({
    seedKey: `${person}-${index + 1}`,
    person,
    address: step.address,
    via: step.via,
    minute: startMinute + index * stepMinutes,
  }));
}

// About an hour of browsing, 09:00–10:00 UTC on 2026-11-01.
export const VISITS: SeedVisit[] = [
  // Chioma: the long trail, nine sites deep without turning back, then one step back.
  ...trail('Chioma', 0, 2, [
    { address: 'tidepool.zz', via: 'typed' },
    { address: 'lighthouse.zz', via: 'link' },
    { address: 'harbor.zz', via: 'link' },
    { address: 'ferry.zz', via: 'link' },
    { address: 'island.zz', via: 'link' },
    { address: 'birds.zz', via: 'link' },
    { address: 'weather.zz', via: 'link' },
    { address: 'mill.zz', via: 'link' },
    { address: 'bakery.zz', via: 'link' },
    { address: 'mill.zz', via: 'back' },
  ]),
  // Bram: repeat visits to his own sites, and one address that doesn't exist.
  ...trail('Bram', 5, 5, [
    { address: 'harbor.zz', via: 'typed' },
    { address: 'bakery.zz', via: 'link' },
    { address: 'mill.zz', via: 'link' },
    { address: 'bakery.zz', via: 'back' },
    { address: 'fishmarket.zz', via: 'typed' },
    { address: 'harbor.zz', via: 'typed' },
    { address: 'bakery.zz', via: 'link' },
    { address: 'bakery.zz', via: 'typed' },
  ]),
  // Ada: out and back, then a broken link.
  ...trail('Ada', 10, 4, [
    { address: 'tidepool.zz', via: 'typed' },
    { address: 'kelp.zz', via: 'link' },
    { address: 'diving.zz', via: 'link' },
    { address: 'kelp.zz', via: 'back' },
    { address: 'tidepool.zz', via: 'back' },
    { address: 'crabs.zz', via: 'link' },
  ]),
  // Dev: a short walk.
  ...trail('Dev', 20, 3, [
    { address: 'birds.zz', via: 'typed' },
    { address: 'weather.zz', via: 'link' },
    { address: 'foghorn.zz', via: 'link' },
    { address: 'lighthouse.zz', via: 'link' },
  ]),
  // Elif: nearly everywhere. 11 of the 12 sites (never bakery.zz), then a broken link.
  ...trail('Elif', 0, 5, [
    { address: 'foghorn.zz', via: 'typed' },
    { address: 'lighthouse.zz', via: 'link' },
    { address: 'tidepool.zz', via: 'link' },
    { address: 'kelp.zz', via: 'link' },
    { address: 'diving.zz', via: 'link' },
    { address: 'island.zz', via: 'link' },
    { address: 'ferry.zz', via: 'link' },
    { address: 'harbor.zz', via: 'link' },
    { address: 'mill.zz', via: 'link' },
    { address: 'weather.zz', via: 'link' },
    { address: 'birds.zz', via: 'link' },
    { address: 'radio.zz', via: 'link' },
  ]),
];
