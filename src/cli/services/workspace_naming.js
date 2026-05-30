function normalizeWorkspaceSlug(value) {
  const raw = String(value || "").trim().toLowerCase();
  if (!raw) return "";
  return raw
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function isSafeWorkspaceSlug(value) {
  return /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(String(value || ""));
}

module.exports = {
  normalizeWorkspaceSlug,
  isSafeWorkspaceSlug
};
