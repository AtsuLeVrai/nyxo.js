/**
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 */
export const ApiVersion = {
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  v3: 3,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  v4: 4,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  v5: 5,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  v6: 6,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  v7: 7,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 8 has been deprecated
   */
  v8: 8,
  /**
   * @deprecated Use {@link ApiVersion.V10} instead - Version 9 has been deprecated
   * @remarks
   * Nyx.js supports only version 10 of the Discord API
   */
  v9: 9,
  v10: 10,
} as const;

export type ApiVersion = (typeof ApiVersion)[keyof typeof ApiVersion];
