import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeopleModule } from '../people/people.module';
import { Site, SiteSchema } from './site.schema';
import { SitesController } from './sites.controller';
import { SitesService } from './sites.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Site.name, schema: SiteSchema }]), PeopleModule],
  controllers: [SitesController],
  providers: [SitesService],
  // Search and visits read sites directly through the Site model.
  exports: [MongooseModule],
})
export class SitesModule {}
