# TSDoc Documentation Guidelines

> **Official documentation standards for Nyxo.js**  
> Ultra-performance TypeScript Discord library

## 📋 General Pattern

All TypeScript elements must follow this structure:

```typescript
/**
 * @description 1-2 sentences maximum. Focus on purpose and context.
 * @see {@link https://discord.com/developers/docs/...} - Link to Discord docs when relevant
 *
 * @param paramName - Brief parameter description
 * @returns Clear description of return value
 * @throws {ErrorType} Only document important/common errors
 */
```

## 🎯 Documentation Standards by Type

### **Type Definitions**

```typescript
/**
 * @description Unique 64-bit identifier used throughout Discord API for all entities.
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export type Snowflake = string;

/**
 * @description Supported content formats for Discord messages.
 * @see {@link https://discord.com/developers/docs/resources/channel#message-object}
 */
export type MessageContent = string | MessageEmbed | MessagePayload;
```

### **Constants**

```typescript
/**
 * @description Core API endpoints for REST requests and WebSocket connections.
 * @see {@link https://discord.com/developers/docs/reference#api-reference}
 */
export const API_ENDPOINTS = {
        BASE: "https://discord.com/api/v10",
        GATEWAY: "wss://gateway.discord.gg",
        CDN: "https://cdn.discordapp.com"
    } as const;

/**
 * @description Base timestamp for Discord snowflake calculations (January 1, 2015, 00:00:00 UTC). All Discord snowflakes are calculated relative to this epoch using bitwise operations.
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export const DISCORD_EPOCH = 1420070400000n as const;

/**
 * @description Bitwise permission constants for Discord guild and channel permissions.
 * @see {@link https://discord.com/developers/docs/topics/permissions#permissions-bitwise-permission-flags}
 */
export const PERMISSIONS = {
    VIEW_CHANNEL: 1n << 10n,
    SEND_MESSAGES: 1n << 11n,
    MANAGE_MESSAGES: 1n << 13n
} as const;
```

### **Functions**

```typescript
/**
 * @description Dispatches message with intelligent rate limiting and zero-cache design.
 * @see {@link https://discord.com/developers/docs/resources/channel#create-message}
 *
 * @param channelId - Target channel snowflake ID
 * @param content - Message content (max 2000 characters)
 * @param options - Optional message configuration
 * @returns Promise resolving to created message object
 * @throws {RateLimitError} When hitting Discord rate limits
 * @throws {PermissionError} When lacking SEND_MESSAGES permission
 * @throws {ValidationError} When content exceeds character limits
 */
export async function sendMessage(
    channelId: Snowflake,
    content: string,
    options?: MessageOptions
): Promise<Message> {
    // Implementation
}

/**
 * @description Checks if member has required permissions in specific context.
 *
 * @param memberPermissions - Member's current permission bitfield
 * @param requiredPermissions - Required permission flags
 * @returns True if member has all required permissions
 */
export function hasPermissions(
    memberPermissions: bigint,
    requiredPermissions: bigint
): boolean {
    return (memberPermissions & requiredPermissions) === requiredPermissions;
}
```

### **Classes**

```typescript
/**
 * @description Represents a Discord guild with zero-cache, always-fresh data approach.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-object}
 */
export class Guild {
    /**
     * @description Unique identifier for this Discord guild.
     */
    public readonly id: Snowflake;

    /**
     * @description Retrieves member data directly from Discord API without caching.
     * @see {@link https://discord.com/developers/docs/resources/guild#get-guild-member}
     *
     * @param memberId - Member snowflake ID to fetch
     * @returns Promise resolving to guild member object
     * @throws {NotFoundError} When member doesn't exist in guild
     * @throws {PermissionError} When lacking access to member data
     */
    async fetchMember(memberId: Snowflake): Promise<GuildMember> {
        // Implementation
    }

    /**
     * @description Creates channel with specified configuration and permissions.
     * @see {@link https://discord.com/developers/docs/resources/guild#create-guild-channel}
     *
     * @param options - Channel creation configuration
     * @returns Promise resolving to created channel object
     * @throws {PermissionError} When lacking MANAGE_CHANNELS permission
     * @throws {ValidationError} When channel configuration is invalid
     */
    async createChannel(options: CreateChannelOptions): Promise<Channel> {
        // Implementation
    }
}
```

### **Interfaces**

