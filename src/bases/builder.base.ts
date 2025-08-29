export abstract class BaseBuilder<T extends object> {
  protected readonly rawData: Partial<T>;

  constructor(data: Partial<T> = {}) {
    this.rawData = data;
  }

  toJSON(): T {
    return this.rawData as T;
  }

  protected set<K extends keyof T>(key: K, value: T[K]): this {
    this.rawData[key] = value;
    return this;
  }

  protected merge(partialData: Partial<T>): this {
    Object.assign(this.rawData, partialData);
    return this;
  }

  protected pushToArray<K extends keyof T>(
    key: K,
    ...items: T[K] extends (infer U)[] | undefined ? U[] : never
  ): this {
    if (!this.rawData[key]) {
      this.rawData[key] = [] as T[K];
    }
    (this.rawData[key] as any[]).push(...items);
    return this;
  }

  protected setArray<K extends keyof T>(
    key: K,
    items: T[K] extends (infer U)[] | undefined ? U[] : never,
  ): this {
    this.rawData[key] = [...items] as T[K];
    return this;
  }

  protected clear<K extends keyof T>(key: K): this {
    delete this.rawData[key];
    return this;
  }

  protected has<K extends keyof T>(key: K): boolean {
    return this.rawData[key] !== undefined && this.rawData[key] !== null;
  }

  protected get<K extends keyof T>(key: K): T[K] | undefined {
    return this.rawData[key];
  }
}
