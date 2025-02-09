import type { GatewayEventHandlers } from "@nyxjs/gateway";
import type { RestEventHandlers } from "@nyxjs/rest";
import type { Ready } from "../class/index.js";

export interface ClientEventHandlers
  extends RestEventHandlers,
    GatewayEventHandlers {
  ready: (ready: Ready) => void;
}
