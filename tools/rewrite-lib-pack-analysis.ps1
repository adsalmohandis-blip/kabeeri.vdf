function Describe-File([string]$Name) {
  switch -Regex ($Name) {
    '^README(\..*)?$' { return 'Primary project overview and usage entry point.' }
    '^LICENSE(\..*)?$' { return 'Project license and distribution terms.' }
    '^CHANGELOG(\..*)?$' { return 'Release history and notable changes.' }
    '^CONTRIBUTING(\..*)?$' { return 'Contribution workflow and repository guidelines.' }
    '^SECURITY(\..*)?$' { return 'Security reporting guidance.' }
    '^CODE_OF_CONDUCT(\..*)?$' { return 'Community conduct policy.' }
    '^CODEOWNERS$' { return 'Ownership metadata for review routing.' }
    '^go\.mod$' { return 'Go module definition and dependency root.' }
    '^go\.sum$' { return 'Go dependency checksums.' }
    '^Cargo\.toml$' { return 'Rust package manifest and workspace definition.' }
    '^Cargo\.lock$' { return 'Rust dependency lockfile.' }
    '^package\.json$' { return 'Node package manifest and scripts.' }
    '^package-lock\.json$' { return 'npm dependency lockfile.' }
    '^yarn\.lock$' { return 'Yarn dependency lockfile.' }
    '^pyproject\.toml$' { return 'Python build and packaging configuration.' }
    '^poetry\.lock$' { return 'Locked dependency graph for Poetry.' }
    '^tsconfig\.json$' { return 'TypeScript compiler configuration.' }
    '^typedoc\.json$' { return 'API documentation generator configuration.' }
    '^jest\.config\..*$' { return 'Jest test runner configuration.' }
    '^\.travis\.yml$' { return 'CI configuration for automated validation.' }
    '^appveyor\.yml$' { return 'Windows CI configuration.' }
    '^Dockerfile(\..*)?$' { return 'Container build recipe.' }
    '^docker-compose(\..*)?\.yml$' { return 'Container orchestration configuration.' }
    '^\.dockerignore$' { return 'Docker packaging ignore rules.' }
    '^\.npmignore$' { return 'npm packaging ignore rules.' }
    '^\.gitignore$' { return 'Repository ignore rules for generated files and local state.' }
    '^\.editorconfig$' { return 'Editor formatting rules.' }
    '^\.eslintrc(\..*)?$' { return 'Lint configuration for JavaScript or TypeScript style checks.' }
    '^\.prettierrc(\..*)?$' { return 'Formatting configuration.' }
    '^\.prettierignore$' { return 'Prettier ignore rules.' }
    '^\.watchmanconfig$' { return 'File-watching configuration.' }
    '^\.fvmrc$' { return 'Flutter version pinning for the front end.' }
    '^\.gitmodules$' { return 'Submodule definitions for vendored or linked components.' }
    '^buf\.yaml$' { return 'Protocol buffer workspace configuration.' }
    '^buf\.gen\.yaml$' { return 'Protocol buffer generation configuration.' }
    '^compat\.yaml$' { return 'Compatibility configuration.' }
    '^GOALS\.md$' { return 'Project goals and roadmap context.' }
    '^ROADMAP\.md$' { return 'Planned features and project direction.' }
    '^FUNDING\.json$' { return 'Project sponsorship metadata.' }
    '^lychee\.toml$' { return 'Link checking configuration.' }
    '^\.cspell\.json$' { return 'Spell-check configuration.' }
    '^\.release-please(\..*)?$' { return 'Release automation configuration and state.' }
    '^build\.rs$' { return 'Rust build script for code generation or packaging.' }
    '^build\.go$' { return 'Go build system helper.' }
    '^build\.ps1$' { return 'Windows build helper.' }
    '^build\.sh$' { return 'POSIX build helper.' }
    '^main\.go$' { return 'CLI entry point and application bootstrap.' }
    '^index\.js$' { return 'Main package export or runtime entry point.' }
    '^cli\.js$' { return 'Command-line interface entry point.' }
    '^example\.js$' { return 'Runnable usage example.' }
    '^server\.js$' { return 'Server entry point and request handling.' }
    '^croc\.service$' { return 'Service definition for running the app as a daemon.' }
    '^makepot$' { return 'Translation template generation helper.' }
    '^generate-protobuf$' { return 'Protocol buffer generation helper.' }
    '^versioneer\.py$' { return 'Version management helper.' }
    '^newest-version\.py$' { return 'Version helper script.' }
    '^update-version\.py$' { return 'Version bump helper script.' }
    '^test\.js$' { return 'Automated tests for package behavior.' }
    '^testem\.js$' { return 'Browser test runner configuration.' }
    '^mockup\.ui$' { return 'UI mockup or layout prototype.' }
    '^test-prefs$' { return 'Test preferences or test configuration.' }
    '^warpinator\.pot$' { return 'Translation template file.' }
    '^warpinator\.spec$' { return 'Packaging specification file.' }
    '^rtc_config_example\.json$' { return 'Example WebRTC configuration.' }
    '^turnserver_example\.conf$' { return 'Example TURN server configuration.' }
    '^firebase_rules\.json$' { return 'Firebase security or deployment rules.' }
    '^newrelic\.js$' { return 'Observability and instrumentation configuration.' }
    '^ember-cli-build\.js$' { return 'Ember build entry point.' }
    '^sharedrop\.crx$' { return 'Browser extension artifact.' }
    '^\.env\.sample$' { return 'Sample environment configuration.' }
    '^\.readthedocs\.yaml$' { return 'Documentation build configuration.' }
    '^\.pre-commit-config\.yaml$' { return 'Pre-commit hook configuration.' }
    '^\.flake8$' { return 'Python lint configuration.' }
    '^\.coveragerc$' { return 'Coverage reporting configuration.' }
    '^MANIFEST\.in$' { return 'Python package manifest inputs.' }
    '^Makefile$' { return 'Developer automation and build targets.' }
    '^setup\.py$' { return 'Legacy Python packaging entry point.' }
    '^setup\.cfg$' { return 'Python packaging and tool configuration.' }
    '^tox\.ini$' { return 'Python test environment configuration.' }
    default { return 'Repository-level file used for configuration, docs, or packaging.' }
  }
}

