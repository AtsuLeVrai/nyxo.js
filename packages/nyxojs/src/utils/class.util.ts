/**
 * Type definition for a class constructor with flexible parameter handling.
 *
 * Represents any class constructor that can be instantiated with any number of parameters
 * and returns an instance of the specified type. Uses contravariance for parameters
 * to ensure type safety when working with inheritance hierarchies.
 *
 * @typeParam T - The type of instance that the constructor creates
 *
 * @internal
 */
type ClassConstructor<T = object> = new (...args: never[]) => T;

/**
 * Type utility for creating a constructor with omitted properties from the instance type.
 *
 * Creates a new constructor type that produces instances with specific properties removed.
 * This is useful for creating derived classes or proxy constructors that hide certain
 * properties from the original class while maintaining the constructor signature.
 *
 * @typeParam T - The original constructor type to modify
 * @typeParam K - The keys to omit from the resulting instance type
 *
 * @see {@link ClassConstructor} - Base constructor type definition
 * @see {@link Omit} - Runtime implementation for property omission
 *
 * @internal
 */
type OmitFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Omit<InstanceType<T>, K>;

/**
 * Type utility for creating a constructor with only specific properties from the instance type.
 *
 * Creates a new constructor type that produces instances with only the specified properties
 * accessible. This is useful for creating minimal interfaces or view objects that expose
 * only a subset of the original class properties while maintaining the constructor signature.
 *
 * @typeParam T - The original constructor type to modify
 * @typeParam K - The keys to pick and keep accessible in the resulting instance type
 *
 * @see {@link ClassConstructor} - Base constructor type definition
 * @see {@link Pick} - Runtime implementation for property selection
 *
 * @internal
 */
type PickFromConstructor<
  T extends ClassConstructor<any>,
  K extends PropertyKey & keyof InstanceType<T>,
> = new (...args: ConstructorParameters<T>) => Pick<InstanceType<T>, K>;

/**
 * Creates a proxy constructor that exposes only specified properties from class instances.
 *
 * This function provides runtime property selection for class instances, making only the
 * specified properties accessible while hiding all others. Non-selected properties return
 * `undefined`, become non-enumerable, and are excluded from property descriptors. The
 * selected properties maintain full functionality while all others are completely hidden.
 *
 * **Key Features:**
 * - **Property Access Control**: Only selected properties are accessible, others return `undefined`
 * - **Enumeration Filtering**: Only selected properties appear in `Object.keys()` or iteration
 * - **Write Protection**: Attempts to set non-selected properties are silently ignored
 * - **Type Safety**: Full TypeScript support with proper type inference
 * - **Method Preservation**: Methods continue to work if they are selected
 *
 * @typeParam T - The constructor type to modify
 * @typeParam K - The property keys to keep accessible in instances
 *
 * @param BaseClass - The original class constructor to wrap
 * @param selectedKeys - Variable number of property keys to keep accessible in instances
 *
 * @returns A new constructor that creates instances with only selected properties accessible
 *
 * @throws {TypeError} When BaseClass is not a valid constructor function
 *
 * @example
 * ```typescript
 * class User {
 *   constructor(
 *     public id: string,
 *     public name: string,
 *     public email: string,
 *     public password: string,
 *     public lastLogin: Date
 *   ) {}
 *
 *   getInfo(): string {
 *     return `${this.name} (${this.email})`;
 *   }
 * }
 *
 * // Create minimal version with only basic info
 * const MinimalUser = Pick(User, "name", "email", "getInfo");
 * const user = new MinimalUser("1", "John", "john@example.com", "secret", new Date());
 *
 * console.log(user.name);           // "John" ✅
 * console.log(user.email);          // "john@example.com" ✅
 * console.log(user.getInfo());      // "John (john@example.com)" ✅
 * console.log(user.password);       // undefined ✅
 * console.log(user.id);             // undefined ✅
 * console.log("password" in user);  // false ✅
 * console.log(Object.keys(user));   // ["name", "email"] ✅
 * ```
 *
 * @see {@link PickFromConstructor} - Type definition for the resulting constructor
 * @see {@link Omit} - Inverse operation that hides specified properties
 * @see {@link ClassConstructor} - Base constructor type used in implementation
 *
 * @public
 */
