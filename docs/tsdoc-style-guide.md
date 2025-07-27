# TSDoc Style Guide

Universal TypeScript documentation guide for the Nyxo.js project.

## General Structure

### Main Description
- **First line**: Simple, direct description (like a title)
- **Second line**: Brief explanation of purpose or behavior

```typescript
/**
 * Manages user authentication tokens.
 * Handles token validation, refresh, and expiration.
 */
```

### Standard Sections (in order)

1. `@typeParam` - For generics
2. `@param` - Parameters with short descriptions
3. `@returns` - Return value
4. `@throws` - Possible errors
5. `@example` - Single example (functions only)
6. `@see` - Cross-references
7. `@since` - Version added (optional)
8. `@deprecated` - If obsolete (optional)
9. `@internal` / `@public` - Visibility

## Rules by Element Type

### Classes
```typescript
/**
 * Handles Discord API rate limiting.
 * Automatically manages request queuing and backoff strategies.
 *
 * @typeParam T - Type of requests being managed
 *
 * @example
 * ```typescript
 * const limiter = new RateLimiter({
 *   maxRequests: 50,
 *   timeWindow: 60000
 * });
 * ```
 *
 * @public
 */
```

### Public Methods/Functions
```typescript
/**
 * Sends a message to a Discord channel.
 * Returns the created message object on success.
 *
 * @param channelId - Target channel identifier
 * @param content - Message text content
 * @param options - Additional message options
 * @returns Promise resolving to the sent message
 *
 * @throws {PermissionError} When bot lacks send permissions
 * @throws {ValidationError} When content exceeds length limits
 *
 * @example
 * ```typescript
 * const message = await client.sendMessage("123456", "Hello world!");
 * ```
 *
 * @public
 */
```

### Getters/Setters/Properties
```typescript
/**
 * Current connection status.
 * Updates automatically when connection state changes.
 *
 * @public
 */
readonly status: ConnectionStatus;

/**
 * Bot user information.
 * Available after successful authentication.
 *
 * @public
 */
get user(): User | null;

/**
 * API request timeout duration.
 * Set to 0 for no timeout.
 *
 * @default 30000
 * @public
 */
timeout: number;
```

### Types/Interfaces
```typescript
/**
 * Configuration for Discord client initialization.
 * Controls authentication, intents, and behavior settings.
 *
 * @public
 */
interface ClientOptions {
  /**
   * Discord bot token for authentication.
   * Must include "Bot " prefix for bot accounts.
   */
  token: string;

  /**
   * Gateway intents to subscribe to.
   * Determines which events the bot receives.
   *
   * @default []
   */
  intents?: number[];
}
```

### Enums
```typescript
/**
 * Discord application command types.
 * Determines how users can invoke the command.
 *
 * @public
 */
enum CommandType {
  /**
   * Slash command invoked with forward slash.
   * Most common command type for modern bots.
   */
  ChatInput = 1,

  /**
   * Context menu command on users.
   * Appears in user right-click menus.
   */
  User = 2,

  /**
   * Context menu command on messages.
   * Appears in message right-click menus.
   */
  Message = 3
}
```

### Private Methods (no examples)
```typescript
/**
 * Validates incoming gateway payload structure.
 * Ensures payload matches expected Discord format.
 *
 * @param payload - Raw gateway data to validate
 * @returns True if payload is valid
 *
 * @internal
 */
#validatePayload(payload: unknown): boolean;
```

## Style Rules

### Language
- **Professional but accessible tone** (not overly technical)
- **Action verbs** for methods: "Sends", "Creates", "Validates"
- **Short descriptions**: 1-2 lines maximum
- **Avoid jargon** when simpler terms exist

### Examples
- **One example only** per function
- **Clean code without inline comments**
- **Realistic, representative usage**
- **No examples** for getters, setters, properties, or private methods

### Parameters
```typescript
/**
 * @param userId - Unique user identifier
 * @param options - Configuration object
 * @param timeout - Maximum wait time in milliseconds
 */
```

### Returns
```typescript
/**
 * @returns Promise resolving to user data
 * @returns The builder instance for method chaining
 * @returns Array of matching results
 */
```

### Throws
```typescript
/**
 * @throws {APIError} When Discord API returns an error
 * @throws {TimeoutError} When request exceeds timeout
 */
```

## Examples to Avoid

### ❌ Too verbose
```typescript
/**
 * This sophisticated method implements a comprehensive mechanism for
 * the retrieval and processing of user authentication credentials through
 * advanced validation protocols and security measures...
 */
```

### ❌ Too simple
```typescript
/**
 * Gets data
 */
```

### ❌ Examples everywhere
```typescript
/**
 * Current user count
 *
 * @example
 * ```typescript
 * console.log(guild.memberCount);
 * ```
 */
get memberCount(): number;
```

## Correct Examples

### ✅ Public Method
```typescript
/**
 * Creates a new role in the guild.
 * Returns the created role with assigned permissions.
 *
 * @param name - Role display name
 * @param permissions - Role permission flags
 * @returns Promise resolving to the created role
 *
 * @throws {PermissionError} When bot lacks manage roles permission
 *
 * @example
 * ```typescript
 * const role = await guild.createRole("Moderator", ["MANAGE_MESSAGES"]);
 * ```
 *
 * @public
 */
```

### ✅ Property
```typescript
/**
 * Guild member count.
 * Includes all members regardless of online status.
 *
 * @readonly
 * @public
 */
readonly memberCount: number;
```

### ✅ Type
```typescript
/**
 * Result wrapper for async operations.
 * Provides type-safe error handling without exceptions.
 *
 * @typeParam T - Success value type
 * @typeParam E - Error type
 *
 * @public
 */
type Result<T, E = Error> = {
  success: true;
  data: T;
} | {
  success: false;
  error: E;
};
```

## Quick Checklist

- [ ] Description in 1-2 lines max
- [ ] One example for functions only
- [ ] Sections in correct order
- [ ] Professional but accessible tone
- [ ] Clean example code without comments
- [ ] Generics documented with `@typeParam`
- [ ] Errors documented with `@throws`
- [ ] Visibility marked (`@public`, `@internal`)
- [ ] Universal patterns (not specific to one component)