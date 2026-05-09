# 03 - Environment, Configuration, and API Prompt

## Goal

Set up safe public configuration for API access and local environments.

## Information the user should provide before running this prompt

- Does the app connect to an API?
- What public API base URL should local development use?
- Are there separate local, staging, and production endpoints?
- Which values are safe to expose in a mobile app?

## Files and areas allowed for this prompt

```text
src/config/
src/services/
app.config.*
app.json
.env.example
README.md
package.json only if a config dependency is already used or clearly needed
```

## Files and areas forbidden for this prompt

```text
.env with real values
Private server secrets
Service role keys
Admin credentials
Signing credentials
Unrelated native files
```

## Tasks

1. Inspect existing configuration patterns.
2. Add or update `.env.example` with safe placeholders only.
3. Add a simple config helper for public runtime values if useful.
4. Ensure API base URL usage is centralized.
5. Explain that mobile apps cannot keep private server secrets.
6. Document local setup notes.
7. Do not add auth, data fetching, or feature screens here.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Public config is clear.
- No real secrets are committed.
- API base URL strategy is documented.
- App behavior is unchanged except safe config foundation.
