export interface ProcessOptions {
  validateEtfKeys?: boolean;
  processBigInts?: boolean;
}

export enum EncodingType {
  Json = "json",
  Etf = "etf",
}
