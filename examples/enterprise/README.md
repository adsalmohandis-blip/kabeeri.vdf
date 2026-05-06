# Enterprise Example

This example shows how to use Kabeeri VDF for a larger, multi-role system.

The original `examples/enterprise/` folder was a placeholder. This improved version gives a practical enterprise-level workflow.

## Example product

```text
Multi-Branch Service Operations Platform
```

## Product idea

A company with multiple branches needs a platform to manage service requests, branch teams, managers, operational statuses, and audit-friendly task workflows.

## Best stack examples

This Enterprise example can work with:

```text
dotnet/
springboot/
laravel/
django/
nestjs/
angular/
react/
nextjs/
postgresql-based systems
```

## Why Enterprise fits

Use Enterprise because the product may need:

```text
- multiple roles
- branches or departments
- permissions
- audit notes
- complex workflows
- integrations
- release governance
- stricter acceptance review
```

## First release scope

```text
- Organization/branch structure
- User roles
- Service request workflow
- Admin and manager dashboards
- Assignment and status updates
- Audit/review notes
- Release handoff
```

## Out of scope

```text
- Full ERP
- Advanced BI
- Payroll
- Accounting
- Complex inventory
- External government integrations
- AI automation without approval
```

## Suggested Kabeeri VDF flow

```text
1. Choose Enterprise generator.
2. Complete business, architecture, database, roles, security, and release questionnaires.
3. Create detailed planning documents.
4. Choose backend/frontend prompt packs.
5. Create task tracking records with dependencies.
6. Review each task with acceptance checklists.
7. Add release acceptance checklist before publishing.
```

## Suggested folders used

```text
01_STRATEGY_AND_BUSINESS
02_FOUNDATION_ARCHITECTURE
03_RELEASE_SPECS
04_DATABASE_ARCHITECTURE
05_EXECUTION_PLAN
06_ENGINEERING_STANDARDS
07_SECURITY_AND_ACCESS
08_AI_CODE_PROMPTS
09_TASK_TRACKING
10_ACCEPTANCE_CHECKLISTS
11_RELEASE_HANDOFF
12_EXTENSION_LAYER
```

## Suggested first tasks

```text
ENT-T001 - Define roles and access model
ENT-T002 - Define branch data model
ENT-T003 - Create service request workflow
ENT-T004 - Create admin dashboard foundation
ENT-T005 - Add audit/review notes
ENT-T006 - Add release acceptance review
```
