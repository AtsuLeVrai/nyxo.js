# TypeScript Naming Conventions Guide

## 1. Interfaces and Classes

### Main Pattern - Entity and Implementation

```typescript
// Data interface (Entity)
interface UserEntity {
    id: string;
    username: string;
}

// Implementation class (Business Logic)
class User implements UserEntity {
    constructor(private data: UserEntity) {}
    
    getDisplayName(): string {
        return this.data.username;
    }
}
```

### Interface Rules

- Use `Entity` suffix for pure data interfaces
- Keep simple names for behavioral interfaces

```typescript
// Data interface
interface MessageEntity { ... }

// Behavioral interface
interface Sendable {
    send(): Promise<void>;
}
```

### Class Rules

- No prefix/suffix for main implementations
- `Base` prefix for abstract classes

```typescript
// Concrete classes
class User { ... }
class Message { ... }

// Abstract classes
abstract class BaseCommand { ... }
abstract class BaseHandler { ... }
```

## 2. Types

### Simple Types

```typescript
// Custom primitive types
type SnowflakeManager = string;
type Integer = number;

// Union types
type UserRole = 'admin' | 'user';
type ConnectionStatus = 'online' | 'offline' | 'away';
```

### Generic Types

```typescript
// Descriptive suffix for use case
type BitFieldResolvable<T> = T | bigint | string;
type DataWrapper<T> = {
    data: T;
    metadata: Record<string, unknown>;
};
```

## 3. Enums

### Flags (Bit Collections)

- Use `Flags` suffix for bit enums
- Singular names for each flag

```typescript
enum PermissionFlags {
    CreateInstantInvite = 1 << 0,
    KickMembers = 1 << 1,
    // ...
}
```

### States and Types

- No suffix for state/type enums
- Descriptive names

```typescript
enum Premium {
    None,
    Basic,
    Standard,
    Pro
}

enum ConnectionVisibility {
    None,
    Everyone
}
```

## 4. Functions

### Formatting

```typescript
// 'format' prefix for formatting functions
function formatUser(userId: SnowflakeManager): string { ...
}

function formatTimestamp(date: Date): string { ...
}
```

### Validation

```typescript
// 'is' prefix for validation functions
function isValidSnowflake(value: string): boolean { ... }
function isExpired(timestamp: number): boolean { ... }
```

### Utilities

```typescript
// Action verbs for utilities
function parseSnowflake(snowflake: SnowflakeManager): Date { ...
}

function calculatePermissions(flags: PermissionFlags[]): bigint { ...
}
```

## 5. Managers

### Management Classes

- `Manager` suffix for management classes

```typescript
class BitFieldManager<T> { ... }
class CacheManager { ... }
```

### Collections and Registries

- `Registry` suffix for registries
- `Collection` suffix for specialized collections

```typescript
class CommandRegistry {
...
}

class UserCollection extends Collection<SnowflakeManager, User> {
...
}
```

## 6. General Best Practices

### Casing

- `PascalCase` for types, interfaces, classes, and enums
- `camelCase` for functions, methods, and properties
- `SCREAMING_SNAKE_CASE` for constants

### Prefixes to Avoid

- ❌ `I` for interfaces
- ❌ `T` for types (except generics)
- ❌ `E` for enums

### Suffixes to Use Sparingly

- `Entity` only for data interfaces
- `Manager` only for management classes
- `Factory` only for object creation classes

### Documentation

```typescript
/**
 * Interface description
 * @see {@link https://api-docs.example.com/reference}
 */
interface MessageEntity {
    /** Unique message identifier */
    id: SnowflakeManager;
    /** Message content */
    content: string;
}
```

## 7. Imports and Exports

### Organization

```typescript
// Named exports for types and interfaces
export interface UserEntity { ... }
export type UserRole = 'admin' | 'user';

// Default export for the main class of the file
export default class User { ... }
```

### Grouping

```typescript
// index.ts for grouping exports
export * from './entities/index.js';
export * from './managers/index.js';
export { default as User } from './User.js';
```

## 8. File Structure

### File Organization

- One class/interface per file (when possible)
- Group related functionality in directories
- Use `index.ts` files for exports
- Keep imports clean and organized

## 9. Additional Tips

### Type Safety

- Prefer interfaces for public APIs
- Use type aliases for complex types
- Leverage union types for better type safety

```typescript
// Good
type Status = 'pending' | 'success' | 'error';

// Avoid
type Status = string;
```

### Nullable Properties

- Be explicit about nullable properties
- Use optional chaining when appropriate

```typescript
interface UserProfile {
    name: string;            // Required
    avatar: string | null;   // Can be null
    bio?: string;           // Optional
}
```

### Generic Naming

- Use descriptive names for generics
- Common conventions:
    - `T` for generic type
    - `K` for keys
    - `V` for values
    - `E` for elements

```typescript
interface Dictionary<K extends string, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): void;
}
```