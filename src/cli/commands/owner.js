const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists } = require("../fs_utils");
const { table } = require("../ui");

function owner(action, value, flags = {}, deps = {}) {
  const { appendAudit, ensureNoOtherOwner } = deps;
  ensureWorkspace();

  if (action === "transfer") {
    return ownerTransfer(value, flags, deps);
  }

  if (!action || action === "status") {
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    const session = readJsonFile(".kabeeri/session.json");
    const active = isOwnerSessionActive(session);
    console.log(table(["Field", "Value"], [
      ["Auth configured", auth.configured ? "yes" : "no"],
      ["Owner ID", auth.owner_id || ""],
      ["Session active", active ? "yes" : "no"],
      ["Session expires", session.expires_at || ""]
    ]));
    return;
  }

  if (action === "init") {
    const ownerId = flags.id || value;
    const name = flags.name || "Project Owner";
    const passphrase = getPassphrase(flags);
    if (!ownerId) throw new Error("Missing owner id.");
    if (!passphrase) throw new Error("Missing passphrase. Use --passphrase or KVDF_OWNER_PASSPHRASE.");
    ensureNoOtherOwner(ownerId);
    upsertOwnerDeveloper(ownerId, name);
    const auth = createOwnerAuth(ownerId, passphrase);
    writeJsonFile(".kabeeri/owner_auth.json", auth);
    writeJsonFile(".kabeeri/session.json", createOwnerSession(ownerId));
    appendAudit("owner_auth.configured", "owner", ownerId, "Owner auth configured");
    console.log(`Owner auth configured for ${ownerId}. Session started.`);
    return;
  }

  if (action === "login") {
    const ownerId = flags.id || value;
    const passphrase = getPassphrase(flags);
    if (!ownerId) throw new Error("Missing owner id.");
    if (!passphrase) throw new Error("Missing passphrase. Use --passphrase or KVDF_OWNER_PASSPHRASE.");
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    if (!auth.configured) throw new Error("Owner auth is not configured. Run `kvdf owner init` first.");
    if (auth.owner_id !== ownerId) throw new Error("Owner id does not match configured owner.");
    if (!verifyPassphrase(passphrase, auth)) throw new Error("Invalid owner passphrase.");
    writeJsonFile(".kabeeri/session.json", createOwnerSession(ownerId));
    appendAudit("owner_auth.login", "owner", ownerId, "Owner session started");
    console.log(`Owner session started for ${ownerId}.`);
    return;
  }

  if (action === "logout") {
    const session = readJsonFile(".kabeeri/session.json");
    writeJsonFile(".kabeeri/session.json", { active: false, owner_id: session.owner_id || null, logged_out_at: new Date().toISOString() });
    appendAudit("owner_auth.logout", "owner", session.owner_id || "owner", "Owner session ended");
    console.log("Owner session ended.");
    return;
  }

  throw new Error(`Unknown owner action: ${action}`);
}

function ownerTransfer(action, flags = {}, deps = {}) {
  const { appendAudit, requireOwnerAuthority, isExpired } = deps;
  const file = ".kabeeri/owner_transfer_tokens.json";
  if (!fileExists(file)) writeJsonFile(file, { tokens: [] });
  const data = readJsonFile(file);
  data.tokens = data.tokens || [];

  if (!action || action === "list") {
    console.log(table(["Token", "From", "To", "Status", "Expires"], data.tokens.map((token) => [
      token.token_id,
      token.from_owner_id,
      token.to_owner_id,
      token.status,
      token.expires_at || ""
    ])));
    return;
  }

  if (action === "issue") {
    requireOwnerAuthority(flags);
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    const toOwnerId = flags.to || flags["to-owner"];
    if (!toOwnerId) throw new Error("Missing --to.");
    const transferCode = flags.token || createSecretToken();
    const tokenId = `owner-transfer-${String(data.tokens.length + 1).padStart(3, "0")}`;
    const expiresAt = flags.expires || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    data.tokens.push({
      token_id: tokenId,
      from_owner_id: auth.owner_id,
      to_owner_id: toOwnerId,
      to_owner_name: flags.name || toOwnerId,
      status: "issued",
      token_hash: hashTransferToken(transferCode),
      created_at: new Date().toISOString(),
      expires_at: expiresAt
    });
    writeJsonFile(file, data);
    appendAudit("owner_transfer.issued", "owner_transfer", tokenId, `Owner transfer issued to ${toOwnerId}`);
    console.log(`Issued owner transfer token ${tokenId}`);
    console.log(`Transfer code: ${transferCode}`);
    return;
  }

  if (action === "accept") {
    const tokenId = flags.id || flags.tokenId || flags["token-id"];
    const transferCode = flags.token || flags["transfer-code"];
    const passphrase = getPassphrase(flags);
    if (!tokenId) throw new Error("Missing --id.");
    if (!transferCode) throw new Error("Missing --token.");
    if (!passphrase) throw new Error("Missing new owner passphrase. Use --passphrase or KVDF_OWNER_PASSPHRASE.");
    const token = data.tokens.find((item) => item.token_id === tokenId);
    if (!token) throw new Error(`Owner transfer token not found: ${tokenId}`);
    if (token.status !== "issued") throw new Error(`Owner transfer token is not usable: ${token.status}`);
    if (isExpired(token.expires_at)) {
      token.status = "expired";
      token.expired_at = new Date().toISOString();
      writeJsonFile(file, data);
      throw new Error(`Owner transfer token expired: ${tokenId}`);
    }
    if (token.token_hash !== hashTransferToken(transferCode)) throw new Error("Invalid owner transfer token.");
    transferOwnerRole(token.from_owner_id, token.to_owner_id, token.to_owner_name);
    writeJsonFile(".kabeeri/owner_auth.json", createOwnerAuth(token.to_owner_id, passphrase));
    writeJsonFile(".kabeeri/session.json", createOwnerSession(token.to_owner_id));
    token.status = "used";
    token.used_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("owner_transfer.accepted", "owner_transfer", tokenId, `Owner transferred from ${token.from_owner_id} to ${token.to_owner_id}`);
    console.log(`Owner transferred to ${token.to_owner_id}. Session started.`);
    return;
  }

  if (action === "revoke") {
    requireOwnerAuthority(flags);
    const tokenId = flags.id || flags.tokenId || flags["token-id"];
    if (!tokenId) throw new Error("Missing --id.");
    const token = data.tokens.find((item) => item.token_id === tokenId);
    if (!token) throw new Error(`Owner transfer token not found: ${tokenId}`);
    token.status = "revoked";
    token.revoked_at = new Date().toISOString();
    writeJsonFile(file, data);
    appendAudit("owner_transfer.revoked", "owner_transfer", tokenId, "Owner transfer token revoked");
    console.log(`Revoked owner transfer token ${tokenId}`);
    return;
  }

  throw new Error(`Unknown owner transfer action: ${action}`);
}

