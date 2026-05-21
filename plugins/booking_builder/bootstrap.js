const command = require("./commands/booking");
const runtime = require("./runtime/booking");

module.exports = {
  plugin_id: "booking-builder",
  name: "Booking Builder",
  command_entrypoint: "plugins/booking_builder/bootstrap.js",
  runtime_entrypoint: "plugins/booking_builder/runtime/booking.js",
  booking: command.booking,
  command,
  runtime
};
