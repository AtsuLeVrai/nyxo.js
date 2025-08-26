type ClassConstructor<T = object> = new (...args: never[]) => T;

type OmitFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, K>;

type PickFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Pick<InstanceType<T>, K>;

export type GuildBased<T extends object> = T & {
  guild_id: string;
};

export type TransformToCamelCase<T> = {
  [K in keyof T as K extends string
    ? K extends `${infer P}_${infer Q}`
      ? `${P}${Capitalize<
          Q extends `${infer R}_${infer S}`
            ? `${R}${Capitalize<S extends `${infer T}_${infer U}` ? `${T}${Capitalize<U>}` : S>}`
            : Q
        >}`
      : K
    : never]-?: any;
};

export type StripNull<T> = T extends (infer U)[]
  ? StripNull<U>[]
  : T extends Record<string, any>
    ? { [K in keyof T]: StripNull<T[K]> }
    : Exclude<T, null>;

export function Pick<
  T extends new (
    ...args: any[]
  ) => any,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...selectedKeys: K[]): PickFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const selectedSet = new Set(selectedKeys as string[]);
      const allKeys = Object.getOwnPropertyNames(this);

      for (const key of allKeys) {
        const shouldKeep = selectedKeys.length === 0 ? false : selectedSet.has(key);

        if (!shouldKeep && key !== "constructor") {
          try {
            delete (this as any)[key];

            Object.defineProperty(this, key, {
              get: () => undefined,
              set: () => true,
              enumerable: false,
              configurable: false,
            });
          } catch {
            // Ignore errors for non-configurable properties
          }
        }
      }
    }
  };
}

export function Omit<
  T extends new (
    ...args: any[]
  ) => any,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...omittedKeys: K[]): OmitFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      for (const key of omittedKeys) {
        delete (this as any)[key];

        Object.defineProperty(this, key, {
          get: () => undefined,
          set: () => true,
          writable: false,
          enumerable: false,
          configurable: false,
        });
      }
    }
  };
}
