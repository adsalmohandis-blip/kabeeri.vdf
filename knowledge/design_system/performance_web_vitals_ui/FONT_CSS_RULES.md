# Font And CSS Performance Rules

## Fonts

- Prefer system fonts for operational tools unless brand requirements justify custom fonts.
- Limit custom font families, weights, and styles.
- Use font-display behavior that avoids invisible text.
- Arabic and Latin font stacks should be planned together for bilingual UI.
- Avoid late font swaps that shift layout.

## CSS

- Prefer framework utilities and component contracts over large page-specific CSS.
- Avoid unused CSS from multiple UI frameworks.
- Critical first-viewport styles should be available early.
- Do not animate width, height, top, left, margin, or other layout-heavy properties when transform or opacity can serve the same UX purpose.
- Define stable dimensions for cards, grids, buttons, counters, boards, charts, and skeletons.

## Theming

- Use tokens and CSS variables for theme changes.
- Theme switching should not reflow the whole page unexpectedly.
- Dark mode and RTL mode should not require duplicate component CSS unless the stack requires it.

