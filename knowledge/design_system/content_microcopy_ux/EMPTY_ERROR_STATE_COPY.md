# Empty And Error State Copy

## Empty States

Every empty state should include:

- what is missing;
- why it may be missing;
- what the user can do next;
- one primary action when useful.

Patterns:

- No records yet: explain creation path.
- No results: preserve filters and offer reset.
- No permission: explain access path without exposing sensitive data.
- No connection: explain retry/offline behavior.
- No AI output: explain how to generate or adjust prompt.

## Error States

Every error should include:

- plain-language cause when known;
- recovery action;
- whether user work was saved;
- support or retry path when needed.

Avoid:

- raw stack traces;
- vague "Something went wrong";
- blaming language;
- hiding failed background actions.

## Examples

- Empty list: `No invoices yet. Create your first invoice to start tracking payments.`
- No results: `No orders match these filters. Clear filters or adjust your search.`
- Payment error: `Payment was not completed. Check the card details or choose another method.`
- Permission: `You do not have access to this report. Ask an admin for reporting permission.`

