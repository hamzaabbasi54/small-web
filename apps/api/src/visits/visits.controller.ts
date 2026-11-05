import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreateVisitResponse, Page, VisitView } from '@smallweb/shared';
import { CreateVisitDto } from './dto/create-visit.dto';
import { ListVisitsQueryDto } from './dto/list-visits.query.dto';
import { VisitsService } from './visits.service';

// Visits belong to a person, so they live under /api/people/:personId/visits.
@Controller('people/:personId/visits')
export class VisitsController {
  constructor(private readonly visitsService: VisitsService) {}

  @Post()
  record(
    @Param('personId') personId: string,
    @Body() body: CreateVisitDto,
  ): Promise<CreateVisitResponse> {
    return this.visitsService.record(personId, body);
  }

  @Get()
  list(
    @Param('personId') personId: string,
    @Query() query: ListVisitsQueryDto,
  ): Promise<Page<VisitView>> {
    return this.visitsService.list(personId, query.limit, query.cursor);
  }
}