function createSecretToken() {
  const crypto = require("crypto");
  return crypto.randomBytes(24).toString("base64url");
}

function hashTransferToken(token) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function transferOwnerRole(fromOwnerId, toOwnerId, toOwnerName) {
  const file = ".kabeeri/developers.json";
  const data = readJsonFile(file);
  data.developers = data.developers || [];
  for (const developer of data.developers) {
    if (developer.role === "Owner") {
      developer.role = developer.id === fromOwnerId ? "Maintainer" : developer.role;
    }
  }
  let nextOwner = data.developers.find((developer) => developer.id === toOwnerId);
  if (!nextOwner) {
    nextOwner = {
      id: toOwnerId,
      type: "human",
      display_name: toOwnerName || toOwnerId,
      role: "Owner",
      workstreams: [],
      status: "active",
      created_at: new Date().toISOString()
    };
    data.developers.push(nextOwner);
  }
  nextOwner.role = "Owner";
  nextOwner.status = "active";
  nextOwner.display_name = nextOwner.display_name || toOwnerName || toOwnerId;
  writeJsonFile(file, data);
}

function getPassphrase(flags) {
  return flags.passphrase || process.env.KVDF_OWNER_PASSPHRASE || "";
}

function createOwnerAuth(ownerId, passphrase) {
  const crypto = require("crypto");
  const salt = crypto.randomBytes(16).toString("hex");
  return {
    configured: true,
    owner_id: ownerId,
    algorithm: "scrypt-sha256",
    salt,
    passphrase_hash: hashPassphrase(passphrase, salt),
    created_at: new Date().toISOString()
  };
}

function hashPassphrase(passphrase, salt) {
  const crypto = require("crypto");
  return crypto.scryptSync(passphrase, salt, 32).toString("hex");
}

function verifyPassphrase(passphrase, auth) {
  const crypto = require("crypto");
  const expected = Buffer.from(auth.passphrase_hash, "hex");
  const actual = Buffer.from(hashPassphrase(passphrase, auth.salt), "hex");
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function createOwnerSession(ownerId) {
  const now = Date.now();
  return {
    active: true,
    owner_id: ownerId,
    started_at: new Date(now).toISOString(),
    expires_at: new Date(now + 8 * 60 * 60 * 1000).toISOString()
  };
}

function isOwnerSessionActive(session) {
  return Boolean(session && session.active && session.expires_at && Date.parse(session.expires_at) > Date.now());
}

function upsertOwnerDeveloper(ownerId, name) {
  const file = ".kabeeri/developers.json";
  const data = readJsonFile(file);
  data.developers = data.developers || [];
  const existing = data.developers.find((developer) => developer.id === ownerId);
  if (existing) {
    existing.role = "Owner";
    existing.display_name = existing.display_name || name;
    existing.status = "active";
  } else {
    data.developers.push({
      id: ownerId,
      type: "human",
      display_name: name,
      role: "Owner",
      workstreams: [],
      status: "active",
      created_at: new Date().toISOString()
    });
  }
  writeJsonFile(file, data);
}

module.exports = {
  owner,
  isOwnerSessionActive
};
