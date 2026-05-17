# Commands

This folder now owns the booking builder command implementation, while the
plugin root bootstrap is `plugins/booking-builder/bootstrap.js`.

- `plugins/booking-builder/commands/booking.js`

The core CLI mounts that plugin-owned command file, but the lifecycle and
behavior now live with the plugin bundle rather than only in core files.

Expected areas:

- intake
- questionnaire
- brief generation
- design mapping
- module breakdown
- task synthesis
- approval packaging
- reporting