```typescript
/**
 * @description Configuration for creating Discord messages with embeds and components.
 * @see {@link https://discord.com/developers/docs/resources/channel#create-message-jsonform-params}
 */
export interface MessageOptions {
    /**
     * @description Array of embed objects to include (max 10 embeds).
     * @see {@link https://discord.com/developers/docs/resources/channel#embed-object}
     */
    embeds?: MessageEmbed[];

    /**
     * @description Button and select menu components (max 5 action rows).
     * @see {@link https://discord.com/developers/docs/interactions/message-components}
     */
    components?: ActionRow[];

    /**
     * @description Files to attach to message (max 10 files, 25MB total).
     */
    files?: MessageFile[];

    /**
     * @description Reference to another message for reply functionality.
     * @see {@link https://discord.com/developers/docs/resources/channel#message-reference-object-message-reference-structure}
     */
    reply?: MessageReference;
}

/**
 * @description Represents a Discord user's membership in a specific guild.
 * @see {@link https://discord.com/developers/docs/resources/guild#guild-member-object}
 */
export interface GuildMember {
    /** User object for this member */
    user: User;
    /** Member's guild nickname */
    nick?: string;
    /** Array of role IDs assigned to member */
    roles: Snowflake[];
    /** ISO8601 timestamp of when member joined guild */
    joined_at: string;
}
```

### **Utility Objects**

```typescript
/**
 * @description Essential utilities for working with Discord snowflake identifiers. Snowflakes are unique 64-bit identifiers used throughout Discord API for all entities.
 * @see {@link https://discord.com/developers/docs/reference#snowflakes}
 */
export const SnowflakeUtil = {
        /**
         * @description Checks if string matches valid Discord snowflake pattern (17-20 digits).
         * @param id - String to validate as Discord snowflake
         * @returns True if valid snowflake format
         */
        isValid: (id: string): boolean => /^\d{17,20}$/.test(id),

        /**
         * @description Converts Discord snowflake to Unix timestamp in milliseconds using bitwise operations.
         * @see {@link https://discord.com/developers/docs/reference#convert-snowflake-to-datetime}
         * @param id - Discord snowflake ID
         * @returns Unix timestamp when the snowflake was created
         * @throws {TypeError} When ID cannot be converted to BigInt
         */
        toTimestamp: (id: string): number => Number((BigInt(id) >> 22n) + 1420070400000n),
    } as const;
```

## 📝 Documentation Rules

### **Required Elements**

- ✅ **@description** - 1-2 sentences explaining purpose and context
- ✅ **@param** - For all function/method parameters
- ✅ **@returns** - For all functions that return values

### **Conditional Elements**

- 🔗 **@see {@link}** - When Discord API documentation exists
- ⚠️ **@throws** - Only for common/important errors
- 📅 **@deprecated** - When marking legacy features

### **Forbidden Elements**

- ❌ **Title lines** - Name should be self-explanatory, start with @description
- ❌ **@example** - Too maintenance-heavy for active development
- ❌ **@since** - Not needed for initial release
- ❌ **@author** - Repository attribution is sufficient
- ❌ **@version** - Package.json handles versioning

## 🎯 Best Practices

### **Writing Style**

- **Start directly** with @description - no redundant titles
- Use **present tense**: "Checks if valid" not "Will check if valid"
- Be **specific**: "Discord channel" not just "channel"
- Stay **concise**: Avoid redundant explanations
- Use **active voice**: "Validates input" not "Input is validated"

### **Discord Context**

- Always mention **Discord** when relevant for context
- Link to **official Discord documentation** when available
- Use **Discord terminology**: "guild" not "server", "snowflake" not "ID"
- Reference **permission requirements** for privileged operations

### **Performance Notes**

- Mention **zero-cache** behavior when relevant
- Highlight **memory efficiency** for critical operations
- Note **rate limiting** protection where applicable
- Document **direct API** calls vs cached data

### **Error Documentation**

Only document these error types:

- **PermissionError** - Missing Discord permissions
- **RateLimitError** - Discord API rate limits
- **ValidationError** - Invalid input data
- **NotFoundError** - Resource doesn't exist
- **TypeError** - Invalid data types (BigInt conversion, etc.)

## 📋 Quick Reference

### **Function Template**

