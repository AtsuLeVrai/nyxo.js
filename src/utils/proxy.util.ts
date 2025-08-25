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

export function Pick<
  T extends new (
    ...args: any[]
  ) => any,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...selectedKeys: K[]): PickFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }
  if (selectedKeys.length === 0) {
    return new Proxy(BaseClass, {
      construct(target, args: unknown[]) {
        const instance = new (target as any)(...args);
        return new Proxy(instance, {
          get() {
            return undefined;
          },
          set() {
            return true;
          },
          has() {
            return false;
          },
          ownKeys() {
            return [];
          },
          getOwnPropertyDescriptor() {
            return undefined;
          },
        });
      },
    }) as PickFromConstructor<T, K>;
  }
  const selectedSet = new Set(selectedKeys as string[]);
  return new Proxy(BaseClass, {
    construct(target, args: unknown[]) {
      const instance = new (target as any)(...args);
      return new Proxy(instance, {
        get(target, prop) {
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return undefined;
          }
          return Reflect.get(target, prop);
        },
        set(target, prop, value) {
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return true;
          }
          return Reflect.set(target, prop, value);
        },
        has(target, prop) {
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return false;
          }
          return Reflect.has(target, prop);
        },
        ownKeys(target) {
          const keys = Reflect.ownKeys(target);
          return keys.filter((key) => selectedSet.has(key as string));
        },
        getOwnPropertyDescriptor(target, prop) {
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return undefined;
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
      });
    },
  }) as PickFromConstructor<T, K>;
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
  if (omittedKeys.length === 0) {
    return BaseClass as OmitFromConstructor<T, K>;
  }
  const omittedSet = new Set(omittedKeys as string[]);
  return new Proxy(BaseClass, {
    construct(target, args: unknown[]) {
      const instance = new (target as ClassConstructor)(...(args as never[]));
      return new Proxy(instance, {
        get(target, prop) {
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return undefined;
          }
          return Reflect.get(target, prop);
        },
        set(target, prop, value) {
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return true;
          }
          return Reflect.set(target, prop, value);
        },
        has(target, prop) {
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return false;
          }
          return Reflect.has(target, prop);
        },
        ownKeys(target) {
          const keys = Reflect.ownKeys(target);
          return keys.filter((key) => !omittedSet.has(key as string));
        },
        getOwnPropertyDescriptor(target, prop) {
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return undefined;
          }
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
      });
    },
  }) as OmitFromConstructor<T, K>;
}
