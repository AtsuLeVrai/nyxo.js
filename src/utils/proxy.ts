export type ClassConstructor<T = object> = new (...args: any[]) => T;

export type OmitFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, K>;

export type PickFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Pick<InstanceType<T>, K>;

function getAllPropertyNames(obj: object): Set<PropertyKey> {
  const allNames = new Set<PropertyKey>();

  let current = obj;
  while (current && current !== Object.prototype) {
    for (const name of Object.getOwnPropertyNames(current)) {
      if (name !== "constructor") {
        allNames.add(name);
      }
    }

    for (const symbol of Object.getOwnPropertySymbols(current)) {
      allNames.add(symbol);
    }

    current = Object.getPrototypeOf(current);
  }

  return allNames;
}

function hideProperty(obj: object, key: PropertyKey): void {
  try {
    delete (obj as any)[key];

    Object.defineProperty(obj, key, {
      get: () => undefined,
      set: () => {
        return false;
      },
      enumerable: false,
      configurable: false,
    });
  } catch {
    try {
      Object.defineProperty(obj, key, {
        enumerable: false,
      });
    } catch {}
  }
}

export function PickBy<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...selectedKeys: K[]): PickFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError(`BaseClass must be a constructor function, received ${typeof BaseClass}`);
  }

  if (selectedKeys.length === 0) {
    return BaseClass as PickFromConstructor<T, K>;
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const selectedSet = new Set(selectedKeys as PropertyKey[]);

      const allPropertyNames = getAllPropertyNames(this);

      for (const key of allPropertyNames) {
        if (!selectedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      const instanceKeys = Object.getOwnPropertyNames(this);
      for (const key of instanceKeys) {
        if (key !== "constructor" && !selectedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      const instanceSymbols = Object.getOwnPropertySymbols(this);
      for (const symbol of instanceSymbols) {
        if (!selectedSet.has(symbol as K)) {
          hideProperty(this, symbol);
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
    throw new TypeError(`BaseClass must be a constructor function, received ${typeof BaseClass}`);
  }

  if (omittedKeys.length === 0) {
    return BaseClass as OmitFromConstructor<T, K>;
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const omittedSet = new Set(omittedKeys as PropertyKey[]);

      const allPropertyNames = getAllPropertyNames(this);

      for (const key of allPropertyNames) {
        if (omittedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      const instanceKeys = Object.getOwnPropertyNames(this);
      for (const key of instanceKeys) {
        if (key !== "constructor" && omittedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      const instanceSymbols = Object.getOwnPropertySymbols(this);
      for (const symbol of instanceSymbols) {
        if (omittedSet.has(symbol as K)) {
          hideProperty(this, symbol);
        }
      }
    }
  };
}
