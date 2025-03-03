/**
 * Represents the Discord API version to use when making requests.
 *
 * The Discord API uses versioning to ensure backward compatibility.
 * As new features are added or existing functionality is changed, Discord increments the API version.
 *
 * It's recommended to always use the latest stable API version (currently V10).
 * Previous versions are deprecated and may be removed in future updates.
 *
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 * @enum {number}
 */
export enum ApiVersion {
  /**
   * Discord API Version 3.
   *
   * @deprecated This version has been officially deprecated by Discord.
   * Use {@link ApiVersion.V10} instead as it is the only supported version in Nyx.js.
   * @type {number}
   */
  V3 = 3,

  /**
   * Discord API Version 4.
   *
   * @deprecated This version has been officially deprecated by Discord.
   * Use {@link ApiVersion.V10} instead as it is the only supported version in Nyx.js.
   * @type {number}
   */
  V4 = 4,

  /**
   * Discord API Version 5.
   *
   * @deprecated This version has been officially deprecated by Discord.
   * Use {@link ApiVersion.V10} instead as it is the only supported version in Nyx.js.
   * @type {number}
   */
  V5 = 5,

  /**
   * Discord API Version 6.
   *
   * @deprecated This version has been officially deprecated by Discord.
   * Use {@link ApiVersion.V10} instead as it is the only supported version in Nyx.js.
   * @type {number}
   */
  V6 = 6,

  /**
   * Discord API Version 7.
   *
   * @deprecated This version has been officially deprecated by Discord.
   * Use {@link ApiVersion.V10} instead as it is the only supported version in Nyx.js.
   * @type {number}
   */
  V7 = 7,

  /**
   * Discord API Version 8.
   *
   * @deprecated This version has been officially deprecated by Discord.
   * Use {@link ApiVersion.V10} instead as it is the only supported version in Nyx.js.
   * @type {number}
   */
  V8 = 8,

  /**
   * Discord API Version 9.
   *
   * @deprecated Nyx.js supports only version 10 of the Discord API.
   * Use {@link ApiVersion.V10} instead for all implementations.
   * @type {number}
   */
  V9 = 9,

  /**
   * Discord API Version 10.
   *
   * This is the current stable version of the Discord API and the only version supported by Nyx.js.
   * All API calls should use this version to ensure proper functionality.
   * @type {number}
   */
  V10 = 10,
}
