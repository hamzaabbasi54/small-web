import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  CreateSiteRequest,
  ErrorCode,
  SiteView,
  isValidAddress,
  normalizeAddress,
} from '@smallweb/shared';
import { AppError } from '../common/errors/app-error';
import { PersonDocument } from '../people/person.schema';
import { PeopleService, toPersonView } from '../people/people.service';
import { sanitizeSiteHtml } from './html-sanitizer';
import { Site, SiteDocument } from './site.schema';

const MONGO_DUPLICATE_KEY = 11000;

// Public shape of a site. Only safeHtml leaves the server; rawHtml never does.
function toSiteView(site: SiteDocument, author: PersonDocument): SiteView {
  return {
    address: site.address,
    title: site.title,
    html: site.safeHtml,
    author: toPersonView(author),
    createdAt: site.createdAt.toISOString(),
  };
}

@Injectable()
export class SitesService {
  constructor(
    @InjectModel(Site.name) private readonly siteModel: Model<Site>,
    private readonly peopleService: PeopleService,
  ) {}

  async getByAddress(rawAddress: string): Promise<SiteView> {
    const address = normalizeAddress(rawAddress);
    // An invalid address is "nothing lives here" (404), not a bad request (400): typing nonsense
    // into a browser's address bar leads nowhere, it isn't a malformed request.
    const site = isValidAddress(address) ? await this.siteModel.findOne({ address }) : null;
    if (!site) {
      throw new AppError(ErrorCode.SITE_NOT_FOUND, HttpStatus.NOT_FOUND, `No site at ${address}`);
    }
    const author = await this.peopleService.getById(site.authorId.toString());
    return toSiteView(site, author);
  }

  // The DTO has already validated and normalized the input.
  async create(request: CreateSiteRequest): Promise<SiteView> {
    const author = await this.peopleService.getById(request.authorId);
    const { safeHtml, text } = sanitizeSiteHtml(request.html);
    try {
      const site = await this.siteModel.create({
        address: request.address,
        title: request.title,
        rawHtml: request.html,
        safeHtml,
        text,
        authorId: author._id,
      });
      return toSiteView(site, author);
    } catch (error) {
      // The unique index on address rejects a second site at the same address.
      if ((error as { code?: unknown }).code === MONGO_DUPLICATE_KEY) {
        throw new AppError(
          ErrorCode.ADDRESS_TAKEN,
          HttpStatus.CONFLICT,
          `${request.address} is already taken`,
        );
      }
      throw error;
    }
  }
}