export function Pick<
  T extends new (
    ...args: any[]
  ) => any,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...selectedKeys: K[]): PickFromConstructor<T, K> {
  // Validate input parameters early to provide clear error messages
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }

  // Early return optimization for empty selected keys array
  // This creates an instance with no accessible properties
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

  // Create efficient lookup set for property checking during runtime
  // Set provides O(1) lookup performance compared to array includes
  const selectedSet = new Set(selectedKeys as string[]);

  // Create and return proxy constructor with comprehensive property filtering
  return new Proxy(BaseClass, {
    /**
     * Intercepts constructor calls to create proxied instances.
     *
     * Creates new instances of the base class and wraps them with property
     * access control to expose only selected properties from external interaction.
     *
     * @param target - The original constructor function being proxied
     * @param args - Arguments passed to the constructor
     * @returns Proxied instance with only selected properties accessible
     *
     * @internal
     */
    construct(target, args: unknown[]) {
      // Create instance using original constructor with provided arguments
      // Type assertion is safe here as we've validated the constructor type
      const instance = new (target as any)(...args);

      // Wrap the instance with comprehensive property access control
      return new Proxy(instance, {
        /**
         * Intercepts property access to expose only selected properties.
         *
         * Returns the actual value for selected properties while returning `undefined`
         * for all non-selected properties, effectively hiding them from access.
         *
         * @param target - The instance being accessed
         * @param prop - The property being accessed
         * @returns Property value for selected properties, undefined for others
         *
         * @internal
         */
        get(target, prop) {
          // Return undefined for non-selected string properties
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return undefined;
          }

          // Allow normal access for selected properties and symbols
          return Reflect.get(target, prop);
        },

        /**
         * Intercepts property assignment to prevent setting non-selected properties.
         *
         * Allows normal property assignment for selected properties while silently
         * ignoring attempts to set non-selected properties.
         *
         * @param target - The instance being modified
         * @param prop - The property being set
         * @param value - The value being assigned
         * @returns Always true to indicate successful handling
         *
         * @internal
         */
        set(target, prop, value) {
          // Silently ignore assignment attempts to non-selected properties
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return true;
          }

          // Allow normal property assignment for selected properties
          return Reflect.set(target, prop, value);
        },

        /**
         * Intercepts `in` operator and `hasOwnProperty` checks to hide non-selected properties.
         *
         * Returns `true` only for selected properties, making non-selected properties
         * completely invisible to property existence checks.
         *
         * @param target - The instance being checked
         * @param prop - The property being tested for existence
         * @returns True only for selected properties, false for others
         *
         * @internal
         */
        has(target, prop) {
          // Hide non-selected properties from existence checks
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return false;
          }

          // Normal existence checking for selected properties
          return Reflect.has(target, prop);
        },

        /**
         * Intercepts `Object.keys()`, `Object.getOwnPropertyNames()`, and iteration.
         *
         * Returns only selected properties in enumeration operations to maintain
         * complete property filtering while preserving normal enumeration for selected properties.
         *
         * @param target - The instance being enumerated
         * @returns Array of property keys including only selected properties
         *
         * @internal
         */
        ownKeys(target) {
          // Get all property keys from the original instance
          const keys = Reflect.ownKeys(target);

          // Filter to include only selected properties
          return keys.filter((key) => selectedSet.has(key as string));
        },

        /**
         * Intercepts property descriptor access to hide non-selected properties.
         *
         * Returns `undefined` for property descriptors of non-selected properties,
         * making them completely invisible to introspection while maintaining
         * normal descriptor access for selected properties.
         *
         * @param target - The instance being inspected
         * @param prop - The property whose descriptor is being requested
         * @returns Property descriptor for selected properties, undefined for others
         *
         * @internal
         */
        getOwnPropertyDescriptor(target, prop) {
          // Hide property descriptors for non-selected properties
          if (typeof prop === "string" && !selectedSet.has(prop)) {
            return undefined;
          }

          // Normal descriptor access for selected properties
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
      });
    },
  }) as PickFromConstructor<T, K>;
}

/**
 * Creates a proxy constructor that hides specified properties from class instances.
 *
 * This function provides runtime property omission for class instances, making specified
 * properties return `undefined`, become non-enumerable, and excluded from property
 * descriptors. The omitted properties are completely hidden from external access while
 * maintaining the original class functionality for non-omitted properties.
 *
 * **Key Features:**
 * - **Property Access Control**: Omitted properties return `undefined` when accessed
 * - **Enumeration Hiding**: Omitted properties don't appear in `Object.keys()` or iteration
 * - **Write Protection**: Attempts to set omitted properties are silently ignored
 * - **Type Safety**: Full TypeScript support with proper type inference
 * - **Inheritance Support**: Works with class inheritance and method calls
 *
 * @typeParam T - The constructor type to modify
 * @typeParam K - The property keys to omit from instances
 *
 * @param BaseClass - The original class constructor to wrap
 * @param omittedKeys - Variable number of property keys to omit from instances
 *
 * @returns A new constructor that creates instances with omitted properties hidden
 *
 * @throws {TypeError} When BaseClass is not a valid constructor function
 *
 * @example
 * ```typescript
 * class User {
 *   constructor(
 *     public id: string,
 *     public name: string,
 *     public email: string,
 *     public password: string
 *   ) {}
 *
 *   getInfo(): string {
 *     return `${this.name} (${this.email})`;
 *   }
 * }
 *
 * // Create public version without password
 * const PublicUser = Omit(User, "password");
 * const user = new PublicUser("1", "John", "john@example.com", "secret");
 *
 * console.log(user.name);           // "John" ✅
 * console.log(user.password);       // undefined ✅
 * console.log("password" in user);  // false ✅
 * console.log(Object.keys(user));   // ["id", "name", "email"] ✅
 * console.log(user.getInfo());      // "John (john@example.com)" ✅
 * ```
 *
 * @see {@link OmitFromConstructor} - Type definition for the resulting constructor
 * @see {@link ClassConstructor} - Base constructor type used in implementation
 *
 * @public
 */
