/**
 * Generic constructor type representing any class constructor.
 *
 * @typeParam T - The instance type produced by the constructor
 */
export type ClassConstructor<T = object> = new (...args: any[]) => T;

/**
 * Constructor type that omits specified properties from the instance type.
 * Creates a new constructor that produces instances without the omitted properties.
 *
 * @typeParam T - Base class constructor to modify
 * @typeParam K - Union of property keys to omit from the instance
 */
export type OmitFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, K>;

/**
 * Constructor type that picks only specified properties from the instance type.
 * Creates a new constructor that produces instances with only the selected properties.
 *
 * @typeParam T - Base class constructor to modify
 * @typeParam K - Union of property keys to include in the instance
 */
export type PickFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Pick<InstanceType<T>, K>;

/**
 * Collects all property names from an object and its prototype chain.
 * Includes both enumerable and non-enumerable properties, as well as symbols.
 *
 * @param obj - Object to inspect for properties
 * @returns Set containing all property keys (strings and symbols)
 * @private
 */
function getAllPropertyNames(obj: object): Set<PropertyKey> {
  const allNames = new Set<PropertyKey>();

  let current = obj;
  while (current && current !== Object.prototype) {
    // Collect own string properties (including non-enumerable)
    for (const name of Object.getOwnPropertyNames(current)) {
      if (name !== "constructor") {
        allNames.add(name);
      }
    }

    // Collect own symbol properties
    for (const symbol of Object.getOwnPropertySymbols(current)) {
      allNames.add(symbol);
    }

    current = Object.getPrototypeOf(current);
  }

  return allNames;
}

/**
 * Attempts to hide a property from an object by making it inaccessible.
 * Uses multiple strategies to handle different property descriptor scenarios.
 *
 * Strategy order:
 * 1. Delete property if configurable
 * 2. Redefine with getter returning undefined
 * 3. Make non-enumerable as fallback
 *
 * @param obj - Object containing the property to hide
 * @param key - Property key to hide (string or symbol)
 * @private
 */
function hideProperty(obj: object, key: PropertyKey): void {
  try {
    // Attempt to delete if configurable
    delete (obj as any)[key];

    // Redefine with getter that returns undefined
    Object.defineProperty(obj, key, {
      get: () => undefined,
      set: () => {
        // Silent failure for attempted writes
        return false;
      },
      enumerable: false,
      configurable: false,
    });
  } catch {
    // Property is non-configurable, try to hide from enumeration
    try {
      Object.defineProperty(obj, key, {
        enumerable: false,
      });
    } catch {
      // Property is completely locked - no action possible
      // This is expected for some built-in properties
    }
  }
}

/**
 * Creates a class proxy that exposes only selected properties from the base class.
 * All non-selected properties are hidden at runtime through property descriptor manipulation.
 *
 * Use cases:
 * - API surface reduction for public interfaces
 * - Creating minimal facades for complex classes
 * - Enforcing principle of least privilege in class hierarchies
 *
 * Limitations:
 * - Hidden properties remain accessible via Object.getOwnPropertyDescriptor
 * - Does not affect TypeScript type checking (only runtime behavior)
 * - Performance overhead from property inspection and manipulation
 *
 * @typeParam T - Base class constructor to wrap
 * @typeParam K - Union of property keys to include in the result
 * @param BaseClass - Constructor function to create proxy from
 * @param selectedKeys - Property keys to expose in the proxy class
 * @returns New constructor that produces instances with only selected properties
 * @throws {TypeError} When BaseClass is not a constructor function
 * @see {@link OmitBy} for inverse operation (exclude specific properties)
 *
 * @example
 * ```typescript
 * class User {
 *   id: number;
 *   name: string;
 *   password: string;
 *
 *   constructor(id: number, name: string, password: string) {
 *     this.id = id;
 *     this.name = name;
 *     this.password = password;
 *   }
 * }
 *
 * // Create public-facing user class without sensitive data
 * const PublicUser = PickBy(User, 'id', 'name');
 * const user = new PublicUser(1, 'John', 'secret123');
 * console.log(user.name); // 'John'
 * console.log(user.password); // undefined
 * ```
 */
