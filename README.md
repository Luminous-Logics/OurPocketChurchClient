# Parish Management System - API Documentation

## Overview

This Parish Management System uses a **standardized API response structure** for all endpoints. The system provides type-safe API methods, authentication handling, and comprehensive error management.

---

## Quick Start

### 1. Making API Calls

```typescript
import { apiGet, apiPost } from "@/lib/api";
import { isSuccessResponse } from "@/utils/apiHelpers";

const response = await apiGet<Ward[]>("/api/wards");

if (isSuccessResponse(response)) {
  console.log(response.data); // Ward[]
} else {
  console.error(response.error.message);
}
```

### 2. User Authentication

```typescript
import { login } from "@/lib/actions/auth";
import { isSuccessResponse } from "@/utils/apiHelpers";

const response = await login({
  email: "user@parish.com",
  password: "password123"
});

if (isSuccessResponse(response)) {
  console.log("Logged in:", response.user);
  // Automatically redirected to /home
} else {
  console.error(response.error.message);
}
```

---

## API Response Structure

### Success Response

```typescript
{
  success: true,
  data: T,
  message?: string,
  pagination?: {
    currentPage: number,
    pageSize: number,
    totalRecords: number,
    totalPages: number
  }
}
```

### Error Response

```typescript
{
  success: false,
  error: {
    message: string,
    statusCode: number,
    code?: string
  }
}
```

### Authentication Response

```typescript
{
  success: true,
  token: string,
  refreshToken: string,
  user: {
    user_id: number,
    email: string,
    first_name: string,
    last_name: string,
    user_type: string
  }
}
```

---

## Available API Methods

### Frontend

```typescript
// GET request
apiGet<T>(url: string): Promise<ApiResponse<T> | ErrorResponse>

// POST request
apiPost<T>(url: string, data?: object): Promise<ApiResponse<T> | ErrorResponse>

// PUT request
apiPut<T>(url: string, data?: object): Promise<ApiResponse<T> | ErrorResponse>

// DELETE request
apiDelete<T>(url: string): Promise<ApiResponse<T> | ErrorResponse>
```

### Backend Helpers

```typescript
// Create success response
createSuccessResponse(data, message?)

// Create paginated response
createPaginatedResponse(data, currentPage, pageSize, totalRecords, message?)

// Create error response
createErrorResponse(message, statusCode, code?)

// Pre-defined errors
CommonErrors.UNAUTHORIZED(message?)
CommonErrors.FORBIDDEN(message?)
CommonErrors.NOT_FOUND(message?)
CommonErrors.BAD_REQUEST(message?)
CommonErrors.VALIDATION_ERROR(message?)
CommonErrors.SERVER_ERROR(message?)
CommonErrors.SESSION_EXPIRED(message?)
CommonErrors.NETWORK_ERROR(message?)
```

---

## Type Definitions

Located in [`types/index.ts`](types/index.ts):

### Core API Types
- `ApiResponse<T>` - Success response
- `ErrorResponse` - Error response
- `AuthResponse` - Authentication response
- `LoginData` - Login credentials

### Parish Management Types
- `ParishUser` - User data
- `Ward` - Ward data
- `Family` - Family data
- `Member` - Member data
- `UserType` - User role types
- `SelectItem` - Dropdown options

---

## Complete Usage Examples

### React Component

```tsx
"use client";

import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import { isSuccessResponse } from "@/utils/apiHelpers";
import { Ward } from "@/types";

export default function WardsList() {
  const [wards, setWards] = useState<Ward[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWards() {
      const response = await apiGet<Ward[]>("/api/wards");

      if (isSuccessResponse(response)) {
        setWards(response.data || []);
      } else {
        setError(response.error.message);
      }
      setLoading(false);
    }

    fetchWards();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {wards.map((ward) => (
        <div key={ward.ward_id}>{ward.ward_name}</div>
      ))}
    </div>
  );
}
```

