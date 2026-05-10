# Framework Composition Rules

## Bootstrap

Use Bootstrap grid, cards, tables, modals, navs, dropdowns, alerts, badges, and
forms before custom layout. Keep repeated patterns in partials/components.

## Tailwind

Use semantic token utilities and reusable component wrappers for repeated
patterns. Avoid long one-off utility strings across many screens.

## MUI

Use theme-aware layout primitives, data display, dialogs, form controls, and
navigation components. Configure density centrally.

## Ant Design

Use Layout, Menu, Table, Form, Modal, Drawer, Tabs, Steps, DatePicker, Select,
Tag, Alert, and Notification for enterprise screens.

## daisyUI

Use component classes for cards, buttons, alerts, badges, menus, modals, tabs,
tables, and steps. Keep the daisyUI theme mapped to Kabeeri tokens.

## shadcn/ui

Use local owned components and Radix behavior. Document copied components,
variants, states, accessibility, and token overrides.

