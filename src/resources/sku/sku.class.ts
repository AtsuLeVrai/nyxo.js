import { BaseClass } from "../../bases/index.js";
import type { CamelCaseKeys } from "../../utils/index.js";
import type { SKUEntity } from "./sku.entity.js";

export class SKU extends BaseClass<SKUEntity> implements CamelCaseKeys<SKUEntity> {
  readonly id = this.rawData.id;
  readonly type = this.rawData.type;
  readonly applicationId = this.rawData.application_id;
  readonly name = this.rawData.name;
  readonly slug = this.rawData.slug;
  readonly flags = this.rawData.flags;
}
