# Booking Builder

`booking-builder` is the app-track plugin for booking and reservation products.
Its root bootstrap lives inside the plugin bundle at
`plugins/booking-builder/bootstrap.js`, which exposes the booking command and
runtime owned by the plugin bundle.

It is installable and uninstallable through the plugin loader. Installation now
mounts the plugin bundle into `.kabeeri/plugin-mounts/booking-builder/`, and
uninstall removes that mounted copy:

```bash
kvdf plugins install booking-builder
kvdf plugins uninstall booking-builder
```

Once enabled, it exposes a deterministic runtime pipeline:

```bash
kvdf booking status
kvdf booking init --mode appointments
kvdf booking questionnaire
kvdf booking brief
kvdf booking design
kvdf booking modules
kvdf booking tasks
kvdf booking approve
kvdf booking report
```

The runtime state is stored in `.kabeeri/booking.json`, so the plugin can be
resumed, validated, and reported without chat history.