export function Omit<
  T extends new (
    ...args: any[]
  ) => any,
  K extends PropertyKey & keyof InstanceType<T>,
>(BaseClass: T, ...omittedKeys: K[]): OmitFromConstructor<T, K> {
  // Validate input parameters early to provide clear error messages
  if (typeof BaseClass !== "function") {
    throw new TypeError("BaseClass must be a constructor function");
  }

  // Early return optimization for empty omitted keys array
  // This avoids unnecessary proxy overhead when no properties are omitted
  if (omittedKeys.length === 0) {
    return BaseClass as OmitFromConstructor<T, K>;
  }

  // Create efficient lookup set for property checking during runtime
  // Set provides O(1) lookup performance compared to array includes
  const omittedSet = new Set(omittedKeys as string[]);

  // Create and return proxy constructor with comprehensive property hiding
  return new Proxy(BaseClass, {
    /**
     * Intercepts constructor calls to create proxied instances.
     *
     * Creates new instances of the base class and wraps them with property
     * access control to hide omitted properties from external interaction.
     *
     * @param target - The original constructor function being proxied
     * @param args - Arguments passed to the constructor
     * @returns Proxied instance with omitted properties hidden
     *
     * @internal
     */
    construct(target, args: unknown[]) {
      // Create instance using original constructor with provided arguments
      // Type assertion is safe here as we've validated the constructor type
      const instance = new (target as ClassConstructor)(...(args as never[]));

      // Wrap the instance with comprehensive property access control
      return new Proxy(instance, {
        /**
         * Intercepts property access to hide omitted properties.
         *
         * Returns `undefined` for omitted properties while allowing normal
         * access to all other properties including methods and inherited members.
         *
         * @param target - The instance being accessed
         * @param prop - The property being accessed
         * @returns Property value or undefined for omitted properties
         *
         * @internal
         */
        get(target, prop) {
          // Return undefined for omitted string properties
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return undefined;
          }

          // Allow normal access for all other properties
          return Reflect.get(target, prop);
        },

        /**
         * Intercepts property assignment to prevent setting omitted properties.
         *
         * Silently ignores attempts to set omitted properties while allowing
         * normal property assignment for non-omitted properties.
         *
         * @param target - The instance being modified
         * @param prop - The property being set
         * @param value - The value being assigned
         * @returns Always true to indicate successful handling
         *
         * @internal
         */
        set(target, prop, value) {
          // Silently ignore assignment attempts to omitted properties
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return true;
          }

          // Allow normal property assignment for non-omitted properties
          return Reflect.set(target, prop, value);
        },

        /**
         * Intercepts `in` operator and `hasOwnProperty` checks to hide omitted properties.
         *
         * Returns `false` for omitted properties to make them completely invisible
         * to property existence checks while maintaining normal behavior for other properties.
         *
         * @param target - The instance being checked
         * @param prop - The property being tested for existence
         * @returns False for omitted properties, normal behavior for others
         *
         * @internal
         */
        has(target, prop) {
          // Hide omitted properties from existence checks
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return false;
          }

          // Normal existence checking for non-omitted properties
          return Reflect.has(target, prop);
        },

        /**
         * Intercepts `Object.keys()`, `Object.getOwnPropertyNames()`, and iteration.
         *
         * Filters out omitted properties from enumeration operations to maintain
         * complete property hiding while preserving normal enumeration for other properties.
         *
         * @param target - The instance being enumerated
         * @returns Array of property keys excluding omitted properties
         *
         * @internal
         */
        ownKeys(target) {
          // Get all property keys from the original instance
          const keys = Reflect.ownKeys(target);

          // Filter out omitted properties from the key list
          return keys.filter((key) => !omittedSet.has(key as string));
        },

        /**
         * Intercepts property descriptor access to hide omitted properties.
         *
         * Returns `undefined` for property descriptors of omitted properties,
         * making them completely invisible to introspection while maintaining
         * normal descriptor access for other properties.
         *
         * @param target - The instance being inspected
         * @param prop - The property whose descriptor is being requested
         * @returns Property descriptor or undefined for omitted properties
         *
         * @internal
         */
        getOwnPropertyDescriptor(target, prop) {
          // Hide property descriptors for omitted properties
          if (typeof prop === "string" && omittedSet.has(prop)) {
            return undefined;
          }

          // Normal descriptor access for non-omitted properties
          return Reflect.getOwnPropertyDescriptor(target, prop);
        },
      });
    },
  }) as OmitFromConstructor<T, K>;
}
