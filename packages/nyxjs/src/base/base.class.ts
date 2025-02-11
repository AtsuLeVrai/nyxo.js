import type { z } from "zod";
import { fromError } from "zod-validation-error";
import type { Client } from "../core/index.js";

export abstract class BaseClass<T> {
  protected client: Client;
  protected data: T;

  protected constructor(
    client: Client,
    schema: z.ZodSchema<T>,
    data: Partial<T> = {},
  ) {
    this.client = client;

    try {
      this.data = schema.parse(data);
    } catch (error) {
      throw new Error(fromError(error).message);
    }
  }

  abstract toJson(): T;
}
