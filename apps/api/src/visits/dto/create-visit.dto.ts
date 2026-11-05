import { IsIn, IsString, MaxLength } from 'class-validator';
import { CreateVisitRequest, VISIT_VIAS, type VisitVia } from '@smallweb/shared';

// Same cap as a link destination in the sanitizer.
const MAX_ADDRESS_LENGTH = 300;

// Body of POST /api/people/:personId/visits.
export class CreateVisitDto implements CreateVisitRequest {
  // Not checked against the address pattern: typing nonsense still counts as a visit (to Nowhere).
  @IsString()
  @MaxLength(MAX_ADDRESS_LENGTH)
  address!: string;

  @IsIn(VISIT_VIAS)
  via!: VisitVia;
}
