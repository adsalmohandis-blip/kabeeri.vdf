# 05 — Authentication and Users Prompt

## Goal

Add authentication and users foundation if the first release needs login.

## Context for the AI coding assistant

This prompt adds the user foundation. Keep it suitable for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who logs in: customers, admins, team members, or external clients?
- Is auth handled by Spring Boot or an external provider?
- Preferred auth approach, if any?
- Technical note: If unsure, ask ChatGPT to compare simple Spring Security options.

## Files and areas allowed for this prompt

```text
src/main/java/**/security/
src/main/java/**/user/
src/main/java/**/auth/
src/main/java/**/config/
src/test/java/
pom.xml
build.gradle
```

## Files and areas forbidden for this prompt

```text
Advanced billing
Marketplace
Future extension features
Unrelated modules
```

## Tasks

1. Ask whether the project needs login in the first release.
2. Choose an auth approach suitable for the project: Spring Security sessions, JWT, OAuth2/OIDC, API key, external provider, or none.
3. Do not choose a paid/external provider without user approval.
4. Add user entity/DTO only if needed.
5. Add password hashing/token helpers if local auth is selected.
6. Add login/me endpoints only if needed.
7. Add tests or manual check instructions.
8. Do not add complex roles yet; that belongs to the security roles prompt.


## Checks to run

```bash
./mvnw test
./gradlew test
```

## Acceptance criteria

- Auth approach is clear.
- User foundation matches first release scope.
- No real secrets are committed.
- The solution is not overbuilt.


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
