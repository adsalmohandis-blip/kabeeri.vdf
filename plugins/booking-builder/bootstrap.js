const command = require("./commands/booking");
const runtime = require("./runtime/booking");

module.exports = {
  plugin_id: "booking-builder",
  name: "Booking Builder",
  command_entrypoint: "plugins/booking-builder/bootstrap.js",
  runtime_entrypoint: "plugins/booking-builder/runtime/booking.js",
  booking: command.booking,
  command,
  runtime
};
