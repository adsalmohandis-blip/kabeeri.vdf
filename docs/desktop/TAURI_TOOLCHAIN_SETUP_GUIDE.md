# KVDOS Desktop Tauri Toolchain Setup Guide

This guide explains how to prepare a Windows machine for KVDOS Tauri builds
before attempting the first Windows `.exe` preview in `v1.9`.

## Purpose

- prepare the local Windows environment for the KVDOS Desktop Tauri toolchain
- verify the prerequisites before attempting any Tauri dev/build commands
- keep the setup path honest, read-only, and separate from product behavior

## Current Windows Requirement

The original blocker was local toolchain visibility. The repaired state shows
that the desktop build works when the shell is correct:

- use a Visual Studio Developer Shell / MSVC environment
- make sure Rust and Cargo are on `PATH`
- keep the MSVC linker and resource tools available in the same shell session

## Required Tools

- Node.js
- npm
- Rust toolchain
- Cargo
- `cl`
- `link`
- `rc`
- `mt`
- Tauri CLI or the project-local Tauri dependency path
- Windows WebView2 runtime
- Visual Studio Build Tools or C++ build tools if the Tauri build requires them

## Rust Install

Install Rust from the official Rust installer for Windows.

After installation, reopen the terminal and verify:

```bash
rustc --version
cargo --version
```

## Cargo PATH Fix

If Rust is installed but `rustc` and `cargo` are not recognized in a shell,
check whether `%USERPROFILE%\.cargo\bin` is missing from your PATH.

For a user-level fix on Windows:

1. Open Environment Variables
2. Edit the User `Path`
3. Add:

```text
%USERPROFILE%\.cargo\bin
```

Then restart PowerShell, VS Code, or your terminal so the updated PATH is
loaded, and verify again:

```powershell
rustc --version
cargo --version
```

## Cargo Verification

Cargo comes with Rust. Confirm both commands report versions before moving on.

## Tauri CLI / Tauri Dependency Setup

From the desktop package, install dependencies so the Tauri scripts can resolve:

```bash
npm --prefix apps/desktop install
```

If the project uses a local Tauri binary path, confirm the desktop package can
resolve it through the configured `tauri:dev` and `tauri:build` scripts.

## Node / npm Verification

Verify the JavaScript toolchain is available:

```bash
node --version
npm --version
```

## WebView2 Requirement

The Tauri desktop preview on Windows needs a supported WebView2 runtime.
Install or verify it on the target machine before attempting the preview build.

## Visual Studio Build Tools / C++ Build Tools Note

Some Windows Tauri builds need Visual Studio Build Tools or the C++ build
tools.

For KVDOS local Windows builds, the reliable path is to launch from a Visual
Studio Developer Shell / MSVC environment so `cl`, `link`, `rc`, and `mt` are
available alongside Rust.

## Recommended Command Sequence

Run the commands in this order:

```bash
rustc --version
cargo --version
cl
link
rc
mt
node --version
npm --version
npm --prefix apps/desktop install
npm run desktop:snapshot
npm run desktop:build
npm run desktop:tauri:dev -- --help
npm run desktop:tauri:build
```

## How To Verify Readiness

You are ready to move toward `v1.9` when:

- Rust and Cargo are installed and report versions
- `cl`, `link`, `rc`, and `mt` are available in the same shell session
- the desktop dependencies install cleanly
- the React/Vite desktop build still passes
- the Tauri dev/build commands resolve in the desktop package
- WebView2 is available on the Windows machine
- any required Windows build tools are installed

## Common Windows Errors

- `rustc` or `cargo` not recognized
- `tauri` not recognized
- `spawn EPERM` from the desktop build environment
- missing WebView2 runtime
- missing MSVC / C++ build tools
- missing Visual Studio Developer Shell context
- path or permission issues inside `src-tauri`
- `RC2175` icon/resource format errors during Tauri resource compilation

## What Not To Do

- do not install or change runtime tools from browser/UI code
- do not attempt to create an official `.exe` yet
- do not add installer, signing, or auto-updater behavior yet
- do not introduce task execution or shell execution from the UI
- do not treat setup as product behavior
- do not assume the shell PATH already includes `%USERPROFILE%\.cargo\bin`

## When To Proceed To v1.9

Proceed to `v1.9 First Windows .exe Preview` only after:

- the toolchain commands all verify successfully
- the desktop build still passes
- the Tauri dev/build commands are available
- the Owner approves the Windows preview step
- the shell is confirmed to be a Visual Studio Developer Shell / MSVC
  environment
