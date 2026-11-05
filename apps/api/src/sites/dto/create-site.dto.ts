import { Transform } from 'class-transformer';
import { IsMongoId, IsString, Length, Matches, MaxLength } from 'class-validator';
import {
  ADDRESS_PATTERN,
  CreateSiteRequest,
  MAX_HTML_BYTES,
  normalizeAddress,
} from '@smallweb/shared';

const MAX_TITLE_LENGTH = 120;

// Body of POST /api/sites. The decorators are the validation rules; a broken rule becomes a
// 400 VALIDATION_FAILED with one `details` entry per field.
export class CreateSiteDto implements CreateSiteRequest {
  // Normalized before it is checked, so " Test.ZZ " is accepted as "test.zz".
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? normalizeAddress(value) : value,
  )
  @IsString()
  @Matches(ADDRESS_PATTERN, { message: 'address must look like name.zz' })
  address!: string;

  @IsString()
  @Length(1, MAX_TITLE_LENGTH)
  title!: string;

  // Counted in characters, which is close enough to bytes for a size limit.
  @IsString()
  @MaxLength(MAX_HTML_BYTES)
  html!: string;

  @IsMongoId()
  authorId!: string;
}
