# KVDOS Desktop Packaging Roadmap

This roadmap covers the packaging path after the live snapshot UX validation
step.

## v1.7 Packaging Architecture + Tauri Readiness

### Goal

Define the packaging architecture and readiness rules before installing Tauri
or creating a Windows `.exe`.

### Scope

- packaging architecture decision
- Tauri readiness checklist
- Tauri toolchain setup guidance
- Windows preview boundary
- signing and installer planning notes

### Out Of Scope

- Tauri install
- Electron install
- Windows toolchain installation
- `.exe` build
- installer creation
- code signing implementation
- auto-updater implementation

### Acceptance Criteria

- the packaging direction is clear
- Tauri is preferred or deferred with explicit reasoning
- the desktop preview remains read-only and shell-free
- the Windows toolchain setup steps are documented

### Risks

- packaging claims can drift into implementation claims
- platform details can creep into the preview shell too early

### Status

done

## v1.8 Add Tauri Shell

### Goal

Introduce the first Tauri wrapper around the desktop shell.

### Scope

- Tauri runtime setup
- shell bridge structure
- desktop config placement

### Out Of Scope

- final installer decisions
- code signing
- auto-updater

### Acceptance Criteria

- the desktop shell is wrapped by Tauri without changing the read-only model

### Risks

- the bridge can become too broad if the shell boundary is not kept narrow

### Status

done

## v1.9 First Windows `.exe` Preview

### Goal

Produce the first Windows `.exe` preview from the Tauri-wrapped shell.

### Scope

- Windows packaging preview
- build verification notes
- distribution smoke checks

### Out Of Scope

- final installer decisions
- release automation

### Acceptance Criteria

- a Windows preview build exists and is reviewable

### Risks

- Windows packaging can expose path or dependency issues late

### Status

done

### Preview Notes

- A local Windows `.exe` preview was produced from the Tauri shell
- This is a local preview only and is not an official release artifact
- No installer, signing, or auto-updater is included

## v1.9.1 Windows `.exe` Launch Validation

### Goal

Validate the local Windows `.exe` preview by launching it and confirming that
the read-only KVDOS Desktop preview opens safely.

### Scope

- launch validation
- UI smoke checks
- read-only boundary confirmation

### Out Of Scope

- new packaging output
- installer creation
- code signing

### Acceptance Criteria

- the preview exe launches
- the read-only desktop preview is visible
- no task execution or shell execution is exposed

### Risks

- a preview artifact can exist but still fail to launch on the local machine
- launch failures can block packaging planning until the binary is corrected

### Status

blocked

### Launch Note

- The local preview exe exists, but launching it in this session fails with:
  - `The specified executable is not a valid application for this OS platform.`
- The preview launch validation is therefore blocked pending a binary fix
  before any installer/portable packaging decision.

## v1.9.2 Windows `.exe` Architecture / Target Diagnosis

### Goal

Diagnose why the generated KVDOS Desktop `.exe` is not launchable.

### Scope

- OS and architecture inspection
- Rust host/target inspection
- artifact header/hash inspection
- launch failure diagnosis

### Out Of Scope

- new packaging output
- installer creation
- code signing

### Acceptance Criteria

- the probable cause of the launch failure is documented
- the next recommended fix is clear

### Risks

- a generated artifact can look like a Windows `.exe` by name but still fail
  launch if the file is corrupt or not a valid PE image

### Status

blocked

### Diagnosis Note

- The generated `KVDOS Desktop.exe` exists, but the first bytes do not begin
  with the normal `MZ` Windows PE signature.
- Launch still fails immediately with:
  - `The specified executable is not a valid application for this OS platform.`
- The diagnosis report records the probable cause and the next fix path.

## v1.9.3 Windows `.exe` Artifact Path Fix

### Goal

Confirm whether the Tauri Windows preview executable path is correct and
identify the actual launchable artifact, if any, after a clean rebuild.

### Scope

