# Naming Conventions & Architecture Guide

This document outlines the naming conventions, organizational patterns, and architectural decisions for this Discord API library.

## Table of Contents

- [Naming Conventions](#naming-conventions)
- [Interface vs Class Design](#interface-vs-class-design)
- [Type Safety Patterns](#type-safety-patterns)
- [Code Organization Principles](#code-organization-principles)

## Naming Conventions

### Interfaces: Following Discord Documentation

**Convention**: Use Discord's official terminology with "Object" suffix

```typescript
// ✅ Follows Discord documentation exactly
interface UserObject { ... }
interface ConnectionObject { ... }
interface EmojiObject { ... }

// ❌ Deviates from official Discord naming
interface APIUser { ... }
interface IUser { ... }
interface UserData { ... }
```

**Rationale**:
- Maintains fidelity to official Discord API documentation
- Developers can easily map between docs and code
- Creates consistency with Discord's own naming patterns
- Ensures the library stays close to the official API structure

### Enums: Clean Names Without Suffixes

**Convention**: Use descriptive names without redundant suffixes

```typescript
// ✅ Clean, follows Discord documentation
enum UserFlags { ... }
enum PremiumType { ... }
enum OAuth2Scope { ... }

// ❌ Redundant suffixes
enum UserFlagsEnum { ... }
enum PremiumTypeEnum { ... }
```

**Rationale**:
- TypeScript already identifies these as enums
- Shorter, cleaner names improve readability
- Follows modern TypeScript conventions

### Classes: Simple Names for User-Facing APIs

**Convention**: Use clean names without prefixes/suffixes for user-facing classes

```typescript
// ✅ Clean, user-friendly
class User { ... }
class Guild { ... }
class Message { ... }

// ❌ Unnecessarily verbose
class UserClass { ... }
class UserManager { ... }
class DiscordUser { ... }
```

**Rationale**:
- Provides clean, intuitive API for library users
- Distinguishes between raw API data (UserObject) and enhanced functionality (User)

### Utility Types: Descriptive and Functional

```typescript
// ✅ Clear purpose and functionality
type EmojiResolvable = string | ResolvedEmoji | Partial<ResolvedEmoji>;
type PropsToCamel<T> = ...;
type Enforce<T> = ...;

// ✅ Derived types using Pick for consistency
type ResolvedEmoji = Pick<EmojiObject, "id" | "name" | "animated">;
```

## Interface vs Class Design

### Interfaces: API Fidelity

**Purpose**: Represent Discord API responses exactly as received

```typescript
interface UserObject {
  id: Snowflake;
  username: string;
  global_name: string | null;  // Keeps snake_case from API
  avatar: string | null;
  // ... exactly as Discord sends it
}
```

**Key Principles**:
- Maintain exact field names from Discord API (snake_case)
- Preserve nullable types as Discord specifies
- No additional methods or computed properties
- Pure data representation

### Classes: Enhanced Developer Experience

**Purpose**: Provide type-safe, developer-friendly wrappers with camelCase properties

```typescript
class User implements Enforce<PropsToCamel<UserObject>> {
  readonly #data: UserObject;
  
  readonly id = this.#data.id;
  readonly globalName = this.#data.global_name;  // snake_case → camelCase
  readonly avatarDecorationData = this.#data.avatar_decoration_data;
  
  constructor(data: UserObject) {
    this.#data = data;
  }
  
  // Additional methods, computed properties, etc.
}
```

**Key Principles**:
- Convert snake_case to camelCase for JavaScript conventions
- Provide type safety through generic type transformations
- Store raw API data internally for reference
- Add computed properties and methods for enhanced functionality

## Type Safety Patterns

### Automatic Case Conversion

```typescript
type CamelCase<S extends string> = S extends `${infer P}_${infer Q}`
  ? `${P}${Capitalize<CamelCase<Q>>}`
  : S;

type PropsToCamel<T> = T extends Array<infer U>
  ? PropsToCamel<U>[]
  : T extends object
    ? { [K in keyof T as CamelCase<K & string>]: PropsToCamel<T[K]> }
    : T;
```

**Benefits**:
- Automatic conversion from Discord's snake_case to JavaScript camelCase
- Type-level transformation ensures compile-time safety
- Eliminates manual property mapping errors

### Property Enforcement

```typescript
type Enforce<T extends object, PreserveValueTypes extends boolean = false> = {
  [K in keyof T]-?: PreserveValueTypes extends true
    ? T[K] extends null | undefined ? NonNullable<T[K]> : T[K]
    : any;
};
```

**Benefits**:
- Forces implementation of all interface properties
- TypeScript compiler catches missing properties
- Ensures complete API coverage

### DRY Type Patterns

```typescript
// ✅ Derive types from main interfaces to avoid duplication
type ResolvedEmoji = Pick<EmojiObject, "id" | "name" | "animated">;

// ✅ Use generic types for reusable patterns
type Resolvable<T> = string | T | Partial<T>;
```

## Code Organization Principles

### Cohesion: Related Code Together

**Pattern**: Keep types and their utilities in the same file when closely related

```typescript
// emoji.ts - Everything emoji-related together
export interface EmojiObject { ... }
export type ResolvedEmoji = Pick<EmojiObject, "id" | "name" | "animated">;
export type EmojiResolvable = string | ResolvedEmoji | Partial<ResolvedEmoji>;

export function resolveEmoji(emoji: EmojiResolvable): ResolvedEmoji { ... }
export function encodeEmoji(emoji: EmojiResolvable): string { ... }
```

**Benefits**:
- Single import for all emoji-related functionality
- Changes to interfaces automatically affect related utilities
- Easier maintenance and debugging

### Consistent Import Patterns

```typescript
// ✅ Explicit, traceable imports
import type { Snowflake } from "../common/index.js";
import type { UserObject } from "./user.js";

// ✅ Group by type
import type { ... } from "...";  // Types first
import { ... } from "...";       // Values second
```

## Design Philosophy

### Documentation-First Approach

All naming and structure decisions prioritize alignment with Discord's official documentation. This ensures:
- Easy onboarding for developers familiar with Discord API
- Reduced cognitive load when switching between docs and code
- Future-proofing against Discord API changes

### Type Safety Over Convenience

When choosing between convenience and type safety, this library chooses type safety:
- Explicit types over `any`
- Compile-time checks over runtime validation
- Verbose but correct over concise but error-prone

### Developer Experience

While maintaining API fidelity, the library provides enhanced developer experience through:
- camelCase properties in classes
- Intuitive method names and signatures
- Comprehensive type inference
- Clear error messages through TypeScript

This approach creates a library that is both faithful to Discord's API and pleasant to use in modern TypeScript applications.