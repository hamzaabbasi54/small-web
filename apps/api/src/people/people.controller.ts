import { Controller, Get } from '@nestjs/common';
import { Page, PersonView } from '@smallweb/shared';
import { PeopleService } from './people.service';

@Controller('people')
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  // GET /api/people
  @Get()
  list(): Promise<Page<PersonView>> {
    return this.peopleService.list();
  }
}
