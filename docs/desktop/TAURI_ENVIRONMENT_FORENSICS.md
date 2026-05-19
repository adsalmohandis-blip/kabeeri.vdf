# KVDOS Tauri Environment Forensics

## Summary

This investigation originally compared the KVDOS desktop build in the original
workspace path with a no-spaces worktree, and also compared KVDOS against a
minimal Tauri v1 scaffold. That earlier pass found app-level Windows
executables that were not valid PE images (`MZ` was false).

The repaired local Windows environment now shows the opposite result:

- `KVDOS Desktop.exe` is `MZ=True`
- the executable launches successfully
- the preview window opens with the expected read-only UI

That closes the loop: the earlier failure was a local shell/toolchain issue, not
a KVDOS configuration defect.

## Environment Summary

- OS build: `Microsoft Windows [Version 10.0.26200.8457]`
- Architecture: `AMD64`
- 64-bit OS: `True`
- 64-bit process: `True`
- Node: `v20.20.2`
- npm: `10.8.2`
- rustc: `1.95.0 (59807616e 2026-04-14)`
- cargo: `1.95.0 (f2d3ce0bd 2026-03-21)`
- rustup active toolchain: `stable-x86_64-pc-windows-msvc`
- installed target: `x86_64-pc-windows-msvc`

## Toolchain Path Summary

Current process PATH does not include the Rust toolchain bin directory.

- `C:\Users\arshw\.cargo\bin` contains `rustc.exe`, `cargo.exe`, and `rustup.exe`
- Current shell PATH did not include `C:\Users\arshw\.cargo\bin`
- `where rustc` and `where cargo` only succeed after prepending `C:\Users\arshw\.cargo\bin`
- `where link`, `where cl`, `where rc`, `where mt`, and `where tauri` did not resolve from the current shell PATH

Important repair note:

- the successful local rebuild requires a Visual Studio Developer Shell / MSVC
  environment
- `rustc`, `cargo`, `cl`, `link`, `rc`, and `mt` must all be available on the
  build PATH

## Visual Studio / Windows SDK Availability

On the current shell PATH:

- `cl`: not found
- `link`: not found
- `rc`: not found
- `mt`: not found
- `tauri`: not found globally

Notes:

- The Rust release builds still succeeded after prepending `C:\Users\arshw\\.cargo\\bin` for the session.
- `cargo build` output showed the Windows resource compiler being used in the successful builds.

## No-Spaces Path Test

No-spaces KVDOS worktree:

- `C:\dev\kvdos-tauri-test`

Result:

- `npm run desktop:snapshot`: passed
- `npm run desktop:build`: passed
- `npm run desktop:tauri:build`: passed after installing the local Tauri CLI in that worktree
- The KVDOS app-level exe was still non-PE and would not launch

KVDOS no-spaces executable:

- Path: `C:\dev\kvdos-tauri-test\apps\desktop\src-tauri\target\release\KVDOS Desktop.exe`
- Size: `3830784`
- SHA256: `036F322FE6153BF0906417B174C8849FBA4CD6FCADB4657297B0F8A33C174D1C`
- First bytes: `197 201`
- `MZ`: `false`
- Launch result: failed with `The specified executable is not a valid application for this OS platform.`

Conclusion:

- Removing spaces from the workspace path did **not** fix the invalid app-level executable.

## Minimal Scaffold No-Spaces Test

Minimal scaffold path:

- `C:\dev\tauri-minimal-test`

Build steps:

- Installed `@tauri-apps/cli@^1.6.3` locally in the temp scaffold
- Added the required placeholder `src-tauri/icons/icon.ico` and `icon.png`
- Ran `npm run tauri:build`

Result:

- The minimal scaffold built successfully
- The app-level exe was still non-PE and would not launch

Minimal scaffold executable:

- Path: `C:\dev\tauri-minimal-test\src-tauri\target\release\Minimal Tauri Scaffold.exe`
- Size: `3785216`
- SHA256: `C938A01C1CFA3E2146B7561992CB3B1E0F9300DF79C839048FB5D7D52C766047`
- First bytes: `197 201`
- `MZ`: `false`
- Launch result: failed with `The specified executable is not a valid application for this OS platform.`

Conclusion:

- The problem is not unique to KVDOS.
- The problem is not fixed by moving to a no-spaces path.
- The minimal scaffold reproduces the same non-PE app-level executable behavior.

## Original KVDOS Path Test

Original KVDOS workspace path:

