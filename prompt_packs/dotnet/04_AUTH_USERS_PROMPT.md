# 04 — Authentication, Users, and Profiles Prompt

## Goal

Create a simple authentication, users, and profile foundation for a .NET project.

## Context for the AI coding assistant

This prompt adds the user foundation. Keep it suitable for the first release.

## Information the user should provide before running this prompt

- Does the first release need login?
- Who creates users: self-signup, admin invitation, or both?
- Does it need email confirmation?
- Are users customers, admins, team members, or all of these?

## Files and areas allowed for this prompt

```text
src/
tests/
Program.cs
appsettings*.json
*.csproj
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
2. Choose a simple auth approach suitable for the app style.
3. If using ASP.NET Core Identity, keep the setup minimal and clear.
4. Add user/profile foundation only if needed.
5. Add endpoints or UI flow only according to the project style.
6. Add basic tests or manual check instructions.
7. Do not add complex role systems yet; that belongs to the next prompt.


## Checks to run

```bash
dotnet build
dotnet test
```

## Acceptance criteria

- User/auth foundation matches the project scope.
- Login/registration behavior is clear if required.
- The solution is not overbuilt.
- No unrelated modules are added.


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
