# TypeScript Naming and Style Guide

## Table of Contents

1. [Interfaces](#1-interfaces)
2. [Classes](#2-classes)
3. [Types](#3-types)
4. [Functions](#4-functions)
5. [Advanced Patterns](#5-advanced-patterns)
6. [File Structure](#6-file-structure)
7. [Constants and Enums](#7-constants-and-enums)
8. [Best Practices](#8-best-practices)

## 1. Interfaces

### Data Interfaces (Entities)

```typescript
// ✅ Use Entity suffix for data structures
interface UserEntity {
    id: string;
    username: string;
    createdAt: Date;
}

// ✅ Use Response suffix for API responses
interface UserResponse {
    data: UserEntity;
    meta: ResponseMetadata;
}

// ❌ Avoid
interface IUser {
    ...
}  // Don't use I prefix
interface UserInterface {
    ...
}  // Don't use Interface suffix
```

### Behavioral Interfaces

```typescript
// ✅ Use clear, action-oriented names
interface Searchable {
    search(query: string): Promise<Result[]>;
}

interface Cacheable {
    getCacheKey(): string;

    getTTL(): number;
}

// ✅ Use Handler suffix for event handlers
interface EventHandler {
    handleEvent(event: Event): void;
}
```

## 2. Classes

### Private Members Convention

```typescript
// ❌ Avoid using the 'private' keyword
class BadExample {
    private data: string;  // Only TypeScript privacy
    private process(): void {
    }
}

// ✅ Use # for private members
class GoodExample {
    #data: string;  // Runtime privacy
    #cache: Map<string, any>;

    constructor(initialData: string) {
        this.#data = initialData;
        this.#cache = new Map();
    }

    #process(): void {
        // Private method implementation
    }
}
```

### Class Implementation

```typescript
class UserService implements Cacheable {
    #repository: UserRepository;
    #cache: Map<string, User>;

    constructor(repository: UserRepository) {
        this.#repository = repository;
        this.#cache = new Map();
    }

    async findById(id: string): Promise<User> {
        // Check cache first
        const cached = this.#cache.get(id);
        if (cached) return cached;

        // Fetch from repository
        const user = await this.#repository.findById(id);
        this.#cache.set(id, user);
        return user;
    }

    #validateUser(user: User): void {
        if (!user.email) {
            throw new ValidationError('Email is required');
        }
    }
}
```

### Abstract Classes

```typescript
// ✅ Use Base prefix for abstract classes
abstract class BaseRepository<T> {
    abstract find(id: string): Promise<T>;

    #validateId(id: string): void {
        if (!id) throw new Error('ID is required');
    }
}

// ✅ Error classes with Error suffix
class ValidationError extends Error {
    constructor(
        message: string,
        public readonly field: string
    ) {
        super(message);
    }
}
```

## 3. Types

### Simple Types

```typescript
// ✅ Domain-specific primitives
type UserId = string;
type Amount = number;
type Email = string;

// ✅ Union types with clear intent
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Theme = 'light' | 'dark' | 'system';

// ✅ Complex types with descriptive names
type HttpHeaders = Record<string, string | string[]>;
type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
```

### Generic Types

```typescript
// ✅ Clear generic constraints
type Nullable<T> = T | null;
type Optional<T> = T | undefined;

// ✅ Function types
type AsyncCallback<T, R> = (item: T) => Promise<R>;
type ErrorHandler = (error: Error) => void;

// Common generic naming conventions:
// T: Type
// K: Key
// V: Value
// E: Element
// P: Property
// R: Return type
// S: State
```

## 4. Functions

### Validation Functions

```typescript
// ✅ Use 'is' prefix for type guards
function isValidEmail(value: string): value is Email { ...
}

function isNonEmptyArray<T>(value: T[]): value is [T, ...T[]] { ...
}

// ✅ Use 'validate' prefix for complex validation
function validateUserInput(input: unknown): UserEntity { ...
}
```

### Formatting Functions

```typescript
// ✅ Use 'format' prefix for string markdown
function formatCurrency(amount: number, currency: string): string { ...
}

function formatPhoneNumber(phone: string, countryCode: string): string { ...
}

// ✅ Use 'to' prefix for type conversion
function toInt(value: string): number { ...
}

function toBoolean(value: unknown): boolean { ...
}
```

### Utility Functions

```typescript
// ✅ Use clear action verbs
function mergePaths(...paths: string[]): string { ...
}

function deduplicate<T>(array: T[]): T[] { ...
}

// ✅ Use 'ensure' prefix for guarantees
function ensureArray<T>(value: T | T[]): T[] { ...
}

function ensureError(value: unknown): Error { ...
}
```

## 5. Advanced Patterns

### State Management

```typescript
interface UserState {
    current: User | null;
    loading: boolean;
    error?: Error;
}

type UserAction =
    | { type: 'LOAD_USER' }
    | { type: 'SET_USER'; payload: User }
    | { type: 'SET_ERROR'; payload: Error };

class UserStore {
    #state: UserState;
    #listeners: Set<(state: UserState) => void>;

    constructor() {
        this.#state = {current: null, loading: false};
        this.#listeners = new Set();
    }
}
```

### Factory Pattern

```typescript
class NotificationFactory {
    #providers: Map<string, NotificationProvider>;

    create(type: 'email' | 'sms'): NotificationService {
        const provider = this.#providers.get(type);
        if (!provider) throw new Error(`Unknown type: ${type}`);
        return new NotificationService(provider);
    }
}
```

## 6. File Structure

### Directory Organization

```
src/
├── core/
│   ├── types.ts
│   ├── interfaces.ts
│   └── constants.ts
├── features/
│   ├── user/
│   │   ├── types.ts
│   │   ├── user.entity.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── index.ts
│   └── auth/
│       ├── auth.service.ts
│       └── index.ts
└── utils/
    ├── validation.ts
    └── formatting.ts
```

### Module Exports

```typescript
// ✅ Barrel exports in index.ts
export * from './interfaces';
export * from './types';
export {User} from './user.entity';
export {UserService} from './user.service';
```

## 7. Constants and Enums

### Constants

```typescript
// ✅ Use SCREAMING_SNAKE_CASE for true constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;

// ✅ Use PascalCase for enum-like objects
const HttpStatus = {
    OK: 200,
    Created: 201,
    BadRequest: 400,
} as const;
```

### Enums

```typescript
// ✅ Use singular for enum name, plural for values
enum Permission {
    None = 0,
    Read = 1 << 0,
    Write = 1 << 1,
    Delete = 1 << 2,
}

// ✅ Use Flag suffix for bitfields
enum UserFlags {
    None = 0,
    Premium = 1 << 0,
    Verified = 1 << 1,
}
```

## 8. Best Practices

### Type Safety

```typescript
// ✅ Use branded types for type safety
type Brand<K, T> = K & { __brand: T };
type UserId = Brand<string, 'UserId'>;

// ✅ Use const assertions for literal types
const Colors = {
    Primary: '#007bff',
    Success: '#28a745',
} as const;
```

### Error Handling

```typescript
type Result<T, E = Error> =
    | { success: true; data: T }
    | { success: false; error: E };

class NetworkError extends Error {
    constructor(
        message: string,
        public readonly statusCode: number,
        public readonly retryable: boolean
    ) {
        super(message);
    }
}
```

### Documentation

```typescript
/**
 * Represents a user in the system
 * @implements {Searchable} - Allows user search
 * @implements {Cacheable} - Enables caching
 */
interface UserEntity extends Searchable, Cacheable {
    /** Unique identifier for the user */
    id: UserId;
    /** Email address (must be unique) */
    email: Email;
}
```

### Testing

```typescript
describe('UserService', () => {
    describe('createUser', () => {
        it('should create a new user with valid input', async () => {
            const service = new UserService(mockRepository);
            const result = await service.createUser(validInput);
            expect(result.success).toBe(true);
        });
    });
});
```