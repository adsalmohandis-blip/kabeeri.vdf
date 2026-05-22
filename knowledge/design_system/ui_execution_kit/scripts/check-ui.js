#!/usr/bin/env node
"use strict";

const { runCheckUiCli } = require("../../../../plugins/ui_dashboard_kits/runtime/check_ui");

runCheckUiCli(process.argv.slice(2));
