# 06 — Roles and Security Prompt

## Goal

Add simple roles, authorization rules, and Spring Security checks.

## Context for the AI coding assistant

This prompt protects important actions without overbuilding enterprise access control.

## Information the user should provide before running this prompt

- What types of users will use the system?
- What should only admins do?
- What should normal users not access?
- Technical note: If unsure, ask ChatGPT to help define a simple role list for your product.

## Files and areas allowed for this prompt

```text
src/main/java/**/security/
src/main/java/**/config/
src/main/java/**/user/
src/test/java/
```

## Files and areas forbidden for this prompt

```text
Advanced enterprise permissions
Unrelated features
Billing
Marketplace
```

## Tasks

1. Ask what user types exist.
2. Create simple roles such as OWNER, ADMIN, MANAGER, MEMBER, VIEWER if suitable.
3. Add security rules for protected endpoints.
4. Add method-level authorization only if useful.
5. Protect admin or management actions.
6. Add tests or clear manual checks.
7. Do not create a complex permission matrix unless the project requires it.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- Roles are simple and understandable.
- Restricted endpoints/actions are protected.
- Unauthorized users cannot access protected actions.
- Role design matches first release scope.


## Important scope rule

Do not build features outside this prompt.  
Do not create advanced modules unless they are explicitly listed above.



## Final response required from AI

After completing the task, respond with:

```text
Summary:
Files changed:
Commands run:
Tests/checks result:
Manual review notes:
Next recommended prompt:
```
