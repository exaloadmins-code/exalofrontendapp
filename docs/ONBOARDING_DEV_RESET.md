# Development — reset onboarding

**Scope:** Clears **local** AsyncStorage onboarding + profile only.  
No backend, database, or question-bank changes.

Available **only in `__DEV__`** builds / Expo development.

There is **no** visible on-screen DEV reset control in onboarding UI.

## Expo Web

1. Start the app (`npx expo start --web` or your usual port).
2. Open:

```
http://localhost:<PORT>/?resetOnboarding=1
```

Example if Metro web is on 8082:

```
http://localhost:8082/?resetOnboarding=1
```

3. App clears `@exalo/onboarding` and `@exalo/profile`, strips the query param, and lands on **Email**.

Alternate query (also accepted): `?reset=1`

## Native (iOS / Android development)

Deep link (scheme from `app.json`: `exalo`):

```
exalo:///?resetOnboarding=1
```

or open the same query on the Expo Go / dev-client URL if your tooling supports it.

## What is cleared

- `@exalo/onboarding`
- `@exalo/profile`

## What is not cleared

- Backend / API data (none used for onboarding)
- Database
- Question bank