### API Route (Backend)

```typescript
import {
  createSuccessResponse,
  createPaginatedResponse,
  CommonErrors,
} from "@/utils/apiHelpers";

// GET /api/wards
export async function GET(req: Request) {
  const wards = await getWards();
  return Response.json(
    createSuccessResponse(wards, "Wards retrieved successfully")
  );
}

// POST /api/wards
export async function POST(req: Request) {
  const data = await req.json();
  const ward = await createWard(data);

  if (!ward) {
    return Response.json(
      CommonErrors.BAD_REQUEST("Failed to create ward"),
      { status: 400 }
    );
  }

  return Response.json(
    createSuccessResponse(ward, "Ward created successfully"),
    { status: 201 }
  );
}

// GET /api/members (with pagination)
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "10");

  const { members, totalRecords } = await getMembers(page, pageSize);

  return Response.json(
    createPaginatedResponse(members, page, pageSize, totalRecords)
  );
}
```

### Server Action

```typescript
"use server";

import { apiPost } from "@/lib/api";
import { isSuccessResponse } from "@/utils/apiHelpers";
import { revalidatePath } from "next/cache";

export async function createFamily(formData: FormData) {
  const familyData = {
    family_name: formData.get("family_name"),
    ward_id: parseInt(formData.get("ward_id") as string),
  };

  const response = await apiPost<Family>("/api/families", familyData);

  if (isSuccessResponse(response)) {
    revalidatePath("/families");
    return { success: true, data: response.data };
  } else {
    return { success: false, error: response.error.message };
  }
}
```

---

## Authentication Actions

```typescript
import { login, register, logoutAction } from "@/lib/actions/auth";

// Login
const response = await login({
  email: "user@parish.com",
  password: "password123"
});

// Register
const response = await register({
  email: "user@parish.com",
  password: "password123",
  first_name: "John",
  last_name: "Doe"
});

// Logout
await logoutAction(); // Redirects to /login
```

---

## File Structure

```
lib/
├── api/
│   └── index.ts           # API methods
├── actions/
│   └── auth.ts            # Auth actions
├── axios/
│   ├── index.ts           # Axios with auth
│   └── api.ts             # Axios for /api routes
└── cookies/
    └── index.ts           # Token management

types/
└── index.ts               # Type definitions

utils/
└── apiHelpers/
    └── index.ts           # Helper functions

components/
└── Login/
    └── index.tsx          # Login component
```

---

## Features

✅ **Type-Safe API Calls** - Full TypeScript support with generics
✅ **Standardized Responses** - Consistent format across all endpoints
✅ **Error Handling** - Comprehensive error management with type guards
✅ **Authentication** - JWT token management with automatic storage
✅ **Session Management** - Automatic redirect on session expiration
✅ **Pagination Support** - Built-in pagination helpers
✅ **Pre-defined Errors** - Common error responses ready to use

---

## Best Practices

1. **Always use type guards**: `isSuccessResponse()` and `isErrorResponse()`
2. **Specify generic types**: `apiGet<Ward[]>()` for type safety
3. **Handle errors gracefully**: Always check for error responses
4. **Use appropriate HTTP methods**: GET, POST, PUT, DELETE
5. **Provide meaningful messages**: Clear success and error messages
6. **Implement pagination**: For large datasets using `createPaginatedResponse()`
7. **Validate input**: Use Zod or similar for validation

---

## Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| UNAUTHORIZED | 401 | Not authenticated |
| FORBIDDEN | 403 | No permission |
| NOT_FOUND | 404 | Resource not found |
| BAD_REQUEST | 400 | Invalid request |
| VALIDATION_ERROR | 422 | Validation failed |
| SERVER_ERROR | 500 | Internal error |
| SESSION_EXPIRED | 401 | Session expired |
| NETWORK_ERROR | 0 | Network issue |

---

**Version:** 2.0.0
**Last Updated:** 2024
