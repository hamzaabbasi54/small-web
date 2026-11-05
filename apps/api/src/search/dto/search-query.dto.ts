import { Transform, Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../../common/page-limit';

const MIN_QUERY_LENGTH = 2;
const MAX_QUERY_LENGTH = 100;

// Query string of GET /api/search?q=fog&limit=10
export class SearchQueryDto {
  // Trimmed first, so "  a " counts as one character and is rejected.
  @Transform(({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @Length(MIN_QUERY_LENGTH, MAX_QUERY_LENGTH)
  q!: string;

  // Query strings are always text; @Type turns "10" into the number 10 before it is checked.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  limit: number = DEFAULT_PAGE_LIMIT;
}
