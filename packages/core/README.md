<div align="center">
  <h1>⚙️ @nyxjs/core</h1>
  <h3>Type-Safe Discord API Definitions and Utilities</h3>

  <p align="center">
    <a href="https://github.com/AtsuLeVrai/nyx.js/blob/main/LICENSE">
      <img src="https://img.shields.io/github/license/AtsuLeVrai/nyx.js?style=for-the-badge&logo=gnu&color=A42E2B" alt="License">
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-100%25-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript">
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/badge/Node.js-%3E%3D22.0.0-339933?style=for-the-badge&logo=node.js" alt="Node.js">
    </a>
  </p>

  <br />
  <img src="../../public/nyxjs_banner.png" alt="Nyx.js Banner" width="70%" style="border-radius: 8px;">
</div>

## 🚀 About

`@nyxjs/core` provides comprehensive TypeScript definitions and utilities for interacting with the Discord API. It
serves as the foundation for the Nyx.js ecosystem, offering complete type safety and helper functions for Discord's
complex data structures.

> [!NOTE]
> This package is part of the Nyx.js ecosystem but can be used independently in any Discord bot or Node.js application.

## ✨ Features

- **📋 Complete API Definitions**
    - Exhaustive TypeScript types for all Discord API objects
    - Enums and constants for Discord-specific values
    - Interfaces that mirror Discord's official documentation

- **🔢 Advanced Bit Field Management**
    - Type-safe bit field operations for permissions and flags
    - Chainable API for adding, removing, and testing bits
    - Utilities for working with Discord's permission system

- **🪪 Snowflake Utilities**
    - Parse and validate Discord's unique identifiers
    - Extract timestamps, worker IDs, and other information
    - Generate and compare Snowflake IDs

- **💬 Discord Markdown**
    - Type-safe helpers for Discord's rich text formatting
    - Functions for creating embeds, components, and attachments
    - Formatting utilities for code blocks, mentions, and timestamps

## 📦 Installation

```bash
# Using npm
npm install @nyxjs/core

# Using pnpm (recommended)
pnpm add @nyxjs/core
```

## 🔧 Basic Usage

### Working with Entities

```typescript
import {UserEntity, MessageEntity, ChannelType} from '@nyxjs/core';

// Type-safe Discord objects
const user: UserEntity = {
    id: '123456789012345678',
    username: 'NyxBot',
    discriminator: '0000',
    global_name: 'Nyx Bot',
    avatar: null,
    bot: true
};

// Check channel types
function isTextChannel(type: ChannelType): boolean {
    return type === ChannelType.GuildText || type === ChannelType.DM;
}
```

### Bit Field Management

```typescript
import {BitwisePermissionFlags, BitFieldManager} from '@nyxjs/core';

// Create a permission bit field
const permissions = new BitFieldManager<BitwisePermissionFlags>(
    BitwisePermissionFlags.ViewChannel |
    BitwisePermissionFlags.SendMessages
);

// Check permissions
if (permissions.has(BitwisePermissionFlags.Administrator)) {
    console.log('User has administrator permissions');
}

// Add and remove permissions
permissions.add(BitwisePermissionFlags.ManageMessages)
    .remove(BitwisePermissionFlags.SendMessages);

// Convert to array of flags
const flagArray = permissions.toArray();
```

### Snowflake Management

```typescript
import {SnowflakeManager} from '@nyxjs/core';

// Parse a Discord Snowflake ID
const snowflake = new SnowflakeManager('175928847299117063');

// Get the creation timestamp
const timestamp = snowflake.getTimestamp();
const creationDate = snowflake.toDate();

console.log(`Entity was created at: ${creationDate.toISOString()}`);

// Compare snowflakes
const isNewer = snowflake.isNewerThan('175928847299117062');

// Create a snowflake from a timestamp
const newSnowflake = SnowflakeManager.fromTimestamp(Date.now());
```

### Discord Markdown

```typescript
import {
    bold, italics, underline, strikethrough,
    codeBlock, quote, spoiler,
    formatUser, formatChannel, formatTimestamp,
    TimestampStyle
} from '@nyxjs/core';

// Create formatted text
const formattedMessage = `
${bold('Welcome to our server!')}
${italics('Please read the rules before posting.')}

