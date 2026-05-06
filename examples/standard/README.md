# Standard Example

This example shows how to use Kabeeri VDF for a real product MVP or client project.

The original `examples/standard/` folder was a placeholder. This improved version gives a practical standard workflow.

## Example product

```text
Clinic Booking Portal
```

## Product idea

A small clinic needs a web app where patients can request appointments and clinic staff can review/manage requests.

## Best stack examples

This Standard example can work with:

```text
laravel/
dotnet/
django/
fastapi/
nestjs/
nextjs/
react/
vue/
angular/
supabase/
firebase/
```

## Why Standard fits

Use Standard because the first version may need:

```text
- patient-facing form
- admin/staff review
- database records
- basic authentication
- task tracking
- acceptance review
- release handoff
```

## First release scope

```text
- Public appointment request form
- Staff login
- Appointment request list
- Request status: new, contacted, confirmed, cancelled
- Basic validation
- Basic admin notes
- Release handoff
```

## Out of scope

```text
- Online payments
- Insurance integration
- SMS gateway
- Doctor schedule optimization
- Patient medical records
- Multi-branch clinic management
```

## Suggested Kabeeri VDF flow

```text
1. Choose Standard generator.
2. Answer product, user, data, and release questions.
3. Create planning documents.
4. Choose backend and frontend prompt packs.
5. Create task tracking records.
6. Use acceptance checklists for each task.
7. Prepare release handoff.
```

## Suggested folders used

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
11_RELEASE_HANDOFF
```

## Suggested first tasks

```text
T001 - Define clinic booking data model
T002 - Create appointment request API
T003 - Create public request form
T004 - Add staff login
T005 - Add staff request list
T006 - Add acceptance review and handoff
```
