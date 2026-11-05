import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  CreateVisitRequest,
  CreateVisitResponse,
  ErrorCode,
  Page,
  VisitView,
  normalizeAddress,
} from '@smallweb/shared';
import { AppError } from '../common/errors/app-error';
import { PeopleService } from '../people/people.service';
import { Site } from '../sites/site.schema';
import { Visit, VisitDocument } from './visit.schema';

function toVisitView(visit: VisitDocument): VisitView {
  return {
    id: visit._id.toString(),
    address: visit.address,
    title: visit.title,
    found: visit.found,
    via: visit.via,
    visitedAt: visit.visitedAt.toISOString(),
  };
}

// A cursor marks the last visit of a page: "<visitedAt ISO>|<id>", base64url-encoded so the
// client treats it as an opaque token.
function encodeCursor(visit: VisitDocument): string {
  return Buffer.from(`${visit.visitedAt.toISOString()}|${visit._id.toString()}`).toString(
    'base64url',
  );
}

function decodeCursor(cursor: string): { visitedAt: Date; id: Types.ObjectId } {
  const [iso, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
  const visitedAt = new Date(iso);
  if (Number.isNaN(visitedAt.getTime()) || !Types.ObjectId.isValid(id ?? '')) {
    throw new AppError(ErrorCode.INVALID_CURSOR, HttpStatus.BAD_REQUEST, 'Invalid cursor');
  }
  return { visitedAt, id: new Types.ObjectId(id) };
}

@Injectable()
export class VisitsService {
  constructor(
    @InjectModel(Visit.name) private readonly visitModel: Model<Visit>,
    @InjectModel(Site.name) private readonly siteModel: Model<Site>,
    private readonly peopleService: PeopleService,
  ) {}

  async record(personId: string, request: CreateVisitRequest): Promise<CreateVisitResponse> {
    const person = await this.peopleService.getById(personId);
    const address = normalizeAddress(request.address);

    // The server decides found and title; the client is never trusted with them.
    const site = await this.siteModel.findOne({ address }, { title: 1 });

    // Counted before inserting, so this visit isn't included. Powers "been here N times before".
    const priorVisitCount = await this.visitModel.countDocuments({ personId: person._id, address });

    const visit = await this.visitModel.create({
      personId: person._id,
      address,
      title: site?.title ?? null,
      found: site !== null,
      via: request.via,
      visitedAt: new Date(),
    });
    return { visit: toVisitView(visit), priorVisitCount };
  }

  // Newest first. Each page asks for visits "older than the cursor", so visits recorded while the
  // person is scrolling land at the top and never shift the pages below (page numbers would).
  async list(personId: string, limit: number, cursor?: string): Promise<Page<VisitView>> {
    const person = await this.peopleService.getById(personId);

    const filter: Record<string, unknown> = { personId: person._id };
    if (cursor) {
      const after = decodeCursor(cursor);
      // Older than the cursor; for the same time, a smaller _id (the tie-breaker in the sort).
      filter.$or = [
        { visitedAt: { $lt: after.visitedAt } },
        { visitedAt: after.visitedAt, _id: { $lt: after.id } },
      ];
    }

    // Ask for one extra: if it comes back, there is another page.
    const visits = await this.visitModel
      .find(filter)
      .sort({ visitedAt: -1, _id: -1 })
      .limit(limit + 1);
    const hasMore = visits.length > limit;
    const pageItems = visits.slice(0, limit);
    return {
      items: pageItems.map(toVisitView),
      nextCursor: hasMore ? encodeCursor(pageItems[pageItems.length - 1]) : null,
    };
  }
}