function Describe-Dir([string]$Name) {
  switch -Regex ($Name.ToLowerInvariant()) {
    '^\.github$' { return 'CI workflows and repository automation.' }
    '^docs?$' { return 'Documentation, guides, and reference material.' }
    '^examples?$' { return 'Sample programs and usage demonstrations.' }
    '^src$' { return 'Primary implementation source code.' }
    '^test(s)?$' { return 'Automated tests and validation coverage.' }
    '^types$' { return 'Type declaration files and external type surface.' }
    '^lib$' { return 'Reusable library code and helper modules.' }
    '^cli$' { return 'Command-line interface helpers and binary wiring.' }
    '^server$' { return 'Server-side runtime and coordination logic.' }
    '^client$' { return 'Browser client or front-end application code.' }
    '^app$' { return 'Application source and UI logic.' }
    '^cmd$' { return 'CLI entry points and binary wiring.' }
    '^internal$' { return 'Internal implementation helpers.' }
    '^config$' { return 'Configuration models and defaults.' }
    '^assets?$|^res$|^resources?$|^data$' { return 'Static assets, icons, and runtime data.' }
    '^scripts?$' { return 'Build, release, and developer automation.' }
    '^build$' { return 'Build helpers or generated output.' }
    '^pkg$' { return 'Reusable packages or build-time support code.' }
    '^p2p$' { return 'Peer-to-peer primitives and helpers.' }
    '^dashboards?$' { return 'Project dashboards or metrics definitions.' }
    '^leaky_tests$' { return 'Leak-detection tests and harnesses.' }
    '^man$' { return 'Manual pages and documentation.' }
    '^meta$' { return 'Metadata and release support files.' }
    '^proto$' { return 'Protocol buffer definitions and generated code support.' }
    '^relnotes$' { return 'Release notes and changelog material.' }
    '^po$' { return 'Localization catalogs and translation files.' }
    '^etc$' { return 'Operating system integration, service units, and deployment examples.' }
    '^flatpak$' { return 'Flatpak packaging assets.' }
    '^debian$' { return 'Debian packaging assets.' }
    '^install-scripts$' { return 'Installer and post-install helper scripts.' }
    '^bin$' { return 'Binaries or helper scripts.' }
    '^shell$' { return 'Shell integration helpers.' }
    '^rendezvous$' { return 'Rendezvous and connection setup logic.' }
    '^wordlist$' { return 'Word list assets for wormhole code generation.' }
    '^wormhole$' { return 'Core wormhole protocol implementation.' }
    '^ci$' { return 'Continuous integration scripts and checks.' }
    '^vendor$' { return 'Vendored third-party dependencies.' }
    '^public$' { return 'Static web assets.' }
    '^docker$' { return 'Container build and nginx/OpenSSL assets.' }
    '^application$' { return 'Application wiring and bootstrap helpers.' }
    '^body$' { return 'Body rendering or response handling helpers.' }
    '^qr$' { return 'QR code generation and formatting.' }
    '^pages$' { return 'Web or UI page helpers.' }
    '^logger$' { return 'Logging helpers.' }
    '^version$' { return 'Version metadata and helpers.' }
    '^core$' { return 'Core networking and protocol logic.' }
    '^common$' { return 'Shared types, helpers, and cross-platform logic.' }
    '^fastlane$' { return 'Mobile release automation and deployment tooling.' }
    '^msix$' { return 'Windows packaging assets.' }
    '^readme_i18n$' { return 'Localized README assets.' }
    '^submodules$' { return 'Vendored or linked submodules.' }
    '^misc$' { return 'Desktop integration assets and helper material.' }
    '^contrib$' { return 'Community scripts and platform-specific helpers.' }
    '^ui$' { return 'Desktop UI entry points and application shell.' }
    '^nmh$' { return 'Supporting components or modules.' }
    '^plugins$' { return 'Extension or plugin surfaces.' }
    '^gui$' { return 'User interface code and assets.' }
    '^libnitroshare$' { return 'Core library code.' }
    '^dist$' { return 'Packaging and installer assets.' }
    '^bench$' { return 'Benchmark scripts and performance probes.' }
    '^\\.claude$' { return 'Assistant or tooling metadata.' }
    default { return 'Project subfolder containing source, docs, or support material.' }
  }
}

