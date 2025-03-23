/**
 * Log messages can contain many different fields, so we'll use the
 * [key: string]: any; syntax to allow for any field to be present.
 *
 * This allows fields that are numbers, strings, booleans, arrays or objects.
 * The contract of the log is that it has to be valid JSON, no other restriction applies
 */
export interface Log {
  [key: string]: any;
}
