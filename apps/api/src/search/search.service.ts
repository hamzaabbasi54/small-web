import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Page, SearchResultView } from '@smallweb/shared';
import { Person, PersonDocument } from '../people/person.schema';
import { toPersonView } from '../people/people.service';
import { Site } from '../sites/site.schema';

const SNIPPET_LENGTH = 160;
// How much text to show before the matching word, so it isn't the very first thing in the snippet.
const SNIPPET_LEAD = 40;

// About 160 characters of the page text around the first word of the query that appears in it.
// If none of the words appear as written (the text index also matches "tides" for "tide"), the
// snippet is the start of the page.
export function buildSnippet(text: string, query: string): string {
  const lowerText = text.toLowerCase();
  const positions = query
    .toLowerCase()
    .split(/\s+/)
    .map((word) => lowerText.indexOf(word))
    .filter((position) => position >= 0);
  const firstMatch = positions.length > 0 ? Math.min(...positions) : 0;

  const start = Math.max(0, firstMatch - SNIPPET_LEAD);
  const end = start + SNIPPET_LENGTH;
  const prefix = start > 0 ? '…' : '';
  const suffix = end < text.length ? '…' : '';
  return prefix + text.slice(start, end).trim() + suffix;
}

@Injectable()
export class SearchService {
  constructor(@InjectModel(Site.name) private readonly siteModel: Model<Site>) {}

  async search(query: string, limit: number): Promise<Page<SearchResultView>> {
    // $text uses the text index on title and text (title weighted 5×). textScore is how well each
    // site matched, and the results are sorted best first.
    const sites = await this.siteModel
      .find({ $text: { $search: query } }, { score: { $meta: 'textScore' } })
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit)
      .populate<{ authorId: PersonDocument }>({ path: 'authorId', model: Person.name });

    const items = sites.map((site) => ({
      address: site.address,
      title: site.title,
      snippet: buildSnippet(site.text, query),
      author: toPersonView(site.authorId),
    }));
    // The web is small, so all results fit in one page.
    return { items, nextCursor: null };
  }
}