- clean rebuild verification
- artifact discovery under `apps/desktop/src-tauri/target/`
- PE signature inspection for every application candidate
- path correction notes

### Out Of Scope

- installer creation
- code signing
- release publishing

### Acceptance Criteria

- the correct launchable artifact path is identified, or the absence of one is
  documented clearly

### Risks

- a build can succeed while still producing a non-launchable artifact
- bundle output may be absent if the current config does not enable bundling

### Status

blocked

### Artifact Note

- Clean rebuilds still produce two application candidates:
  - `apps/desktop/src-tauri/target/release/KVDOS Desktop.exe`
  - `apps/desktop/src-tauri/target/release/deps/kvdos_desktop.exe`
- Both candidates share the same invalid non-`MZ` header bytes and fail to
  launch.
- No `.msi`, `.msix`, `.appx`, or bundle output is present in the current
  `target/release/bundle/` tree.
- The correct executable path is therefore not a different bundle artifact in
  this build; the output itself still needs a packaging or target fix.

## v1.9.4 Tauri Rust Binary Output Diagnosis

### Goal

Compare the direct Cargo release output and the Tauri-wrapped output to confirm
whether the invalid Windows app-level binary is produced by Rust, by Tauri, or
by an artifact-path confusion.

### Scope

- direct Cargo build comparison
- Tauri wrapper build comparison
- app-level PE signature comparison
- bundle artifact presence check

### Out Of Scope

- installer creation
- code signing
- release publishing

### Acceptance Criteria

- the build path producing the invalid app-level binary is identified clearly

### Risks

- the same invalid bytes can be produced by both build routes, hiding the true
  source of the issue

### Status

blocked

### Diagnosis Note

- both `cargo build --release -vv` and `npm run desktop:tauri:build` produce
  the same app-level Windows executable candidates
- both candidates are non-PE binaries that do not begin with `MZ`
- no `.msi`, `.msix`, `.appx`, or bundle output is present
- the issue is therefore not a wrong artifact path; it is a binary output /
  packaging mismatch in the app-level target

## v1.9.5 Repair Tauri App Binary Target

### Goal

Repair the KVDOS Tauri app-level binary output so the generated Windows
executable starts with `MZ` and is launchable.

### Scope

- app binary target and scaffold repair
- minimal Tauri / Cargo config correction if one is found
- rebuild and launch validation

### Out Of Scope

- installer creation
- code signing
- release publishing

### Acceptance Criteria

- the generated app-level executable is a valid Windows PE file
- the executable launch no longer fails with the invalid application error

### Risks

- the issue may be deeper than a small config typo and may require a broader
  scaffold fix

### Status

blocked

### Repair Note

- the prior diagnosis showed that direct Cargo and Tauri builds both emit the
  same invalid app-level binary
- no minimal config correction was identified yet
- the later local Windows environment repair verification showed that the
  invalid app-level binary was caused by the local shell/toolchain setup, not
  by KVDOS config
- the KVDOS config remains valid when the environment is repaired

## Related Setup Docs

- [Tauri Toolchain Setup Guide](./TAURI_TOOLCHAIN_SETUP_GUIDE.md)
- [Tauri Toolchain Command Checklist](./TAURI_TOOLCHAIN_COMMAND_CHECKLIST.md)

## v1.10 Portable Preview Packaging Strategy

### Goal

Define the strategy for producing and distributing the first portable Windows
preview build using the verified GitHub Actions Windows environment.

### Scope

- portable preview artifact handling
- GitHub Actions artifact upload rules
- inspection and launch notes
- temporary preview boundary notes

### Out Of Scope

- final release packaging automation
- official release upload
- code signing implementation

### Acceptance Criteria

- the portable preview strategy is clearly documented
- GitHub Actions is identified as the trusted build environment for now
- local machine output is explicitly treated as untrusted until repaired or
  disproven
- preview artifact naming and sharing rules are documented

### Risks

