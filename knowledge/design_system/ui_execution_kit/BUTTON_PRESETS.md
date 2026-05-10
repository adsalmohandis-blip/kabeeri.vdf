# Button Presets

Use semantic action patterns instead of inventing variants.

## Bootstrap Examples

Create:

```html
<button class="btn btn-primary">
  <i class="bi bi-plus-lg me-2"></i>
  Create
</button>
```

Edit:

```html
<button class="btn btn-outline-primary">
  <i class="bi bi-pencil-square me-2"></i>
  Edit
</button>
```

Delete:

```html
<button class="btn btn-danger">
  <i class="bi bi-trash me-2"></i>
  Delete
</button>
```

Search:

```html
<button class="btn btn-outline-secondary">
  <i class="bi bi-search me-2"></i>
  Search
</button>
```

Save:

```html
<button class="btn btn-success">
  <i class="bi bi-save me-2"></i>
  Save
</button>
```

Cancel:

```html
<button class="btn btn-outline-secondary">
  <i class="bi bi-x-lg me-2"></i>
  Cancel
</button>
```

## Rules

- Primary page action: primary/contained.
- Secondary action: outline/secondary.
- Destructive action: danger/destructive.
- In-table actions: compact variant.
- Submit buttons show disabled/loading state while submitting.
- Icon-only actions require accessible label and tooltip.
