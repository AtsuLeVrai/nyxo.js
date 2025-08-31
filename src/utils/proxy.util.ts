export type ClassConstructor<T = object> = new (...args: any[]) => T;

export type OmitFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, K>;

export type PickFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Pick<InstanceType<T>, K>;

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

export type DeepNonNullable<T> = T extends (infer U)[]
  ? DeepNonNullable<U>[]
  : T extends Record<string, any>
    ? { [K in keyof T]: DeepNonNullable<T[K]> }
    : Exclude<T, null>;

export type DeepNullable<T> = T extends (infer U)[]
  ? DeepNullable<U>[]
  : T extends Record<string, any>
    ? { [K in keyof T]: DeepNullable<T[K]> }
    : T | null;

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
