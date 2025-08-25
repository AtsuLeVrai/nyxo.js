import type { LocaleValues } from "../../enum/index.js";

export enum ApplicationRoleConnectionMetadataType {
  IntegerLessThanOrEqual = 1,
  IntegerGreaterThanOrEqual = 2,
  IntegerEqual = 3,
  IntegerNotEqual = 4,
  DatetimeLessThanOrEqual = 5,
  DatetimeGreaterThanOrEqual = 6,
  BooleanEqual = 7,
  BooleanNotEqual = 8,
}

export interface ApplicationRoleConnectionMetadataEntity {
  type: ApplicationRoleConnectionMetadataType;
  key: string;
  name: string;
  name_localizations?: Partial<Record<LocaleValues, string>>;
  description: string;
  description_localizations?: Partial<Record<LocaleValues, string>>;
}
