/**
 * Represents the different Discord API versions that can be used when making requests.
 *
 * @remarks
 * The Discord API uses version numbers to manage breaking changes and feature updates.
 * Each version has a specific status (Available, Deprecated, or Discontinued) that
 * indicates its current support level.
 *
 * @example
 * ```typescript
 * // Using the latest available version
 * const apiVersion = ApiVersion.V10;
 * ```
 *
 * @public
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 */
export enum ApiVersion {
  /**
   * Discord API version 3.
   *
   * @remarks
   * This version has been discontinued and is no longer supported.
   *
   * @deprecated Use {@link ApiVersion.V10} instead - Version 3 has been discontinued
   */
  V3 = 3,

  /**
   * Discord API version 4.
   *
   * @remarks
   * This version has been discontinued and is no longer supported.
   *
   * @deprecated Use {@link ApiVersion.V10} instead - Version 4 has been discontinued
   */
  V4 = 4,

  /**
   * Discord API version 5.
   *
   * @remarks
   * This version has been discontinued and is no longer supported.
   *
   * @deprecated Use {@link ApiVersion.V10} instead - Version 5 has been discontinued
   */
  V5 = 5,

  /**
   * Discord API version 6.
   *
   * @remarks
   * While this was previously the default version, it has been deprecated.
   *
   * @deprecated Use {@link ApiVersion.V10} instead - Version 6 has been deprecated
   */
  V6 = 6,

  /**
   * Discord API version 7.
   *
   * @remarks
   * This version has been deprecated and will be discontinued in the future.
   *
   * @deprecated Use {@link ApiVersion.V10} instead - Version 7 has been deprecated
   */
  V7 = 7,

  /**
   * Discord API version 8.
   *
   * @remarks
   * This version introduced improved error formatting in form error responses.
   *
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  V8 = 8,

  /**
   * Discord API version 9.
   *
   * @remarks
   * This version is currently available and supported.
   */
  V9 = 9,

  /**
   * Discord API version 10.
   *
   * @remarks
   * This is the latest available version of the Discord API.
   * It is recommended to use this version for all new implementations.
   */
  V10 = 10,
}
