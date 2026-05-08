# HireIQ Frontend — Specific Rules

## State Management — Hard Split
| What | Tool |
|---|---|
| Auth user, role, token presence | Zustand (useAuthStore) |
| Search filters, UI toggles | Zustand (useFilterStore) |
| Jobs list, job detail, applications | React Query |
| Form state | Local useState |

Never put server data in Zustand. Never put auth user in React Query.

## Axios Instance
```js
// api/axios.js
import axios from 'axios';
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL, withCredentials: true });
```
`withCredentials: true` is required on every request — httpOnly cookies won't send without it.

## Protected Routes Pattern
```jsx
// Routes check useAuthStore for user presence + role
// Redirect to /login if unauthenticated
// Redirect to /unauthorized if wrong role
```

## Groq Streaming on Frontend
Use ReadableStream / EventSource to consume SSE.  
Update a local `useState` string as chunks arrive — don't store stream state in Zustand.

## Tailwind — No Custom CSS Files
All styling via Tailwind utility classes. No separate .css files except index.css for base reset.