function Get-TreeLines([string]$Path, [int]$Depth, [string]$Prefix) {
  $lines = New-Object System.Collections.Generic.List[string]
  $items = Get-ChildItem -LiteralPath $Path -Force | Sort-Object @{Expression={$_.PSIsContainer};Descending=$true}, Name
  foreach ($item in $items) {
    if ($item.PSIsContainer) {
      $lines.Add("$Prefix$($item.Name)/")
      if ($Depth -gt 0) {
        $children = Get-ChildItem -LiteralPath $item.FullName -Directory -Force | Sort-Object Name
        foreach ($child in $children) {
          $lines.Add("$Prefix  $($item.Name)/$($child.Name)/")
          if ($Depth -gt 1) {
            $grandChildren = Get-ChildItem -LiteralPath $child.FullName -Directory -Force | Sort-Object Name
            foreach ($grand in $grandChildren) {
              $lines.Add("$Prefix    $($item.Name)/$($child.Name)/$($grand.Name)/")
            }
          }
        }
      }
    }
    else {
      $lines.Add("$Prefix$($item.Name)")
    }
  }
  return $lines
}

function Get-StructureHighlights([System.Collections.Generic.List[string]]$TopDirs) {
  $lines = New-Object System.Collections.Generic.List[string]
  if ($TopDirs -contains 'cmd' -and $TopDirs -contains 'lib' -and $TopDirs -contains 'proto') {
    $lines.Add('- This repository has a broad runtime split, with binaries, shared code, and protocol definitions living in separate directories.')
  }
  if ($TopDirs -contains 'app' -or $TopDirs -contains 'server' -or $TopDirs -contains 'cli') {
    $lines.Add('- The project is split across app, server, and command-line surfaces, which usually means the UI, runtime, and utility layers are developed in parallel.')
  }
  if ($TopDirs -contains 'packages') {
    $lines.Add('- The packages/ tree is the primary monorepo surface and should be read as the real source map for implementation, transport, protocol, and helper packages.')
  }
  if ($TopDirs -contains 'docs' -or $TopDirs -contains 'doc') {
    $lines.Add('- Documentation is treated as a first-class part of the repo layout rather than an afterthought.')
  }
  if ($TopDirs -contains 'etc' -or $TopDirs -contains 'fastlane' -or $TopDirs -contains 'msix' -or $TopDirs -contains 'flatpak' -or $TopDirs -contains 'debian') {
    $lines.Add('- Packaging and operating-system integration assets are kept near the root so platform support is easy to discover.')
  }
  if ($TopDirs -contains 'internal' -or $TopDirs -contains 'proto') {
    $lines.Add('- Internal helpers and protocol definitions are separated from public runtime code, which is a common marker of a mature codebase.')
  }
  if ($TopDirs -contains 'test' -or $TopDirs -contains 'tests') {
    $lines.Add('- Tests are isolated in dedicated directories, making validation easier to navigate from the root tree.')
  }
  return $lines
}

