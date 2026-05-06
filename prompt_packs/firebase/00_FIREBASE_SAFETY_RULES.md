# 00 — Firebase Safety Rules

Use these rules with every Firebase prompt in this pack.

## Main safety rule

Never expose Firebase Admin SDK private keys in frontend or mobile apps.

Admin credentials must only be used in trusted server-side environments.

## Security rules rule

Firestore, Realtime Database, and Storage security rules must be reviewed before real users or private data are added.

Do not use permanently open rules such as allowing all reads and writes for private data.

## Allowed work areas

Depending on the project, AI may work in:

```text
firebase.json
.firebaserc
firestore.rules
storage.rules
firestore.indexes.json
functions/
src/lib/firebase*
app/
components/
lib/
server/
README.md
.env.example
```

## Forbidden by default

Do not commit:

```text
Firebase Admin private keys
service account JSON files
real API secrets
production credentials
private user data
```

## Important clarification about Firebase Web API keys

Firebase Web API keys are often used in client apps, but they are not a replacement for proper security rules.

Do not treat public client config as a secret protection mechanism.

## AI coding assistant instruction

Always include this instruction when sending a Firebase prompt:

```text
You are working on a Firebase-backed project.
Never expose Firebase Admin SDK private keys in frontend or mobile code.
Do not create open security rules for private data.
Do not commit real secrets or service account JSON files.
Follow the prompt scope exactly.
Explain what you changed.
List files changed.
List checks to run.
Stop after completing this task.
```

## Beginner note

If you do not understand a Firebase term such as Auth, Firestore, security rules, Cloud Functions, Admin SDK, service account, or emulator, ask an AI assistant such as ChatGPT to explain it before running the coding prompt.
