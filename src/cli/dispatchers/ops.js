const { dispatchReportCommands } = require("./reports");
const { dispatchEvolutionOpsCommands } = require("./evolution_ops");
const { dispatchDeliveryOpsCommands } = require("./delivery_ops");
const { dispatchSessionOpsCommands } = require("./session_ops");
const { dispatchAdminOpsCommands } = require("./admin_ops");
const { dispatchIdentityAccessCommands } = require("./identity_access");
const { dispatchGovernanceCommands } = require("./governance");

function dispatchOpsCommands({ group, action, value, flags, rest, c }) {
  const evolutionOps = dispatchEvolutionOpsCommands({ group, action, value, flags, rest, c });
  if (evolutionOps) return evolutionOps;
  const deliveryOps = dispatchDeliveryOpsCommands({ group, action, value, flags, rest, c });
  if (deliveryOps) return deliveryOps;
  const sessionOps = dispatchSessionOpsCommands({ group, action, value, flags, rest, c });
  if (sessionOps) return sessionOps;
  const report = dispatchReportCommands({ group, action, value, flags, c });
  if (report) return report.result;
  const adminOps = dispatchAdminOpsCommands({ group, action, value, flags, rest, c });
  if (adminOps) return adminOps;
  const identityAccess = dispatchIdentityAccessCommands({ group, action, value, flags, c });
  if (identityAccess) return identityAccess;
  const governance = dispatchGovernanceCommands({ group, action, value, flags, c });
  if (governance) return governance;

  return null;
}

module.exports = {
  dispatchOpsCommands
};