```typescript
/**
 * @description [Action/purpose in 1-2 sentences with performance/cache notes if relevant].
 * @see {@link [Discord docs URL]}
 *
 * @param param1 - [Brief description]
 * @param param2 - [Brief description with constraints if any]
 * @returns [Clear return description]
 * @throws {ErrorType} [When this error occurs]
 */
```

### **Interface Template**

```typescript
/**
 * @description [Structure purpose and Discord context].
 * @see {@link [Discord docs URL]}
 */
export interface Name {
    /**
     * @description [Property purpose and constraints]
     */
    property: Type;
}
```

### **Utility Template**

```typescript
/**
 * @description [Utility collection purpose and performance notes].
 * @see {@link [Discord docs URL]}
 */
export const NameUtil = {
        /**
         * @description [Action description]
         * @param param - [Description]
         * @returns [Return description]
         * @throws {ErrorType} [Error condition]
         */
        method: (param: Type): ReturnType => implementation,
    } as const;
```

### **Constant Template**

```typescript
/**
 * @description [Purpose and context with technical details if needed].
 * @see {@link [Discord docs URL]}
 */
export const CONSTANT_NAME = value as const;
```

## 💬 Internal Code Comments (`//`)

### **Philosophy: Minimal and Strategic**

Code should be **self-documenting first**. Use `//` comments sparingly and only when they add real value.

### **✅ Good Internal Comments**

```typescript
export function parseSnowflake(id: string): number {
    // Discord epoch: January 1, 2015 (not Unix epoch)
    const discordEpoch = 1420070400000n;

    // Extract timestamp using bitwise right shift (22 bits)
    const timestamp = (BigInt(id) >> 22n) + discordEpoch;

    return Number(timestamp);
}

export async function sendWithRetry(request: APIRequest): Promise<Response> {
    let attempts = 0;

    while (attempts < 3) {
        try {
            return await this.execute(request);
        } catch (error) {
            attempts++;

            // Rate limit: wait and retry automatically  
            if (error instanceof RateLimitError) {
                await this.waitForRateLimit(error.retryAfter);
                continue;
            }

            // Permission errors: fail fast, no retry
            if (error instanceof PermissionError) {
                throw error;
            }

            // Unknown error on last attempt: give up
            if (attempts === 3) throw error;
        }
    }
}

export class RateLimiter {
    private shouldQueue(request: Request): boolean {
        // Major parameters (channelId, guildId) share rate limits
        // Minor parameters (messageId) have separate buckets
        const bucket = this.getBucket(request);
        return bucket.remaining < 2; // Safety margin
    }
}
```

### **❌ Bad Internal Comments**

```typescript
// BAD - Code speaks for itself
function isValid(id: string): boolean {
    // Check if id matches regex pattern
    return /^\d{17,20}$/.test(id);
}

// BAD - Repeats TSDoc
/**
 * @description Validates Discord snowflake format
 */
function isValid(id: string): boolean {
    // Validates Discord snowflake format
    return /^\d{17,20}$/.test(id);
}

// BAD - Obsolete/wrong comments
function calculate(value: number): number {
    // TODO: Add validation (never done)
    // This uses the old algorithm (but it's the new one)
    return value * 2.5;
}

// BAD - Obvious statements
enabled = true; // Set enabled to true
count++; // Increment counter
```

### **📝 Comment Guidelines**

**Use `//` comments ONLY for:**

- **Complex algorithms** (bitwise operations, mathematical formulas)
- **Discord-specific business rules** (rate limits, permission logic, API quirks)
- **Performance optimizations** (why this specific approach was chosen)
- **Non-obvious behavior** (Discord API gotchas, timing requirements)
- **External context** (RFC references, Discord documentation links)

**DON'T use `//` comments for:**

- **Obvious code** (assignments, simple conditionals)
- **Repeating function names** or TSDoc descriptions
- **TODO items** that won't be done soon
- **Debugging code** left in production
- **What the code does** (code should show this)

**Style Rules:**

- **Concise and precise** - Maximum impact, minimum words
- **Technical context** - Explain the "why", not the "what"
- **Present tense** - "Discord uses milliseconds" not "Discord will use"
- **One line preferred** - Multi-line only for complex explanations

**Target Ratio:** ~1 comment per 10-20 lines of code, only when adding real value.

---

**This documentation standard ensures consistency, maintainability, and developer-friendly Discord bot development with
Nyxo.js.**