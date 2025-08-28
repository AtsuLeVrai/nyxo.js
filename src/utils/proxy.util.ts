/**
 * @description Generic constructor type for any class accepting unknown arguments.
 */
export type ClassConstructor<T = object> = new (...args: any[]) => T;

/**
 * @description Constructor type that omits specific properties from the resulting instance.
 */
export type OmitFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, K>;

/**
 * @description Constructor type that picks only specific properties from the resulting instance.
 */
export type PickFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Pick<InstanceType<T>, K>;

/**
 * @description Transforms snake_case property names to camelCase format (keys only).
 * Handles up to 3 levels of underscore nesting for performance optimization.
 */
export type CamelCaseKeys<T> = {
  [K in keyof T as K extends string
    ? K extends `${infer P}_${infer Q}`
      ? `${P}${Capitalize<
          Q extends `${infer R}_${infer S}`
            ? `${R}${Capitalize<S extends `${infer U}_${infer V}` ? `${U}${Capitalize<V>}` : S>}`
            : Q
        >}`
      : K
    : never]-?: any; // T[K] can be any type, we don't want to change it
};

/**
 * @description Recursively removes null values from nested type structures.
 * Preserves arrays and object hierarchies while stripping null at all levels.
 */
export type DeepNonNullable<T> = T extends (infer U)[]
  ? DeepNonNullable<U>[]
  : T extends Record<string, any>
    ? { [K in keyof T]: DeepNonNullable<T[K]> }
    : Exclude<T, null>;

/**
 * @description Recursively adds null possibility to nested type structures.
 * Maintains arrays and object hierarchies while adding nullability at all levels.
 */
export type DeepNullable<T> = T extends (infer U)[]
  ? DeepNullable<U>[]
  : T extends Record<string, any>
    ? { [K in keyof T]: DeepNullable<T[K]> }
    : T | null;

/**
 * @description Gets all property names from an object and its prototype chain (excluding Object.prototype).
 * @param obj - Object to inspect
 * @returns Set of all property names
 */
function getAllPropertyNames(obj: object): Set<PropertyKey> {
  const allNames = new Set<PropertyKey>();

  let current = obj;
  while (current && current !== Object.prototype) {
    // Get own properties (including non-enumerable ones)
    for (const name of Object.getOwnPropertyNames(current)) {
      if (name !== "constructor") {
        allNames.add(name);
      }
    }

    // Get symbols too
    for (const symbol of Object.getOwnPropertySymbols(current)) {
      allNames.add(symbol);
    }

    current = Object.getPrototypeOf(current);
  }

  return allNames;
}

/**
 * @description Hides a property/method by making it undefined and non-enumerable.
 * @param obj - Target object
 * @param key - Property key to hide
 */
function hideProperty(obj: object, key: PropertyKey): void {
  try {
    // First try to delete if possible
    delete (obj as any)[key];

    // Then redefine with getter that returns undefined
    Object.defineProperty(obj, key, {
      get: () => undefined,
      set: () => false, // Indicate assignment failure
      enumerable: false,
      configurable: false,
    });
  } catch {
    // If property is non-configurable, try to at least hide it from enumeration
    try {
      Object.defineProperty(obj, key, {
        enumerable: false,
      });
    } catch {
      // Property is completely locked, nothing we can do
    }
  }
}

/**
 * @description Creates class decorator that exposes only specified properties from base class.
 * Now handles both instance properties and prototype methods.
 *
 * @param BaseClass - Constructor function to extend
 * @param selectedKeys - Property names to keep visible
 * @returns New constructor with only selected properties accessible
 * @throws {TypeError} When BaseClass is not a constructor function
 */
export function PickBy<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...selectedKeys: K[]): PickFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }

  if (selectedKeys.length === 0) {
    return BaseClass as PickFromConstructor<T, K>;
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const selectedSet = new Set(selectedKeys as PropertyKey[]);

      // Get all properties from instance and prototype chain
      const allPropertyNames = getAllPropertyNames(this);

      // Hide non-selected properties
      for (const key of allPropertyNames) {
        if (!selectedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      // Also check instance properties that might not be in prototype
      const instanceKeys = Object.getOwnPropertyNames(this);
      for (const key of instanceKeys) {
        if (key !== "constructor" && !selectedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }
    }
  };
}

/**
 * @description Creates class decorator that hides specified properties from base class.
 * Now handles both instance properties and prototype methods.
 *
 * @param BaseClass - Constructor function to extend
 * @param omittedKeys - Property names to hide from instances
 * @returns New constructor with omitted properties hidden
 * @throws {TypeError} When BaseClass is not a constructor function
 */
export function OmitBy<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...omittedKeys: K[]): OmitFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }

  if (omittedKeys.length === 0) {
    return BaseClass as OmitFromConstructor<T, K>;
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const omittedSet = new Set(omittedKeys as PropertyKey[]);

      // Hide omitted properties from prototype chain
      const allPropertyNames = getAllPropertyNames(this);
      for (const key of allPropertyNames) {
        if (omittedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      // Also check instance properties
      const instanceKeys = Object.getOwnPropertyNames(this);
      for (const key of instanceKeys) {
        if (key !== "constructor" && omittedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }
    }
  };
}
