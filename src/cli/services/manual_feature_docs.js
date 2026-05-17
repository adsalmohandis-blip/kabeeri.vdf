const MANUAL_FEATURE_DOCS_INBOX = "KVDF_New_Features_Docs";
const PROTECTED_FEATURE_DOCS_RULE = "Do not move, rename, delete, or recreate the KVDF_New_Features_Docs folder until its contents have been redistributed into the correct Kabeeri folders.";

function isManualFeatureDocsInbox(name) {
  return String(name || "") === MANUAL_FEATURE_DOCS_INBOX;
}

function isProtectedFeatureDocsPath(path) {
  if (Array.isArray(path)) return path.some((item) => isProtectedFeatureDocsPath(item));
  return String(path || "").includes(MANUAL_FEATURE_DOCS_INBOX);
}

module.exports = {
  PROTECTED_FEATURE_DOCS_RULE,
  isManualFeatureDocsInbox,
  isProtectedFeatureDocsPath
};
