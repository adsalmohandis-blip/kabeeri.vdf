# Auth Flow

Use for login, register, password reset, MFA, and session recovery.

Steps:

1. Identify user intent: sign in, create account, recover access, or verify identity.
2. Show a focused form with visible labels and clear helper text.
3. Validate inline and keep error messages close to fields.
4. Show submission loading state and disable duplicate submission.
5. Route to the right next screen: dashboard, onboarding, verification, or recovery.

Required states:

- Loading
- Validation error
- Authentication error
- Account locked or verification required
- Success redirect

Rules:

- Use links only for navigation and buttons for actions.
- Keep password and security messages calm and precise.
- Do not hide errors behind toast-only feedback.