- temporary preview language can be misread as an official release promise
- local environment drift can still be confused with repo/config issues

### Status

done

### Strategy Note

- GitHub Actions `windows-latest` is the trusted build environment for preview
  artifacts right now
- the local machine is not trusted for exe output until its environment issue
  is repaired or reproduced on a second clean Windows environment
- preview artifacts may be uploaded to CI for inspection only, but they are not
  official releases

## v1.9.8 Second Environment Tauri Verification

### Goal

Verify whether the invalid app-level `.exe` issue reproduces on a second
Windows environment or CI-like Windows runner.

### Scope

- GitHub Actions Windows runner verification
- second-machine comparison notes
- app-level executable PE signature comparison

### Out Of Scope

- official release publishing
- installer creation
- code signing

### Acceptance Criteria

- a second Windows environment confirms whether the app-level executable
  problem is local-only or broader

### Risks

- without a second environment run, the result remains inconclusive

### Status

planned

## v1.9.9 CI Windows Tauri Verification Result

### Goal

Record the GitHub Actions `windows-latest` result showing that KVDOS Tauri
produces a valid Windows PE executable in a clean CI environment.

### Scope

- CI artifact inspection result
- PE signature comparison with local machine
- local-vs-CI conclusion

### Out Of Scope

- new packaging output
- installer creation
- code signing

### Acceptance Criteria

- the CI Windows verification result is documented clearly
- the CI result is contrasted with the local invalid executable behavior
- the roadmap notes that config changes should not be made blindly after CI
  passes

### Risks

- local environment issues can still be mistaken for repo/config problems if CI
  is not consulted first

### Status

done

### CI Note

- GitHub Actions `windows-latest` produced a valid PE executable with `MZ:
  True`
- The local invalid `C5 C9` executable behavior is therefore a local
  environment / toolchain issue, not a KVDOS Tauri config issue
- Before changing KVDOS Tauri config again, verify whether the issue
  reproduces on CI or on a second clean Windows environment

## v1.9.11 Local Windows Environment Repair Verification

### Goal

Record that the local Windows environment has been repaired and now produces a
launchable KVDOS Desktop `.exe`.

### Scope

- local shell repair verification
- MSVC / toolchain environment confirmation
- launch and UI smoke checks

### Out Of Scope

- installer creation
- code signing
- release publishing

### Acceptance Criteria

- the local executable starts successfully
- the preview window opens
- the UI remains read-only
- the environment fix is documented without changing product runtime code

### Risks

- environment success can be misread as a product-code change if the record is
  not explicit

### Status

done

### Repair Note

- the previous local result was `C5 C9` with `MZ: False`
- the repaired local result is `MZ: True`
- launch succeeds and the KVDOS Desktop Studio Preview window opens
- the required shell is a Visual Studio Developer Shell / MSVC environment
- the required tools are `rustc`, `cargo`, `cl`, `link`, `rc`, and `mt`
- the UI shows the expected read-only preview content and no task execution
  from the desktop UI
- the repaired local environment and GitHub Actions `windows-latest` both
  produce valid executables when the environment is correct

## v1.11 Installer / Portable Distribution Decision

### Goal

Decide whether the first user-facing distribution after the portable preview
should be an installer or a portable build.

### Scope

- installer versus portable analysis
- user install experience notes
- distribution boundary notes

### Out Of Scope

- final release packaging automation
- code signing implementation

### Acceptance Criteria

- the distribution form is selected with explicit reasoning

### Risks

- early distribution language can overpromise support maturity

### Status

planned

## v1.12 Code Signing and Update Strategy Planning

### Goal

Plan code signing and update strategy before any beta distribution claim.

### Scope

- signing strategy notes
- certificate planning
- update strategy framing

### Out Of Scope

- actual signing infrastructure
- production update rollout

### Acceptance Criteria

- signing and update strategy are planned, not implied as shipped

### Risks

- signing language can sound like a release promise if not kept precise

### Status

planned
