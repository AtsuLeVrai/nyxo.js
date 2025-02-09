import { GatewayOptions } from "@nyxjs/gateway";
import { RestOptions } from "@nyxjs/rest";
import { z } from "zod";

export const ClientOptions = z
  .object({
    ...RestOptions.unwrap().shape,
    ...GatewayOptions.unwrap().shape,
  })
  .readonly();

export type ClientOptions = z.infer<typeof ClientOptions>;
