import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { SiteView } from '@smallweb/shared';
import { CreateSiteDto } from './dto/create-site.dto';
import { SitesService } from './sites.service';

@Controller('sites')
export class SitesController {
  constructor(private readonly sitesService: SitesService) {}

  // GET /api/sites/tidepool.zz
  @Get(':address')
  getByAddress(@Param('address') address: string): Promise<SiteView> {
    return this.sitesService.getByAddress(address);
  }

  // POST /api/sites  (201 Created is Nest's default for POST)
  @Post()
  create(@Body() body: CreateSiteDto): Promise<SiteView> {
    return this.sitesService.create(body);
  }
}
