type FallbackFn<T> = () => T | Promise<T>;
type ModuleCallback<T, R> = (module: T) => R | Promise<R>;

export const OptionalDeps = {
  async import<T>(
    moduleName: string,
    fallback?: FallbackFn<T>,
  ): Promise<T | null> {
    try {
      const module = await import(moduleName);
      const resolvedModule = module.default ?? module;
      return resolvedModule as T;
    } catch {
      if (fallback) {
        return fallback();
      }

      return null;
    }
  },

  async isAvailable(moduleName: string): Promise<boolean> {
    try {
      await import(moduleName);
      return true;
    } catch {
      return false;
    }
  },

  async withModule<T, R>(
    moduleName: string,
    callback: ModuleCallback<T, R>,
    fallback?: FallbackFn<R>,
  ): Promise<Awaited<R> | null> {
    const module = await this.import<T>(moduleName);

    if (module) {
      return callback(module) as Awaited<R>;
    }

    return fallback ? (fallback() as Awaited<R>) : null;
  },

  async importMany<T extends Record<string, unknown>>(
    moduleNames: string[],
    fallbacks?: Partial<Record<string, FallbackFn<unknown>>>,
  ): Promise<Partial<T>> {
    const results = await Promise.allSettled(
      moduleNames.map(async (name) => ({
        name,
        module: await this.import(name, fallbacks?.[name]),
      })),
    );

    return results.reduce(
      (acc, result) => {
        if (result.status === "fulfilled" && result.value.module) {
          (acc as Record<string, unknown>)[result.value.name] =
            result.value.module;
        }
        return acc;
      },
      {} as Partial<T>,
    );
  },
} as const;
