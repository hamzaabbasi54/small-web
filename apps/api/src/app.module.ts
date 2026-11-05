import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health/health.controller';
import { PeopleModule } from './people/people.module';
import { SitesModule } from './sites/sites.module';
import { VisitsModule } from './visits/visits.module';

// @Module tells Nest which controllers and modules to start. ConfigModule reads apps/api/.env.
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    // Connect to MongoDB once, using MONGODB_URI from .env.
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.getOrThrow<string>('MONGODB_URI'),
      }),
    }),
    PeopleModule,
    SitesModule,
    VisitsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