Rules:
${quote('Be respectful to others')}
${quote('No spamming or excessive mentions')}

Server features:
${codeBlock(`
• Custom roles
• Music bot
• Weekly events
`, 'markdown')}

${spoiler('Secret information only revealed on click!')}
`;

// Format mentions and timestamps
const userMention = formatUser('123456789012345678');
const channelLink = formatChannel('876543210987654321');
const currentTime = formatTimestamp(Math.floor(Date.now() / 1000), TimestampStyle.ShortDateTime);

const announcement = `${userMention} Check out ${channelLink} for our event starting at ${currentTime}!`;
```

## 🚄 Advanced Examples

### Handling Discord Permissions

```typescript
import {
    BitwisePermissionFlags,
    BitFieldManager
} from '@nyxjs/core';

// Define permission sets
const textChannelPerms = new BitFieldManager<BitwisePermissionFlags>(
    BitwisePermissionFlags.ViewChannel |
    BitwisePermissionFlags.SendMessages |
    BitwisePermissionFlags.EmbedLinks
);

const moderatorPerms = new BitFieldManager<BitwisePermissionFlags>(
    BitwisePermissionFlags.ManageMessages |
    BitwisePermissionFlags.KickMembers |
    BitwisePermissionFlags.BanMembers
);

// Combine permissions
const allPerms = BitFieldManager.combine(textChannelPerms, moderatorPerms);

// Check missing permissions
function checkRequiredPermissions(
    userPerms: BitFieldManager<BitwisePermissionFlags>,
    requiredPerms: BitFieldManager<BitwisePermissionFlags>
): string[] {
    const missing = userPerms.missing(requiredPerms.valueOf());

    // Convert missing permission bits to readable names
    return missing.map(bit => {
        const permName = Object.entries(BitwisePermissionFlags)
            .find(([_, value]) => BigInt(value) === bit)?.[0] || 'Unknown';

        return permName.replace(/([A-Z])/g, ' $1').trim();
    });
}
```

### Working with Discord Snowflakes

```typescript
import {SnowflakeManager, Snowflake} from '@nyxjs/core';

// Define a function to analyze entities by their creation date
function analyzeTiming(entities: Record<string, any>) {
    const entityInfo = Object.entries(entities).map(([id, data]) => {
        const snowflake = new SnowflakeManager(id as Snowflake);
        return {
            id,
            createdAt: snowflake.toDate(),
            data
        };
    });

    // Sort by creation time (oldest first)
    entityInfo.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // Group by creation month
    const byMonth: Record<string, typeof entityInfo> = {};
    for (const entity of entityInfo) {
        const month = entity.createdAt.toISOString().substring(0, 7); // YYYY-MM
        byMonth[month] = byMonth[month] || [];
        byMonth[month].push(entity);
    }

    return {entityInfo, byMonth};
}
```

### Using Entities and Enums

```typescript
import {
    MessageType,
    MessageFlags,
    MessageEntity,
    UserEntity,
    ChannelType
} from '@nyxjs/core';

// Check if a message is a reply
function isReply(message: MessageEntity): boolean {
    return message.type === MessageType.Reply;
}

// Check if a message is ephemeral
function isEphemeral(message: MessageEntity): boolean {
    return !!(message.flags && (message.flags & MessageFlags.Ephemeral));
}

// Create a utility function to filter messages
function filterMessages(
    messages: MessageEntity[],
    options: {
        types?: MessageType[],
        excludeTypes?: MessageType[],
        hasAttachments?: boolean,
        fromBot?: boolean
    }
): MessageEntity[] {
    return messages.filter(msg => {
        if (options.types && !options.types.includes(msg.type)) {
            return false;
        }

        if (options.excludeTypes && options.excludeTypes.includes(msg.type)) {
            return false;
        }

        if (options.hasAttachments !== undefined) {
            const hasAttachments = msg.attachments.length > 0;
            if (hasAttachments !== options.hasAttachments) {
                return false;
            }
        }

        if (options.fromBot !== undefined) {
            const isBot = !!msg.author.bot;
            if (isBot !== options.fromBot) {
                return false;
            }
        }

        return true;
    });
}
```

## 📜 License

This package is [AGPL-3.0 licensed](LICENSE).