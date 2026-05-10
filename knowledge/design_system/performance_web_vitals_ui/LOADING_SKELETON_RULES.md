# Loading And Skeleton Performance Rules

## Loading States

- Use skeletons for known layout regions.
- Use spinners only for small unknown operations.
- Preserve final layout dimensions during loading.
- Show region-level loading instead of blocking the whole page when possible.
- Avoid shimmer animations that are too intense or expensive.
- Loading state must not hide navigation or critical recovery actions.

## Empty And Error States

- Empty and error states should use the same container dimensions as the loaded state when possible.
- Error states should support retry and explain what failed.
- No-results state should preserve filters and provide clear reset.
- Permission-denied states should not reveal unauthorized data.

## Perceived Performance

- Show immediate feedback for submissions and destructive actions.
- For long actions, show progress, queued state, or background processing state.
- Keep the first usable screen small and clear.

