export const OptionalDeps = {
  async import<T>(moduleName: string): Promise<T> {
    const module = await import(moduleName);
    return (module.default ?? module) as T;
  },

  async isAvailable(moduleName: string): Promise<boolean> {
    try {
      await import(moduleName);
      return true;
    } catch {
      return false;
    }
  },

  async importMany<T extends Record<string, unknown>>(
    moduleNames: string[],
  ): Promise<Partial<T>> {
    const results = await Promise.allSettled(
      moduleNames.map(async (name) => ({
        name,
        module: await this.import(name),
      })),
    );

    return results.reduce(
      (acc, result) => {
        if (result.status === "fulfilled" && result.value.module) {
          acc[result.value.name as keyof T] = result.value.module as T[keyof T];
        }
        return acc;
      },
      {} as Partial<T>,
    );
  },
} as const;
