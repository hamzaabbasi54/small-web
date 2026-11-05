/**
 * An address looks like `name.zz`: the name is 1–63 characters of a-z, 0-9 and `-`,
 * and may not start or end with `-`. Always normalize before matching.
 */
export const ADDRESS_PATTERN = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.zz$/;

/** Trim surrounding whitespace and lowercase, so `" Tidepool.ZZ "` becomes `"tidepool.zz"`. */
export function normalizeAddress(input: string): string {
  return input.trim().toLowerCase();
}

/** True when the input, once normalized, is a well-formed address. */
export function isValidAddress(input: string): boolean {
  return ADDRESS_PATTERN.test(normalizeAddress(input));
}
