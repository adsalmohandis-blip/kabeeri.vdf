class AppFolderStructureError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "AppFolderStructureError";
    this.details = details;
  }
}

function appFolderError(message, details = {}) {
  return new AppFolderStructureError(message, details);
}

module.exports = { AppFolderStructureError, appFolderError };
