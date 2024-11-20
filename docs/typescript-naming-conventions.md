# TypeScript Naming Conventions Guide

## 1. Interfaces and Classes

### Main Pattern

```typescript
interface UserEntity {    // Data structure
    id: string;
    // ...
}

class User implements UserEntity {    // Business logic
    // ...
}
```

### Avoid

- ❌ `IUser`
- ❌ `UserImpl`
- ❌ `AbstractUser`
- ❌ `UserClass`

## 2. Types

### Simple Types

```typescript
type UserRole = 'admin' | 'user';    // ✅ Simple and descriptive
type UserFormat = 'full' | 'short';  // ✅ No Type suffix
```

### Avoid

- ❌ `UserRoleType`
- ❌ `UserRoleTypes`
- ❌ `TUserRole`

## 3. Enums

### Plural for Collections

```typescript
enum UserFlags {    // ✅ Plural for flag collection
    STAFF,
    PARTNER
}
```

### Singular for Unique States

```typescript
enum PremiumType {    // ✅ Singular for single state
    NONE,
    NITRO
}
```

## 4. Special Cases

### React Props

```typescript
interface ButtonProps {    // ✅ Props suffix
    label: string;
}
```

### DTOs

```typescript
interface UserDto {    // ✅ Dto suffix
    // ...
}
```

### States

```typescript
interface UserState {    // ✅ State suffix
    isLoading: boolean;
}
```

### Validators

```typescript
function isValidUser() {    // ✅ 'is' prefix
    // ...
}
```

## 5. Generics

```typescript
interface Repository<TEntity> {    // ✅ T prefix for generic
    find(id: string): TEntity;
}
```

## Golden Rules

1. **Singular** for base interfaces/classes
2. **Plural** only for collections (Flags, Constants)
3. **No technical prefixes** (I, Abstract, etc.)
4. **Descriptive suffixes** when needed (Dto, Props, State)
5. **Consistency** across the codebase