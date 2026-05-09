# 12 - EAS Release Handoff Prompt

## Goal

Prepare a release handoff summary for an Expo app without publishing automatically.

## Information the user should provide before running this prompt

- Is the handoff for internal QA, client demo, TestFlight, Play internal testing, or production?
- Which version/build number is being prepared?
- What features changed since the last handoff?
- Which checks and device tests were completed?

## Files and areas allowed for this prompt

```text
README.md
docs/
app.json
app.config.*
eas.json
package.json
CHANGELOG.md
```

## Files and areas forbidden for this prompt

```text
Publishing to stores
Uploading builds
Signing credentials
Private store credentials
Unapproved native changes
Unrelated features
```

## Tasks

1. Inspect version, app config, EAS config, and release notes.
2. Prepare a handoff summary with changes, risks, checks, and device notes.
3. Identify missing store metadata, screenshots, permissions disclosures, or privacy notes.
4. Confirm no private credentials are committed.
5. Do not run publish, submit, or production release commands.
6. Document the exact release commands the Owner may run later if appropriate.
7. Link remaining tasks or blockers.

## Checks to run

```bash
npm run lint
npm test
npx expo-doctor
```

Run only checks that exist.

## Acceptance criteria

- Release readiness is clear.
- Build/publish actions are not performed automatically.
- Owner can see remaining blockers.
- No credentials or private release data are exposed.