- `D:\My Project Ideas\kabeeri.vdf\kvdf-to-kvdos\workspaces\apps\kvdos`

Result:

- `npm run desktop:snapshot`: passed
- `npm run desktop:build`: passed
- `npm run desktop:tauri:build`: passed
- The KVDOS app-level exe was non-PE and would not launch

KVDOS executable:

- Path: `D:\My Project Ideas\kabeeri.vdf\kvdf-to-kvdos\workspaces\apps\kvdos\apps\desktop\src-tauri\target\release\KVDOS Desktop.exe`
- Size: `3830272`
- SHA256: `24138C4B41F14ED2A890AFEFA83DD1EC18ED087FDE0CB5B2E137E021EC915B3D`
- First bytes: `197 201`
- `MZ`: `false`
- Launch result: failed with `The specified executable is not a valid application for this OS platform.`

## Minimal Scaffold Comparison Table

| Build | Path | Size | SHA256 | First bytes | `MZ` | Launch |
| --- | --- | ---: | --- | --- | --- | --- |
| KVDOS original path | `D:\My Project Ideas\kabeeri.vdf\kvdf-to-kvdos\workspaces\apps\kvdos\apps\desktop\src-tauri\target\release\KVDOS Desktop.exe` | `3830272` | `24138C4B41F14ED2A890AFEFA83DD1EC18ED087FDE0CB5B2E137E021EC915B3D` | `C5 C9` | `false` | invalid application |
| KVDOS no-spaces path | `C:\dev\kvdos-tauri-test\apps\desktop\src-tauri\target\release\KVDOS Desktop.exe` | `3830784` | `036F322FE6153BF0906417B174C8849FBA4CD6FCADB4657297B0F8A33C174D1C` | `C5 C9` | `false` | invalid application |
| Minimal scaffold no-spaces | `C:\dev\tauri-minimal-test\src-tauri\target\release\Minimal Tauri Scaffold.exe` | `3785216` | `C938A01C1CFA3E2146B7561992CB3B1E0F9300DF79C839048FB5D7D52C766047` | `C5 C9` | `false` | invalid application |

## Security / Interference Notes

- No antivirus or Defender settings were changed.
- No security tools were disabled.
- No evidence of quarantine or file replacement was observed during the run.
- The files were readable with normal Windows file APIs because their hashes and raw bytes could be read immediately after build.
- `Get-AuthenticodeSignature` was not used as a determining factor in the diagnosis.

## Probable Cause

The most likely cause is a broader local Tauri/Rust packaging pipeline issue on this Windows environment rather than a KVDOS-specific scaffold bug.

Supporting evidence:

- KVDOS and a minimal Tauri scaffold both produce non-PE app-level executables.
- The issue survives a clean rebuild.
- The issue survives moving to a path without spaces.
- Build-script helper executables do start with `MZ`, which suggests the machine can emit valid Windows binaries in at least part of the toolchain.

## Recommendation

Recommended next step:

- Start from a Visual Studio Developer Shell / MSVC environment.

Secondary recommendations:

- Verify `rustc`, `cargo`, `cl`, `link`, `rc`, and `mt` on PATH before running
  Tauri packaging commands.
- Do not continue changing KVDOS app behavior unless the toolchain is confirmed
  healthy.
- If a second machine reproduces the same problem, consider trying a Tauri v2
  comparison.

Update after CI verification:

- GitHub Actions `windows-latest` produced a valid PE executable with `MZ`
  set to `True`.
- That confirms the KVDOS Tauri config is valid in a clean Windows
  environment.
- Before changing KVDOS Tauri config again, verify whether the issue
  reproduces on CI or on a second clean Windows environment.

## Validation Commands Run

- `npm test`
- `npm run validate`
- `npm run status`
- `npm run queue:status`
- `npm run qa:ide-journey`
- `npm run desktop:build`
- `npm run desktop:tauri:build`
- `cargo build --release -vv` in the no-spaces minimal scaffold
- `npm run tauri:build` in the no-spaces minimal scaffold

## Notes

- The temporary no-spaces worktree `C:\dev\kvdos-tauri-test` and the temporary
  minimal scaffold `C:\dev\tauri-minimal-test` are throwaway comparison
  material and must not be committed.
- The CI verification result is documented in
  [CI Windows Tauri Verification Result](./CI_WINDOWS_TAURI_VERIFICATION_RESULT.md).
- The repaired local environment result is documented in
  [Local Windows Environment Repair Verification](./LOCAL_WINDOWS_ENVIRONMENT_REPAIR_VERIFICATION.md).
