import { Controller, Get, Query } from '@nestjs/common';
import { Page, SearchResultView } from '@smallweb/shared';
import { SearchQueryDto } from './dto/search-query.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // GET /api/search?q=fog&limit=10
  @Get()
  search(@Query() query: SearchQueryDto): Promise<Page<SearchResultView>> {
    return this.searchService.search(query.q, query.limit);
  }
}
