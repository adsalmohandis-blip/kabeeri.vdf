# Minimal Tauri Scaffold Comparison

## Purpose

Compare KVDOS against a throwaway minimal Tauri v1 scaffold on the same Windows machine and toolchain to determine whether the invalid app-level Windows executable problem is specific to KVDOS scaffold/config or is broader than KVDOS.

## Toolchain

- Node: `v20.20.2`
- npm: `10.8.2`
- rustc: `1.95.0 (59807616e 2026-04-14)`
- cargo: `1.95.0 (f2d3ce0bd 2026-03-21)`
- Tauri CLI: `1.6.3`

## Minimal Scaffold Creation

Temporary scaffold location:

- `tmp-tauri-minimal/`

Creation method:

- Hand-created throwaway Tauri v1 scaffold inside the repo workspace.
- Used a minimal `package.json` with `@tauri-apps/cli@^1.6.3`.
- Added `src-tauri/Cargo.toml`, `src-tauri/build.rs`, `src-tauri/src/main.rs`, and `src-tauri/tauri.conf.json`.
- Reused the already-fixed KVDOS icon assets only for the temporary comparison build.
- The temp scaffold was never intended for commit.

Build notes:

- The first scaffold pass was blocked by config discovery because the temp folder was hidden.
- The second pass exposed a BOM issue in `tauri.conf.json`.
- After rewriting the config without a BOM, the minimal scaffold built successfully.

## Minimal Build Result

Commands:

- `npm run tauri:build`
- `cargo build --release -vv`

Result:

- Both builds completed successfully.
- The minimal app-level executable was produced.

Minimal app-level executable:

- Path: `tmp-tauri-minimal/src-tauri/target/release/Minimal Tauri Scaffold.exe`
- Size: `3784704`
- SHA256: `9B445BA3D9A7675F39773CC38E69738E76E2828A6EA0E2F2E3F2B35B773AB7AF`
- First bytes: `197 201`
- `MZ`: `false`
- Launch attempt: failed with `The specified executable is not a valid application for this OS platform.`

## KVDOS Build Result

Commands:

- `npm run desktop:snapshot`
- `npm run desktop:build`
- `npm run desktop:tauri:build`

Result:

- KVDOS built successfully.
- The KVDOS app-level executable was produced.

KVDOS app-level executable:

- Path: `apps/desktop/src-tauri/target/release/KVDOS Desktop.exe`
- Size: `3830272`
- SHA256: `24138C4B41F14ED2A890AFEFA83DD1EC18ED087FDE0CB5B2E137E021EC915B3D`
- First bytes: `197 201`
- `MZ`: `false`
- Launch attempt: failed with `The specified executable is not a valid application for this OS platform.`

## PE Signature Comparison

| Build | Path | Size | SHA256 | First bytes | `MZ` |
| --- | --- | ---: | --- | --- | --- |
| Minimal scaffold | `tmp-tauri-minimal/src-tauri/target/release/Minimal Tauri Scaffold.exe` | `3784704` | `9B445BA3D9A7675F39773CC38E69738E76E2828A6EA0E2F2E3F2B35B773AB7AF` | `C5 C9` | `false` |
| KVDOS | `apps/desktop/src-tauri/target/release/KVDOS Desktop.exe` | `3830272` | `24138C4B41F14ED2A890AFEFA83DD1EC18ED087FDE0CB5B2E137E021EC915B3D` | `C5 C9` | `false` |

## Config Comparison

Shared shape:

- `src-tauri/Cargo.toml`
  - `tauri-build = { version = "1" }`
  - `tauri = { version = "1", features = ["custom-protocol"] }`
  - `[features] custom-protocol = ["tauri/custom-protocol"]`
- `src-tauri/build.rs`
  - `tauri_build::build();`
- `src-tauri/src/main.rs`
  - minimal `tauri::Builder::default()...run(...)`
- `src-tauri/tauri.conf.json`
  - `build.distDir = "../dist"`
  - `tauri.bundle.active = false`

Differences:

- KVDOS uses a fuller desktop preview config:
  - `beforeDevCommand: "npm run dev"`
  - `beforeBuildCommand: "npm run build"`
  - `devPath: "http://localhost:5173"`
  - preview title/window settings
  - `productName: "KVDOS Desktop"`
  - `identifier: "com.kvdos.desktop"`
- The minimal scaffold uses a stripped-down config:
  - empty before-build hooks
  - placeholder product/bundle naming
  - a simple local preview title

Conclusion from the comparison:

- The invalid app-level Windows executable is **not** unique to the KVDOS scaffold.
- A minimal Tauri v1 scaffold on the same machine produces the same non-PE app-level output.

## Likely Root Cause

The evidence points away from KVDOS-specific scaffold/config and toward a broader local Tauri/Rust packaging pipeline or environment issue that affects the final app-level Windows executable output.

The build-script helper executables are valid PE files, which means the machine can emit valid Windows executables in general. The app-level output is the part that remains non-PE.

## Recommended Next Fix

Before changing KVDOS app behavior again:

1. Investigate the local Tauri packaging/link stage on this Windows machine.
2. Compare against a second known-good Windows environment if possible.
3. Keep the KVDOS scaffold unchanged unless a specific packaging difference is identified.

## Validation Commands Run

- `npm run tauri:build`
- `cargo build --release -vv`
- `npm run desktop:snapshot`
- `npm run desktop:build`
- `npm run desktop:tauri:build`

## Note

The temporary scaffold under `tmp-tauri-minimal/` is throwaway comparison material and must not be committed.
