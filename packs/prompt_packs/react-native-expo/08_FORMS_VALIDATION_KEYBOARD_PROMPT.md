# 08 - Forms, Validation, and Keyboard Prompt

## Goal

Build or improve mobile forms with validation, keyboard behavior, and helpful error messages.

## Information the user should provide before running this prompt

- Which form is being built or improved?
- What fields are required?
- What validation rules apply?
- What happens after submit?

## Files and areas allowed for this prompt

```text
app/
src/forms/
src/screens/
src/components/
src/services/
src/validation/
src/theme/
```

## Files and areas forbidden for this prompt

```text
Unrelated forms
Backend validation changes unless explicitly requested
Payment or sensitive workflows unless explicitly approved
Native platform configuration
```

## Tasks

1. Implement only the requested form behavior.
2. Add client-side validation that complements server validation.
3. Handle keyboard overlap and submit flow.
4. Use clear field errors and accessible labels.
5. Add loading and failure states for submit actions.
6. Do not store sensitive values unnecessarily.
7. Add a focused test if possible.

## Checks to run

```bash
npm run lint
npm test
```

Run only checks that exist.

## Acceptance criteria

- Form validation is clear.
- Keyboard behavior is reasonable on mobile.
- Submit states are handled.
- No unrelated workflow was added.
