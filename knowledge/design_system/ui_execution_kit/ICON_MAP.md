# Icon Map

Use one icon library per surface unless a migration decision explicitly allows otherwise.

Recommended defaults:

- Bootstrap stack: Bootstrap Icons.
- Tailwind/shadcn stack: Lucide.
- Ant Design stack: Ant Design icons.
- MUI stack: Material Icons or MUI icons.

## Actions

| Action | Bootstrap Icons | Lucide name | Ant/MUI meaning |
| --- | --- | --- | --- |
| Add/Create/New | `bi-plus-lg` | `Plus` | plus/add |
| Edit/Update | `bi-pencil-square` | `Pencil` | edit |
| Delete/Remove | `bi-trash` | `Trash2` | delete |
| Search | `bi-search` | `Search` | search |
| Save | `bi-save` | `Save` | save |
| Cancel/Close | `bi-x-lg` | `X` | close |
| Confirm/Done | `bi-check-lg` | `Check` | check |
| View | `bi-eye` | `Eye` | visibility |
| Hide | `bi-eye-slash` | `EyeOff` | visibility off |
| Download | `bi-download` | `Download` | download |
| Upload | `bi-upload` | `Upload` | upload |
| Settings | `bi-gear` | `Settings` | settings |
| Filter | `bi-funnel` | `Filter` | filter |
| Refresh | `bi-arrow-clockwise` | `RefreshCw` | reload |
| Export | `bi-box-arrow-up` | `FileUp` | export |
| Import | `bi-box-arrow-in-down` | `FileDown` | import |

## States

| State | Bootstrap Icons | Lucide name |
| --- | --- | --- |
| Success | `bi-check-circle` | `CheckCircle` |
| Error | `bi-x-circle` | `XCircle` |
| Warning | `bi-exclamation-triangle` | `TriangleAlert` |
| Info | `bi-info-circle` | `Info` |
| Empty | `bi-inbox` | `Inbox` |
| Loading | spinner | `LoaderCircle` |
| Permission | `bi-shield-lock` | `ShieldLock` |
| Offline | `bi-wifi-off` | `WifiOff` |

## Placement

- Buttons: icon before label with framework spacing utility.
- Empty states: large muted icon above title.
- Alerts: icon before message.
- Table row actions: icon plus text unless table density requires icon-only.
- Icon-only buttons must include `aria-label`.
