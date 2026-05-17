# POS Builder

`pos` is the app-track plugin for point-of-sale systems.

The plugin-owned runtime starts from:

- [plugins/pos/bootstrap.js](/D:/My%20Project%20Ideas/kabeeri.vdf/kabeeri-vdf/plugins/pos/bootstrap.js)
- [plugins/pos/runtime/pos.js](/D:/My%20Project%20Ideas/kabeeri.vdf/kabeeri-vdf/plugins/pos/runtime/pos.js)

```bash
kvdf plugins install pos
kvdf plugins uninstall pos
kvdf pos status
kvdf pos init --mode retail
```

The live runtime state lives in `.kabeeri/pos.json`.
