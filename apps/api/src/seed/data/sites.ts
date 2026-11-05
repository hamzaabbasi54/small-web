// Every seeded timestamp counts from here, so the seed gives the same data on every run.
export const SEED_BASE_TIME = new Date('2026-11-01T09:00:00.000Z');

export interface SeedSite {
  address: string;
  title: string;
  author: string;
  html: string;
}

// A small coastal town web. Links are woven into the prose. Four linked addresses don't exist on
// purpose (crabs.zz, fishmarket.zz, miller-diary.zz, radio.zz), so broken links lead to Nowhere.
export const SITES: SeedSite[] = [
  {
    address: 'tidepool.zz',
    title: 'Tidepool',
    author: 'Ada',
    html: `
<style>
  h1 { color: #1d6f74; }
  .aside { border-left: 3px solid #1d6f74; padding-left: 1em; }
</style>
<h1>Tidepool</h1>
<p>Twice a day the tide goes out past the rocks below the point, and for two hours a whole
country appears. I have been walking out at low tide for eleven years and I still find something
new in the pools almost every time.</p>
<p>The best pools sit high on the shelf, where the tide leaves them warm and still. Anemones open
like green flowers, limpets hold on as the tide drains, and small fish wait for the tide to come
back. If you sit still long enough the pool forgets you are there. A shore crab or two will come
out from under the weed; I keep meaning to write a whole page about them at
<a href="crabs.zz">crabs.zz</a>, but I never have.</p>
<p>Just past the last pools the kelp begins, a brown forest that only shows its top at the lowest
tide of the month. I wrote about it on <a href="kelp.zz">kelp.zz</a>. On the far side of the bay
you can see the lighthouse, and the old log on <a href="lighthouse.zz">lighthouse.zz</a> is the
best record of tide times in town.</p>
<p class="aside">A rule for visitors: turn every stone back the way you found it, and watch the
tide. It comes in faster than you think, and it does not wait for anyone.</p>
`,
  },
  {
    address: 'lighthouse.zz',
    title: 'The Lighthouse',
    author: 'Ada',
    html: `
<h1>The Lighthouse</h1>
<p>The light on the point was kept by hand until 1971. The last keeper, Tomas Hale, wrote in his
log every night for thirty-one years, and the log still sits in a drawer in the lamp room. I have
been copying it out, a page at a time.</p>
<p>Most nights he wrote three things: the weather, the tide, and the ships. On fog nights he wrote
more. Fog on this coast comes in off the water in an hour, and on those nights the keeper ran the
signal until morning and listened. The sound that answered him is the subject of
<a href="foghorn.zz">foghorn.zz</a>, and it is worth reading before you read his entries.</p>
<p>"Spring tide, high at four. Fog by nine. Two boats in late from the harbor, both safe." That is
a whole night in his hand. The boats he watched for still tie up at the
<a href="harbor.zz">harbor</a>, and some of the families are the same.</p>
<p>From the gallery you can look straight down onto the rocks where the pools are. The keeper
called them his garden, and they are the same pools on <a href="tidepool.zz">tidepool.zz</a>.</p>
`,
  },
  {
    address: 'kelp.zz',
    title: 'Kelp',
    author: 'Ada',
    html: `
<h1>Kelp</h1>
<p>Offshore of the point there is a forest you can only see from above, or from inside. The kelp
grows up from the rock floor in long brown ropes, each one held up by small floats full of gas, and
in summer it can grow the length of my arm in a week.</p>
<p>From a boat it looks like a dark patch on the water. Under the surface it is a cathedral: light
comes down in green bands, fish hang in the gaps between the stems, and the whole forest leans one
way and then the other as the swell moves through it.</p>
<p>The forest starts where the rock pools stop. If you have walked out on the shelf at the bottom
of the point (I wrote about that on <a href="tidepool.zz">tidepool.zz</a>), you have stood at its
edge. To see the inside you have to swim, and Elif's page on <a href="diving.zz">diving.zz</a> says
how to do it better than I can.</p>
<p>Storms tear up whole plants and throw them on the beach in heaps. The gulls love it. The town
used to collect it for the gardens, and some of the older allotments still smell of the sea.</p>
`,
  },
  {
    address: 'harbor.zz',
    title: 'Saturday Harbor Market',
    author: 'Bram',
    html: `
<style>
  h1 { font-family: Georgia, serif; }
  ul { line-height: 1.8; }
</style>
<h1>Saturday Harbor Market</h1>
<p>Every Saturday from seven until the stalls run out, the harbor wall becomes a market. The boats
come in first, then the vans, then everyone else. By eight you cannot see the water for the
awnings.</p>
<p>What to look for, from the slipway end:</p>
<ul>
  <li>The bread stall from the <a href="bakery.zz">harbor bakery</a>, which sells out by nine.</li>
  <li>Smoked mackerel from the Okafor boat, wrapped in paper.</li>
  <li>Jam, honey and too many cakes from the allotment society.</li>
</ul>
<p>There used to be a proper fish market in the old shed at the end of the quay. People still ask
for it, and someone once started a page for it at <a href="fishmarket.zz">fishmarket.zz</a>, but
the shed has been empty for years.</p>
<p>At ten the island ferry leaves from the far steps. If you have bought too much to carry, the
crew will hold a bag for you. The timetable and its stories are on
<a href="ferry.zz">ferry.zz</a>.</p>
`,
  },
  {
    address: 'bakery.zz',
    title: 'The Harbor Bakery',
    author: 'Bram',
    html: `
<h1>The Harbor Bakery</h1>
<p>I have baked bread in the small shop behind the harbor for nineteen years. The oven is older than
I am, and it runs hot on the left, so every loaf gets turned halfway through. That is most of the
secret.</p>
<p>The rest is the starter. Our sourdough starter came from my aunt, who kept it alive through a
war in a jar under her bed. I feed it every night at ten. It gets the town's flour, ground slowly
at the <a href="mill.zz">old windmill</a> on the hill, and water from the tap. Nothing else.</p>
<p>A good loaf of bread takes two days. The dough rises slowly overnight in the cold room, is shaped
before dawn, and is baked at five. By seven it is on the market stall at the
<a href="harbor.zz">harbor</a>, and by nine it is gone.</p>
<p>People ask me for the recipe. Here it is: flour, water, salt, starter, time. The bread is mostly
the time.</p>
`,
  },
  {
    address: 'mill.zz',
    title: 'The Windmill',
    author: 'Bram',
    html: `
<h1>The Windmill</h1>
<p>The windmill on the hill above town was built in 1802 and stopped turning in 1958. In 2009 a
group of us got it turning again. It now grinds about two tonnes of wheat a year, most of which
goes to the <a href="bakery.zz">harbor bakery</a> and comes back to the town as bread.</p>
<p>A windmill is a weather instrument as much as a machine. The miller has to watch the sky all
day, set the sails for the wind, and stop before a gust can run the stones too fast. On a good
grinding day the whole building hums. Dev's page on reading the sky,
<a href="weather.zz">weather.zz</a>, is required reading for anyone who wants to help.</p>
<p>The last working miller kept a diary, and we found it in the cap of the mill when we repaired
it. One day it will be typed up at <a href="miller-diary.zz">miller-diary.zz</a>. For now it sits
in a box in the library, waiting.</p>
<p>The mill is open on the first Sunday of the month. Wear shoes you can climb ladders in.</p>
`,
  },
  {
    address: 'ferry.zz',
    title: 'The Island Ferry',
    author: 'Chioma',
    html: `
<h1>The Island Ferry</h1>
<p>The ferry to the island runs four times a day in summer and twice in winter, from the far steps
of the <a href="harbor.zz">harbor</a>. The timetable is pinned to the ticket hut. It is not always
right, and nobody minds.</p>
<p>I have crossed on it most weeks for six years. The crossing takes twenty minutes, and in that
time you hear everything: who is selling a boat, whose daughter is home, what the weather will do.
The crew know every passenger by name and most of their dogs.</p>
<p>Once, the ferry turned back halfway because a pod of dolphins would not get out of the way. We
were late, and nobody complained. Another time it carried a piano. The piano is still on the
island, in the hall, and it is still out of tune.</p>
<p>Someone at the ticket hut keeps telling me the timetable is on the internet at
<a href="https://example.com">https://example.com</a>. It is not; there is no internet here, only
the small web. What there is, at the other end of the crossing, is the island itself, and my walk
around it is on <a href="island.zz">island.zz</a>.</p>
`,
  },
  {
    address: 'island.zz',
    title: 'Around the Island',
    author: 'Chioma',
    html: `
<style>
  .route { background: #f4efe6; padding: 0.75em 1em; }
</style>
<h1>Around the Island</h1>
<p>You can walk all the way around the island in about three hours, but only at low tide. On the
north side the path goes over the sand, and when the tide is in, the sand is under the sea. Check
the tide before you go; the old log on <a href="lighthouse.zz">lighthouse.zz</a> is still a good
guide to how the water behaves here.</p>
<p class="route">The route: land at the jetty, walk west along the cliffs, drop down to the north
sands, climb back up by the chapel, and return along the east shore to the jetty.</p>
<p>The west cliffs are the best part. In spring they are white with seabirds: gulls, kittiwakes,
guillemots and, if you are lucky, puffins. Dev has written properly about watching them on
<a href="birds.zz">birds.zz</a>; I only know that they are loud and that they do not like you near
the edge.</p>
<p>Leave enough time to get back for the last boat. The island is lovely, but there is nowhere to
stay. Times are on <a href="ferry.zz">ferry.zz</a>.</p>
`,
  },
  {
    address: 'birds.zz',
    title: 'Seabirds on the Cliffs',
    author: 'Dev',
    html: `
<h1>Seabirds on the Cliffs</h1>
<p>From April to July the island cliffs hold one of the biggest seabird colonies on this part of
the coast. On a still morning you can hear it from the ferry before you can see it.</p>
<p>Most of the noise is kittiwakes, small gulls that nest on ledges no wider than your hand. Below
them are the guillemots, standing in rows like people waiting for a bus. The puffins nest in
burrows on the grassy top, and they are the seabird everyone comes to see.</p>
<p>A few rules for seabird watching: stay back from the edge, never stand between a bird and its
nest, and bring binoculars instead of getting closer. A frightened seabird can knock its egg off
the ledge.</p>
<p>The colony depends on the weather more than anything. A cold, wet June can wipe out a year of
chicks. I keep notes on how the season goes and how the sky behaved on
<a href="weather.zz">weather.zz</a>. To get there, follow the cliff path on
<a href="island.zz">island.zz</a>.</p>
`,
  },
  {
    address: 'weather.zz',
    title: 'Reading the Coastal Weather',
    author: 'Dev',
    html: `
<h1>Reading the Coastal Weather</h1>
<p>Weather on this coast changes fast, and the forecast on the radio is for a much bigger piece of
sea than ours. Over the years I have learned to read the local signs instead.</p>
<p>Fog is the one that catches people out. On a warm day, when the wind drops and the sea is cold,
a bank of fog can sit offshore all afternoon and then roll in within ten minutes. If the island
disappears, you have about half an hour. When it is in, listen for the horn on the point; it is
explained on <a href="foghorn.zz">foghorn.zz</a>.</p>
<p>Other signs: if the windmill on the hill is stopped on a working day, the wind is too strong or
about to be (see <a href="mill.zz">mill.zz</a>). If the gulls come inland, rain is on its way. If
the cliffs are quiet in nesting season, the birds know something we don't; I write about that on
<a href="birds.zz">birds.zz</a>.</p>
<p>None of this is science, but all of it has been right more often than the radio.</p>
`,
  },
  {
    address: 'foghorn.zz',
    title: 'The Foghorn',
    author: 'Elif',
    html: `
<style>
  blockquote { font-style: italic; color: #555; }
</style>
<h1>The Foghorn</h1>
<p>When fog comes in, the horn on the point sounds once every thirty seconds: a long, low note that
you feel in your chest more than you hear. People who grew up here say they sleep better on fog
nights because of it.</p>
<p>The note is low on purpose. Low sounds travel further through fog than high ones, and they bend
around the headland, so a boat in thick fog behind the point can still hear it. The pattern, one
blast every thirty seconds, is the signature of this station. Every horn on the coast has its own,
so a lost skipper in the fog can tell which one they are hearing.</p>
<blockquote>"Fog thick by midnight. Horn going all night. Nobody out." (from the old log)</blockquote>
<p>The log is on <a href="lighthouse.zz">lighthouse.zz</a>. Dev's page on
<a href="weather.zz">weather.zz</a> explains why fog builds so fast here. And there used to be a
radio beacon beside the horn, which I want to write about one day on
<a href="radio.zz">radio.zz</a>.</p>
`,
  },
  {
    address: 'diving.zz',
    title: 'Free Diving in the Kelp',
    author: 'Elif',
    html: `
<h1>Free Diving in the Kelp</h1>
<p>Free diving means going down on one breath, with no tank. It is the quietest way to be under the
sea, and the kelp forest off the point is the best place in town to learn it.</p>
<p>Go at slack water, the still half hour at the top or bottom of the tide, when the current stops
pulling through the forest. On a falling tide the water runs out of the bay like a river, and you
will spend the dive holding on to a kelp stem. Ada explains what the forest is on
<a href="kelp.zz">kelp.zz</a>; I can only tell you what it feels like.</p>
<p>It feels like flying through a wood. You go down along a stem, the light turns green, and the
noise of the surface stops. Fish come to look at you. Then your breath runs short, and you come up
into the sun.</p>
<p>Start in the shallow pools (<a href="tidepool.zz">tidepool.zz</a> shows where), and never dive
alone. When you are ready for more, the water off <a href="island.zz">the island</a> is clearer
still.</p>
`,
  },
];