export function PickBy<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...selectedKeys: K[]): PickFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError(`BaseClass must be a constructor function, received ${typeof BaseClass}`);
  }

  // If no keys specified, return original class (pick all)
  if (selectedKeys.length === 0) {
    return BaseClass as PickFromConstructor<T, K>;
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const selectedSet = new Set(selectedKeys as PropertyKey[]);

      // Collect all properties from instance and prototype chain
      const allPropertyNames = getAllPropertyNames(this);

      // Hide non-selected properties from prototype chain
      for (const key of allPropertyNames) {
        if (!selectedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      // Handle instance-own properties not in prototype
      const instanceKeys = Object.getOwnPropertyNames(this);
      for (const key of instanceKeys) {
        if (key !== "constructor" && !selectedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      // Handle symbol properties on instance
      const instanceSymbols = Object.getOwnPropertySymbols(this);
      for (const symbol of instanceSymbols) {
        if (!selectedSet.has(symbol as K)) {
          hideProperty(this, symbol);
        }
      }
    }
  };
}

/**
 * Creates a class proxy that hides specified properties from the base class.
 * All omitted properties are hidden at runtime through property descriptor manipulation.
 *
 * Use cases:
 * - Removing deprecated or internal APIs from public interfaces
 * - Creating restricted versions of classes for different contexts
 * - Implementing security boundaries in class hierarchies
 *
 * Limitations:
 * - Hidden properties remain accessible via Object.getOwnPropertyDescriptor
 * - Does not affect TypeScript type checking (only runtime behavior)
 * - Performance overhead from property inspection and manipulation
 *
 * @typeParam T - Base class constructor to wrap
 * @typeParam K - Union of property keys to exclude from the result
 * @param BaseClass - Constructor function to create proxy from
 * @param omittedKeys - Property keys to hide in the proxy class
 * @returns New constructor that produces instances without omitted properties
 * @throws {TypeError} When BaseClass is not a constructor function
 * @see {@link PickBy} for inverse operation (include only specific properties)
 *
 * @example
 * ```typescript
 * class DatabaseUser {
 *   id: number;
 *   email: string;
 *   passwordHash: string;
 *   internalMetadata: object;
 *
 *   constructor(data: any) {
 *     Object.assign(this, data);
 *   }
 *
 *   login(password: string): boolean {
 *     // Implementation
 *     return true;
 *   }
 * }
 *
 * // Create API-safe version without sensitive fields
 * const ApiUser = OmitBy(DatabaseUser, 'passwordHash', 'internalMetadata');
 * const user = new ApiUser({
 *   id: 1,
 *   email: 'user@example.com',
 *   passwordHash: 'hashed',
 *   internalMetadata: {}
 * });
 *
 * console.log(user.email); // 'user@example.com'
 * console.log(user.passwordHash); // undefined
 * console.log(user.login('pass')); // true (methods preserved)
 * ```
 */
export function OmitBy<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...omittedKeys: K[]): OmitFromConstructor<T, K> {
  if (typeof BaseClass !== "function") {
    throw new TypeError(`BaseClass must be a constructor function, received ${typeof BaseClass}`);
  }

  // If no keys specified, return original class (omit nothing)
  if (omittedKeys.length === 0) {
    return BaseClass as OmitFromConstructor<T, K>;
  }

  return class extends BaseClass {
    constructor(...args: any[]) {
      super(...args);

      const omittedSet = new Set(omittedKeys as PropertyKey[]);

      // Collect all properties from instance and prototype chain
      const allPropertyNames = getAllPropertyNames(this);

      // Hide omitted properties from prototype chain
      for (const key of allPropertyNames) {
        if (omittedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      // Handle instance-own properties not in prototype
      const instanceKeys = Object.getOwnPropertyNames(this);
      for (const key of instanceKeys) {
        if (key !== "constructor" && omittedSet.has(key as K)) {
          hideProperty(this, key);
        }
      }

      // Handle symbol properties on instance
      const instanceSymbols = Object.getOwnPropertySymbols(this);
      for (const symbol of instanceSymbols) {
        if (omittedSet.has(symbol as K)) {
          hideProperty(this, symbol);
        }
      }
    }
  };
}
