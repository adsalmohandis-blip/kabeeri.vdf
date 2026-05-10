# Stack Compatibility Rules

## CSS Frameworks

Bootstrap, Bulma, Foundation, Tailwind CSS, and daisyUI can work in many frontend stacks, but they still need a documented import/build path.

- Bootstrap needs CSS import and `bootstrap.bundle` only when JavaScript plugins are used.
- Bulma is CSS-only; custom behavior must come from project components.
- Foundation needs CSS/Sass setup and explicit JavaScript plugin initialization when plugins are used.
- Tailwind CSS needs a documented build adapter and content scanning/build inputs.
- daisyUI requires Tailwind CSS and a documented theme policy.

## React Component Systems

MUI, Ant Design, and shadcn/ui require a React-compatible frontend.

- MUI needs theme/provider setup and Emotion/styling considerations.
- Ant Design needs ConfigProvider, locale, direction, and dense data-table rules.
- shadcn/ui requires Tailwind CSS and copied component ownership.

## Mixing Rules

- Do not combine Bootstrap with MUI, Ant Design, Foundation, or Bulma on the same screen without a migration decision.
- Tailwind can support shadcn/ui or daisyUI, but avoid mixing daisyUI and shadcn/ui components on one screen unless a style ownership rule exists.
- Icon libraries should be single-source per surface.

