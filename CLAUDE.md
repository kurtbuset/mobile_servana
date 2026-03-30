# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Servana Mobile is a React Native 0.81 / Expo 54 customer service agent app. It connects to the Servana backend (Node.js/Express/Socket.IO) for real-time chat, OTP-based authentication, and profile management. This repo is a Git submodule of the parent Servana monorepo.

## Commands

```bash
npm install                    # install dependencies
npx expo start                 # dev server (QR code for device)
npx expo start --android       # launch on Android emulator
npx expo start --ios           # launch on iOS simulator
npm test                       # run Jest tests (jest-expo preset)
```

No build/lint scripts are configured beyond Expo defaults.

## Architecture

### Provider Hierarchy (App.jsx)

```
ErrorBoundary → Redux Provider → AuthProvider → SocketProvider → AppNavigation
```

Auth and Socket use React Context (`contexts/`). All other state uses Redux Toolkit (`store/`).

### State Split

- **AuthContext** (`contexts/AuthContext/`) — authentication status, token validation, login/logout. Tokens stored in Expo SecureStore (hardware-backed). Supports offline access with cached profile.
- **SocketContext** (`contexts/SocketContext/`) — Socket.IO client lifecycle, connection state. Manual connect/disconnect tied to auth state. Config: WebSocket + polling fallback, max 5 reconnection attempts, 20s timeout.
- **Redux store** (`store/`) — three slices:
  - `profile` — user data, `requiresProfileSetup` flag
  - `messages` — conversations list, current chat messages (with date separators), pagination state (`hasMore`, cursor-based)
  - `ui` — modals, toasts, global loading, network status
- Custom middleware in `store/middleware/`: error middleware (rejected thunks → toast), logging middleware (dev only).

### Navigation (React Navigation 7)

Defined in `navigation/appNavigation.js` and `navigation/BottomTabs.js`. Route name constants and animation presets live in `config/navigation.js`.

- **Unauthenticated**: LOGIN screen (OTP-based, no password)
- **Authenticated**: BottomTabs (DASHBOARD, MESSAGES, PROFILE) + stack screens (PROFILE_SETUP, WELCOME_SUCCESS, MY_PROFILE, EDIT_PROFILE, POST_CHAT, CHAT_HISTORY)

BottomTabs uses `@react-navigation/material-top-tabs` positioned at bottom, not `@react-navigation/bottom-tabs`.

### API Layer

- `shared/api/client.js` — Axios instance with request interceptor (auto-injects Bearer token from SecureStore) and response interceptor (unwraps `{data}` envelope, handles 401 by clearing tokens).
- `shared/api/endpoints.js` — all route path constants.
- `shared/api/*.api.js` — domain modules: `auth.api.js`, `profile.api.js`, `message.api.js`.
- Base URL configured in `config/environment.js` — platform-specific (localhost for web, LAN IP for Android dev, production domain).

### Real-Time Messaging

Socket event emitters and listeners are in `contexts/SocketContext/emitters.js`. Key events:
- Outbound: `sendMessage`, `joinChatGroup`, `typing`, `stopTyping`
- Inbound: `receiveMessage`, `messageDelivered`, `messageError`, `chatTransferred`, `chat:resolved`, `typing`/`stopTyping`

Feature hooks in `features/messaging/hooks/` encapsulate socket interaction:
- `useMessageSocket` — event registration, optimistic updates, typing indicators
- `useMessageHistory` — cursor-based pagination, auto-scroll
- `useChatGroup` — chat session initialization and creation
- `useSendMessage` — send via API or socket with optimistic UI
- `useEndChat` — end chat with feedback

### Feature Organization

Screens live in `screens/{feature}/`, feature-specific components and hooks in `features/{feature}/`. Shared UI in `components/ui/` and `components/layout/`.

## Key Patterns

- **OTP Auth**: Phone number + OTP code flow (no passwords). Auto OTP detection via clipboard polling on Android, native `textContentType="oneTimeCode"` on iOS. See `hooks/useOTPAutoFill.js`.
- **Optimistic UI**: Sent messages appear immediately before server confirmation. See `useMessageSocket` and `useSendMessage`.
- **Date separators**: Messages array includes injected separator objects. See `features/messaging/utils/messageHelpers.js` (`addDateSeparators`).
- **Secure storage**: All token/profile persistence through `utils/secureStorage.js` (wraps `expo-secure-store`).
- **Token validation**: `utils/tokenValidation.js` decodes JWT and checks `exp` claim client-side before making network validation calls.

## Testing

Tests are in `__tests__/` using `jest-expo`. Existing coverage:
- `tokenValidation.test.js` — JWT expiration checks
- `secureStorage.test.js` — secure store operations
- `messageHelpers.test.js` — date separator insertion

## Theme

Purple-based color scheme. Primary: `#6237A0`. Gradient backgrounds using `expo-linear-gradient`. Icon library: `lucide-react-native`.