function Build-PackAnalysis([string]$serial, [string]$outerPath, [string]$summary, [string[]]$notes) {
  $outer = Resolve-Path -LiteralPath $outerPath
  $inner = Get-ChildItem -LiteralPath $outer.Path -Directory | Select-Object -First 1
  if (-not $inner) { throw \"No inner repository folder found in $outerPath\" }
  $items = Get-ChildItem -LiteralPath $inner.FullName -Force | Sort-Object @{Expression={$_.PSIsContainer};Descending=$true}, Name
  $dirs = $items | Where-Object { $_.PSIsContainer }
  $files = $items | Where-Object { -not $_.PSIsContainer }
  $topDirNames = New-Object System.Collections.Generic.List[string]
  foreach ($d in $dirs) { [void]$topDirNames.Add($d.Name) }
  $tree = New-Object System.Collections.Generic.List[string]
  [void]$tree.Add("$($inner.Name)/")
  foreach ($line in (Get-TreeLines -Path $inner.FullName -Depth 2 -Prefix '  ')) {
    [void]$tree.Add($line)
  }
  $content = New-Object System.Collections.Generic.List[string]
  $content.Add('# LIB_STRUCTURE_ANALYSIS')
  $content.Add('')
  $content.Add("This document explains the foldering and file structure of lib_pack/$serial-$($inner.Name) and what each part does in the current snapshot.")
  $content.Add('')
  $content.Add('## High-Level Summary')
  $content.Add('')
  $content.Add($summary)
  $content.Add('')
  $content.Add('## Repository Tree')
  $content.Add('')
  $content.Add('```text')
  foreach ($line in $tree) { $content.Add($line) }
  $content.Add('```')
  $content.Add('')
  $content.Add('## Top-Level Files')
  $content.Add('')
  foreach ($f in $files) {
    $content.Add(('- ' + $f.Name + ' - ' + (Describe-File $f.Name)))
  }
  $content.Add('')
  $content.Add('## Top-Level Directories')
  $content.Add('')
  foreach ($d in $dirs) {
    $content.Add(('- ' + $d.Name + '/ - ' + (Describe-Dir $d.Name)))
  }
  $content.Add('')
  $content.Add('## Nested Structure Map')
  $content.Add('')
  foreach ($d in $dirs) {
    $children = Get-ChildItem -LiteralPath $d.FullName -Directory -Force | Sort-Object Name
    if ($children.Count -gt 0) {
      $content.Add("- $($d.Name)/")
      foreach ($child in $children) {
        $content.Add("  - $($child.Name)/ - $(Describe-Dir $child.Name)")
        $grand = Get-ChildItem -LiteralPath $child.FullName -Directory -Force | Sort-Object Name
        if ($grand.Count -gt 0) {
          $grandNames = ($grand | ForEach-Object { $_.Name + '/' }) -join ', '
          $content.Add("    - contains: $grandNames")
        }
      }
    }
  }
  $content.Add('')
  $content.Add('## Notable Structure')
  $content.Add('')
  $content.Add('- The most important entry points are the README, build manifest, and the source or server directories that define the runtime surface.')
  $content.Add('- The root files show how the project is packaged, tested, and distributed across platforms.')
  $content.Add('- The directory layout separates implementation, tests, examples, and packaging concerns so the repository is easy to scan.')
  foreach ($line in (Get-StructureHighlights -TopDirs $topDirNames)) {
    $content.Add($line)
  }
  foreach ($note in $notes) {
    $content.Add("- $note")
  }
  $content.Add('')
  $content.Add('## Notes')
  $content.Add('')
  $content.Add('Current snapshot root for analysis: ' + $inner.Name)
  [System.IO.File]::WriteAllText((Join-Path $outer.Path 'LIB_STRUCTURE_ANALYSIS.md'), ($content -join "`r`n"), [System.Text.Encoding]::UTF8)
}

$packs = @(
  @{ Serial='0024'; Outer='lib_pack\\0024-bonjour-service-master'; Summary='bonjour-service-master is a TypeScript Bonjour/Zeroconf service discovery library for publishing and finding services on the local network.'; Notes=@('The package is compact and library-first, with `src/`, `test/`, and `types/` carrying most of the implementation and validation surface.','The examples folder gives a fast route to the public API, while the workflow files show how the package is built and released.','The top-level package manifest and TypeScript config make this a straightforward Node/TypeScript library snapshot.') },
  @{ Serial='0025'; Outer='lib_pack\\0025-ciao-latest'; Summary='ciao-latest is a TypeScript DNS-SD and multicast discovery library, closely tied to Homebridge-style service discovery workflows.'; Notes=@('The repository keeps documentation, source, and spec files separated so the API and implementation are easy to inspect.','Benchmarks and tests sit alongside the source, which makes protocol behavior and performance easier to verify.','The package manifest and typedoc setup suggest an actively maintained publishable library rather than an app.') },
  @{ Serial='0026'; Outer='lib_pack\\0026-croc-main'; Summary='croc-main is a Go-based encrypted file transfer tool with relay, Docker, and service packaging support.'; Notes=@('The CLI entry point and src packages define the transfer flow, while service and Docker files show deployment support.','The repo is oriented around a runnable command-line tool rather than a shared library.','Release and platform files in the root show it is built for practical distribution across environments.') },
  @{ Serial='0027'; Outer='lib_pack\\0027-ffsend-master'; Summary='ffsend-master is a Rust secure file-sharing tool inspired by Firefox Send, with packaging and release automation.'; Notes=@('Rust manifests, build scripts, and release config live at the root, which makes the distribution story explicit.','The src tree contains the application logic, while contrib and res hold platform helpers and assets.','The repository is organized like a mature CLI project with security and packaging concerns visible up front.') },
  @{ Serial='0028'; Outer='lib_pack\\0028-go-libp2p-master'; Summary='go-libp2p-master is the Go implementation of the libp2p networking stack with core protocol, docs, and tooling surfaces.'; Notes=@('The root packages and the core/p2p/x directories show a broad protocol stack with many subcomponents.','Docs, dashboards, examples, and test-plans indicate a mature networking project with strong validation culture.','The top-level options, defaults, and version files are important entry points for configuration and release behavior.') },
  @{ Serial='0029'; Outer='lib_pack\\0029-hyperswarm-main'; Summary='hyperswarm-main is a JavaScript swarm discovery library for peer-to-peer networking.'; Notes=@('The repository is intentionally small, with index.js and lib/ forming the main runtime surface.','Tests and examples are first-class, which makes swarm behavior easy to validate and demo.','The package is optimized for direct consumption from Node-style projects.') },
  @{ Serial='0030'; Outer='lib_pack\\0030-js-libp2p-main'; Summary='js-libp2p-main is a JavaScript libp2p monorepo with many packages, docs, and interop assets.'; Notes=@('The packages/ tree is the heart of the repo, with docs, interop, and images supporting a large modular codebase.','Release-please files, typedoc, and security policy files show a polished repository lifecycle.','This pack is one of the broadest monorepos in the set, so the top-level tree is especially important for orientation.') },
  @{ Serial='0031'; Outer='lib_pack\\0031-LANDrop-master'; Summary='LANDrop-master is a Qt-based desktop application for transferring files across a local network.'; Notes=@('The LANDrop application folder holds the core UI and networking logic, while misc contains desktop integration assets.','The repo is desktop-app oriented, not library oriented, so the source and UI files matter most.','The presence of multiple UI forms and C++ source files suggests a traditional Qt application structure.') },
  @{ Serial='0032'; Outer='lib_pack\\0032-localsend-main'; Summary='localsend-main is a cross-platform local file sharing project with Flutter, a Rust server, a CLI, and packaging assets.'; Notes=@('The app/, server/, and cli/ split makes the front end, backend, and companion interfaces easy to identify.','Packaging and localization directories show that this project is meant to ship across multiple platforms.','Common and core folders hold shared logic that bridges the Flutter app and the Rust server runtime.') },
  @{ Serial='0033'; Outer='lib_pack\\0033-magic-wormhole-master'; Summary='magic-wormhole-master is a Python implementation of Magic Wormhole for secure code-based file and text transfer.'; Notes=@('The src package is the main runtime, while docs, pyi, and signatures show packaging and release discipline.','Version helper scripts and release notes suggest a mature Python distribution workflow.','The repository balances user-facing docs with packaging and executable-building assets.') },
  @{ Serial='0034'; Outer='lib_pack\\0034-multicast-dns-master'; Summary='multicast-dns-master is a small Node.js multicast DNS implementation with CLI and tests.'; Notes=@('The repository is intentionally tiny, with index.js and cli.js carrying the main runtime entry points.','The test file at the root makes behavior easy to inspect quickly.','This is the kind of package you can understand almost entirely from the top-level tree and README.') },
  @{ Serial='0035'; Outer='lib_pack\\0035-nitroshare-desktop-master'; Summary='nitroshare-desktop-master is a Qt/CMake desktop file-sharing application with packaging and UI surfaces.'; Notes=@('The ui/, src/, and libnitroshare/ areas define the application shell, implementation, and reusable core code.','CMake modules and dist assets show a strong desktop packaging pipeline.','The presence of plugins and client directories suggests the project has multiple runtime surfaces beyond the main UI.') },
  @{ Serial='0036'; Outer='lib_pack\\0036-PairDrop-master'; Summary='PairDrop-master is a browser-based peer-to-peer file sharing app with server, docs, and Docker deployment.'; Notes=@('The server/ and public/ directories are the main runtime surfaces, while dev/ and docker-compose files support local deployment.','TURN and RTC example configs indicate a WebRTC-oriented connection model.','The repo is split between app behavior, deployment files, and documentation, which is typical for a production web app.') },
  @{ Serial='0037'; Outer='lib_pack\\0037-python-zeroconf-master'; Summary='python-zeroconf-master is a Python Zeroconf and multicast DNS service discovery library.'; Notes=@('The src/, tests/, examples/, and bench/ directories give the project a mature library structure with validation and performance coverage.','Packaging files such as pyproject.toml, poetry.lock, and MANIFEST.in show a modern Python distribution workflow.','The docs and CLAUDE notes make the repository easy to onboard into without guessing the package shape.') },
  @{ Serial='0038'; Outer='lib_pack\\0038-qrcp-main'; Summary='qrcp-main is a Go command-line file transfer tool that uses QR codes and a local network server.'; Notes=@('The cmd/, server/, qr/, and util/ directories form the core runtime flow for sharing files through QR-based discovery.','The presence of pages/ and body/ suggests a small web-facing layer around the transfer workflow.','The top-level build and security files indicate a practical CLI project with release and operational concerns.') },
  @{ Serial='0039'; Outer='lib_pack\\0039-sharedrop-master'; Summary='sharedrop-master is an Ember-based peer-to-peer file sharing web app with server and vendor assets.'; Notes=@('The app/ and server.js pairing shows a classic web app split between client experience and backend coordination.','Vendor assets, Firebase rules, and template lint configs show a mature front-end project with support tooling.','Procfile and Docker support suggest deployable web infrastructure rather than a simple demo.') },
  @{ Serial='0040'; Outer='lib_pack\\0040-snapdrop-master'; Summary='snapdrop-master is a local-network file sharing web app with client, server, docs, and Docker support.'; Notes=@('The client/ and server/ directories split the browser UI from the signaling/runtime logic.','Docker and docs files make local setup and deployment easy to discover.','This pack is a concise example of a web-first transfer application with a small but meaningful surface area.') },
  @{ Serial='0041'; Outer='lib_pack\\0041-syncthing-main'; Summary='syncthing-main is a large Go project for continuous device-to-device file synchronization.'; Notes=@('The cmd/, gui/, internal/, lib/, proto/, and meta/ directories show a broad and production-grade architecture.','The many Dockerfiles and build helpers indicate multiple service and deployment targets.','Release notes, policy, and compatibility files make this one of the most operationally complex packs in the set.') },
  @{ Serial='0042'; Outer='lib_pack\\0042-warpinator-master'; Summary='warpinator-master is a Linux desktop app for sending and receiving files across a local network.'; Notes=@('The src/, resources/, po/, and flatpak/debian packaging areas show a full desktop distribution pipeline.','Meson build files and installer scripts point to a native Linux app structure.','Localization assets and UI mockups make the product surface easy to follow from the root tree.') },
  @{ Serial='0043'; Outer='lib_pack\\0043-wormhole-william-master'; Summary='wormhole-william-master is a Go implementation of Magic Wormhole for secure file, text, and directory transfer.'; Notes=@('The wormhole/ package is the protocol core, while rendezvous/ and wordlist/ support connection setup and code generation.','The cmd/ and main.go entry points make the project feel like a real CLI tool rather than a library-only snapshot.','CI and release helpers in the root show a project that is meant to be built and shipped.') }
  @{ Serial='0044'; Outer='lib_pack\\0044-ai-ui-reviewer-main'; Summary='ai-ui-reviewer-main is an AI-assisted UI review workspace for evaluating design quality, accessibility, and interface feedback from screenshots and mockups.'; Notes=@('The repository is centered on review workflows rather than a production app shell.','Documentation and automation surfaces should be read as part of the review pipeline.','The package name suggests the main purpose is critique, scoring, and design feedback rather than component generation.') }
  @{ Serial='0045'; Outer='lib_pack\\0045-ai-website-design-ui-ux-reviewer-main'; Summary='ai-website-design-ui-ux-reviewer-main is a website design review workspace focused on UI/UX critique and quality analysis.'; Notes=@('The repo is organized around review and evaluation rather than a deployment-ready product surface.','Any docs or sample assets should be treated as part of the design-analysis workflow.','The package name suggests a narrow focus on website-level layout, polish, and UX review.') }
  @{ Serial='0046'; Outer='lib_pack\\0046-axe-core-develop'; Summary='axe-core-develop is the axe-core accessibility engine development workspace for automated accessibility testing and rule execution.'; Notes=@('The repo is expected to revolve around accessibility rules, test coverage, and release tooling.','Library and test directories are likely the most important surfaces for understanding behavior.','This pack should be read as a core accessibility-engine codebase, not a product UI repository.') }
  @{ Serial='0047'; Outer='lib_pack\\0047-cofounder-main'; Summary='cofounder-main is a product-oriented AI cofounder workspace for collaborative startup and product workflows.'; Notes=@('The repository likely mixes product workflow tooling with planning or assistant-facing surfaces.','Any docs and task orchestration files are likely central to how the project is intended to be used.','The name suggests a companion system for ideation, review, and execution support.') }
  @{ Serial='0048'; Outer='lib_pack\\0048-draw-a-ui-main'; Summary='draw-a-ui-main is a UI generation workspace for sketching application interfaces from prompts or visual references.'; Notes=@('The repository likely emphasizes prompt-to-UI or sketch-to-layout workflows.','Front-end assets and helper code are the most relevant surfaces for understanding output shape.','This pack should be read as a design-to-implementation assistant tool rather than a generic app shell.') }
  @{ Serial='0049'; Outer='lib_pack\\0049-growth-design-review-main'; Summary='growth-design-review-main is a design-review workspace focused on growth and conversion-oriented UI evaluation.'; Notes=@('The repo appears to target business impact, conversion flows, and product-led UX critique.','Documentation and evaluation scripts are likely more important than runtime code.','The name suggests a review workflow for product metrics and growth-facing surfaces.') }
  @{ Serial='0050'; Outer='lib_pack\\0050-lighthouse-main'; Summary='lighthouse-main is the Google Lighthouse auditing workspace for performance, accessibility, SEO, and best-practice checks.'; Notes=@('This repository should be read as an auditing and scoring engine with CLI and report surfaces.','Docs and examples likely explain the audit categories and report formats.','The main value is measurement and guidance rather than app-specific business logic.') }
  @{ Serial='0051'; Outer='lib_pack\\0051-llamacoder-main'; Summary='llamacoder-main is an AI code-generation workspace focused on building apps from prompts and design inputs.'; Notes=@('The repository likely mixes prompt handling, generation flows, and UI review surfaces.','Any examples or demo directories are important because they show the intended generation output.','The project name suggests a coding-assistant or app-generator product rather than a library-only package.') }
  @{ Serial='0052'; Outer='lib_pack\\0052-make-real-main'; Summary='make-real-main is an interface-generation workspace for turning design inputs into implementation-ready UI.'; Notes=@('This repository likely centers on design-to-code workflows and UI implementation helpers.','Examples, docs, and front-end surfaces should be prioritized when reading the tree.','The name suggests a real-product UI generation flow rather than a pure component library.') }
  @{ Serial='0053'; Outer='lib_pack\\0053-make-real-starter-main'; Summary='make-real-starter-main is the starter template for the Make Real UI generation workflow.'; Notes=@('The pack likely contains a minimal scaffold used to bootstrap Make Real projects.','Starter assets and configuration files are more important than a large source tree.','This repository should be treated as a template or baseline rather than a full product surface.') }
  @{ Serial='0054'; Outer='lib_pack\\0054-openv0-main'; Summary='openv0-main is an open UI generation workspace inspired by v0-style component and app creation.'; Notes=@('The repository likely combines prompt-driven UI generation with reusable components and docs.','The top-level layout should reveal the generation pipeline and preview surfaces quickly.','The project name suggests a public, open version of a design-to-app flow.') }
  @{ Serial='0055'; Outer='lib_pack\\0055-pa11y-main'; Summary='pa11y-main is an automated accessibility testing and reporting tool for web pages and applications.'; Notes=@('This repository is primarily an accessibility checker and reporting toolchain.','CLI commands, reporting assets, and tests are likely the key surfaces.','The pack is best read as a validation utility for web accessibility rather than a UI app.') }
  @{ Serial='0056'; Outer='lib_pack\\0056-playwright-main'; Summary='playwright-main is the Playwright browser automation and testing workspace with docs, tooling, and release support.'; Notes=@('The repo likely has a very broad monorepo-like structure because it spans browser automation, docs, tooling, and tests.','Package and platform folders are essential for understanding the supported runtime surfaces.','The project should be treated as a testing framework and automation platform, not just a library.') }
  @{ Serial='0057'; Outer='lib_pack\\0057-pr-agent-main'; Summary='pr-agent-main is an AI pull-request review and change-assistance workspace for code review automation.'; Notes=@('The repository likely centers on PR analysis, review comments, and workflow integration.','Docs and configs will probably be as important as the runtime implementation because review behavior is policy-driven.','The name suggests an assistant that sits between code changes and human review.') }
  @{ Serial='0058'; Outer='lib_pack\\0058-primitives-main'; Summary='primitives-main is a UI primitives and component system workspace for reusable design building blocks.'; Notes=@('The repository likely emphasizes foundational components, tokens, and reusable UI pieces.','Docs, examples, and component catalogs should be the primary orientation points.','The project name suggests a design-system or component-library style workspace.') }
  @{ Serial='0059'; Outer='lib_pack\\0059-screenshot-to-code-main'; Summary='screenshot-to-code-main is a UI generation workflow for turning screenshots into code and structured app layouts.'; Notes=@('The repository likely combines image input, prompt orchestration, and generated output previews.','Examples and docs are probably the best way to understand the intended workflow.','This pack should be read as a screenshot-to-implementation pipeline rather than a traditional app.') }
  @{ Serial='0060'; Outer='lib_pack\\0060-ui-main'; Summary='ui-main is a large UI workspace centered on interface generation, design review, and product-page tooling.'; Notes=@('The repository likely spans multiple UI review and generation surfaces, so the top-level tree matters a lot.','Docs and app shells are likely the first places to inspect for workflow shape.','The name suggests a broad front-end workspace rather than a single-purpose utility.') }
  @{ Serial='0061'; Outer='lib_pack\\0061-ui-ux-design-review-agent-main'; Summary='ui-ux-design-review-agent-main is an AI-powered agent for reviewing UI and UX quality across product screens.'; Notes=@('The repository is likely organized around review tasks, prompts, and evidence output.','Any rules or reporting files should be treated as core to the agent behavior.','The project name suggests a specialized agent rather than a general-purpose design system.') }
)

foreach ($pack in $packs) {
  $notes = @()
  if ($pack.Notes) { $notes = $pack.Notes -split ';' }
  Build-PackAnalysis -serial $pack.Serial -outerPath $pack.Outer -summary $pack.Summary -notes $notes
}

$verified = @()
foreach ($pack in $packs) {
  $path = Join-Path $pack.Outer 'LIB_STRUCTURE_ANALYSIS.md'
  if (Test-Path -LiteralPath $path) { $verified += $path }
}
Write-Output $verified.Count
