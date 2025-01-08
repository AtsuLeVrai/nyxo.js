/**
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 */
export enum ApiVersion {
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V3 = 3,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V4 = 4,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V5 = 5,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V6 = 6,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V7 = 7,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V8 = 8,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 9 has been deprecated
   * @remarks
   * Nyx.js supports only version 10 of the Discord API
   */
  V9 = 9,
  V10 = 10,
}
