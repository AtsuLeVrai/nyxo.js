import { camelCase, snakeCase } from "change-case";
import type {
  CamelCasedPropertiesDeep,
  SnakeCasedPropertiesDeep,
} from "type-fest";

export function camelCaseDeep<T extends object>(
  obj: T,
): CamelCasedPropertiesDeep<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" && item !== null ? camelCaseDeep(item) : item,
    ) as CamelCasedPropertiesDeep<T>;
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[camelCase(key) as keyof typeof acc] =
        typeof value === "object" && value !== null
          ? camelCaseDeep(value)
          : value;

      return acc;
    },
    {} as CamelCasedPropertiesDeep<T>,
  );
}

export function snakeCaseDeep<T extends object>(
  obj: T,
): SnakeCasedPropertiesDeep<T> {
  if (Array.isArray(obj)) {
    return obj.map((item) =>
      typeof item === "object" && item !== null ? snakeCaseDeep(item) : item,
    ) as SnakeCasedPropertiesDeep<T>;
  }

  return Object.entries(obj).reduce(
    (acc, [key, value]) => {
      acc[snakeCase(key) as keyof typeof acc] =
        typeof value === "object" && value !== null
          ? snakeCaseDeep(value)
          : value;

      return acc;
    },
    {} as SnakeCasedPropertiesDeep<T>,
  );
}
