# FIN-UI05 Security Settings

## Identity

- Design code: `FIN-UI05`
- Business: fintech
- View: security settings
- Style: high-trust account protection

## Layout Anatomy

```text
security score/status
MFA
devices/sessions
alerts
danger zone
audit history
```

## UX Goals

- Make protection status understandable.
- Encourage safe security setup.
- Support recovery and audit visibility.

## Required Components

- `SecurityStatus`
- `MfaSetup`
- `DeviceSessions`
- `AlertPreferences`
- `DangerZone`
- `AuditHistory`

## Required States

- MFA off/on;
- suspicious session;
- device revoked;
- recovery pending;
- permission denied.

## Data Requirements

- MFA status;
- sessions;
- devices;
- alerts;
- audit events.

## Accessibility

- Security status is text plus icon.
- Risk warnings are clear.
- Focus stays predictable after modal actions.

## Motion

- `MINIMAL_MOTION`
- Security updates can toast.
- Avoid alarm-like flashing.

## Common Mistakes

- Scary vague warnings.
- Security controls with unclear consequences.
- No audit trail.

## Acceptance Criteria

- User can understand and improve account security safely.

## Task Seed

- Build security settings with MFA, devices, alerts, danger zone, and audit states.

