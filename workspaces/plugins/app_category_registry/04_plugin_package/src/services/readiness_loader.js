function loadReadinessMatrix() {
  const { loadReadinessMatrix: loadMatrix } = require("./registry_loader");
  const matrix = loadMatrix();
  return matrix && Array.isArray(matrix.categories) ? matrix : { categories: [] };
}

module.exports = { loadReadinessMatrix };
