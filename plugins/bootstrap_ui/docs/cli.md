# Bootstrap UI CLI

## Commands

### `kvdf bootstrap-ui status`

Shows whether the optional Bootstrap UI asset bundle is present and available.

### `kvdf bootstrap-ui assets`

Lists the Bootstrap CSS and JavaScript asset paths together with the third-party
notice location.

### `kvdf bootstrap-ui snippet`

Returns a ready-to-embed HTML snippet that references the copied Bootstrap
assets. The command stays read-only and does not write files.

## Install / Remove

- `kvdf plugins install bootstrap_ui`
- `kvdf plugins uninstall bootstrap_ui`

## Notes

- The plugin is optional and removable.
- Bootstrap is no longer a hard Core dependency.
- The plugin does not fetch anything from the network.
- If the copied asset files are missing, the commands return a safe warning
  instead of crashing.
