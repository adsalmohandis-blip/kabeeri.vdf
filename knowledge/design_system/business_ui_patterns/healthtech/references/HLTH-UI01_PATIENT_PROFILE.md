# HLTH-UI01 Patient Profile

## Identity

- Design code: `HLTH-UI01`
- Business: healthtech
- View: patient profile
- Style: calm clinical summary

## Layout Anatomy

```text
patient summary
critical alerts
appointments
records
medications
notes
```

## UX Goals

- Present important patient context clearly.
- Make critical alerts visible without panic.
- Support clinical and patient understanding.

## Required Components

- `PatientSummary`
- `CriticalAlert`
- `AppointmentList`
- `RecordSummary`
- `MedicationList`
- `ClinicalNotes`

## Required States

- complete profile;
- missing data;
- critical alert;
- permission restricted;
- loading.

## Data Requirements

- patient identity;
- allergies/alerts;
- appointments;
- diagnoses/records;
- medications.

## Accessibility

- Readable font sizes.
- Critical alerts are text plus icon.
- Avoid low-contrast muted medical data.

## Motion

- `MINIMAL_MOTION`
- Avoid motion near critical information.
- Loading uses calm skeletons.

## Common Mistakes

- Small text for critical data.
- Alarmist visual language.
- Hiding allergies or warnings.

## Acceptance Criteria

- Patient context and critical alerts are immediately visible.

## Task Seed

- Build patient profile with summary, alerts, appointments, records, medications, and permission states.

