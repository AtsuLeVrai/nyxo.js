/**
 * Discord API Version Management
 *
 * This module provides a comprehensive enumeration of Discord API versions and utilities
 * for managing API version compatibility in your applications.
 *
 * @module Discord API Versions
 * @version 1.0.0
 * @see {@link https://discord.com/developers/docs/reference#api-versioning}
 */

/**
 * Discord API Versions
 *
 * Represents the available versions of the Discord API. Each version represents
 * a major iteration of the API with its own features, changes, and compatibility requirements.
 *
 * Version Timeline:
 * - V3-V8: Legacy versions (deprecated)
 * - V9: Previous stable version (maintenance mode)
 * - V10: Current recommended version
 * - V11: Future version (when available)
 *
 * @remarks
 * Version Selection Guidelines:
 * - New applications should always use the latest stable version (currently V10)
 * - Existing applications should plan regular version upgrades
 * - Consider API feature requirements when selecting a version
 * - Monitor Discord's developer documentation for deprecation notices
 *
 * @example
 * ```typescript
 * // Using the latest API version in requests
 * const apiVersion = ApiVersions.V10;
 * const baseUrl = `https://discord.com/api/v${apiVersion}`;
 *
 * // Making an authenticated request
 * const response = await fetch(`${baseUrl}/users/@me`, {
 *   headers: {
 *     Authorization: `Bot ${token}`,
 *     'Content-Type': 'application/json'
 *   }
 * });
 * ```
 *
 * @see {@link https://discord.com/developers/docs/reference#api-versioning-api-versions}
 * @since 2.0.0
 */
export enum ApiVersions {
    /**
     * Version 3 of the Discord API (Legacy)
     *
     * @deprecated This version has been fully deprecated and is no longer accessible.
     * Migration to {@link ApiVersions.V10} is required for continued API access.
     *
     * @remarks
     * - No longer maintains any backward compatibility
     * - All endpoints have been disabled
     * - No security updates or bug fixes
     */
    V3 = 3,

    /**
     * Version 4 of the Discord API (Legacy)
     *
     * @deprecated This version has been fully deprecated and is no longer accessible.
     * Migration to {@link ApiVersions.V10} is required for continued API access.
     *
     * @remarks
     * - No longer maintains any backward compatibility
     * - All endpoints have been disabled
     * - No security updates or bug fixes
     */
    V4 = 4,

    /**
     * Version 5 of the Discord API (Legacy)
     *
     * @deprecated This version has been fully deprecated and is no longer accessible.
     * Migration to {@link ApiVersions.V10} is required for continued API access.
     *
     * @remarks
     * - No longer maintains any backward compatibility
     * - All endpoints have been disabled
     * - No security updates or bug fixes
     */
    V5 = 5,

    /**
     * Version 6 of the Discord API (Legacy)
     *
     * @deprecated This version has been fully deprecated and is no longer accessible.
     * Migration to {@link ApiVersions.V10} is required for continued API access.
     *
     * @remarks
     * - No longer maintains any backward compatibility
     * - All endpoints have been disabled
     * - No security updates or bug fixes
     */
    V6 = 6,

    /**
     * Version 7 of the Discord API (Legacy)
     *
     * @deprecated This version has been fully deprecated and is no longer accessible.
     * Migration to {@link ApiVersions.V10} is required for continued API access.
     *
     * @remarks
     * - No longer maintains any backward compatibility
     * - All endpoints have been disabled
     * - No security updates or bug fixes
     */
    V7 = 7,

    /**
     * Version 8 of the Discord API (Legacy)
     *
     * @deprecated This version has been fully deprecated and is no longer accessible.
     * Migration to {@link ApiVersions.V10} is required for continued API access.
     *
     * @remarks
     * - No longer maintains any backward compatibility
     * - All endpoints have been disabled
     * - No security updates or bug fixes
     */
    V8 = 8,

    /**
     * Version 9 of the Discord API (Previous Stable)
     *
     * @remarks
     * While still functional, this version is in maintenance mode:
     * - Receives critical security updates only
     * - May experience breaking changes
     * - Missing latest API features and improvements
     * - Will eventually be deprecated
     *
     * Migration to V10 is recommended for:
     * - Access to new features
     * - Improved performance
     * - Long-term stability
     * - Better security
     *
     * @see {@link https://discord.com/developers/docs/reference#api-versioning-version-9}
     */
    V9 = 9,

    /**
     * Version 10 of the Discord API (Current Stable)
     *
     * The recommended version for all Discord API applications, featuring:
     * - Latest API features and improvements
     * - Enhanced security measures
     * - Optimized performance
     * - Regular updates and bug fixes
     * - Full documentation and support
     *
     * @remarks
     * Key Advantages:
     * - Complete feature set
     * - Active development and support
     * - Regular security updates
     * - Best performance characteristics
     * - Comprehensive documentation
     *
     * Best Practices:
     * - Use for all new applications
     * - Migrate existing applications when possible
     * - Monitor changelog for updates
     * - Implement proper error handling
     * - Follow rate limiting guidelines
     *
     * @see {@link https://discord.com/developers/docs/reference#api-versioning-version-10}
     * @recommended Use this version for all new applications
     */
    V10 = 10,
}
