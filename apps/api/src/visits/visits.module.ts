import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PeopleModule } from '../people/people.module';
import { SitesModule } from '../sites/sites.module';
import { Visit, VisitSchema } from './visit.schema';
import { VisitsController } from './visits.controller';
import { VisitsService } from './visits.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Visit.name, schema: VisitSchema }]),
    PeopleModule, // to check the person exists
    SitesModule, // to look up the site at the visited address
  ],
  controllers: [VisitsController],
  providers: [VisitsService],
})
export class VisitsModule {}
