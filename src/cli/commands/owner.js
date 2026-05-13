const { ensureWorkspace, readJsonFile, writeJsonFile } = require("../workspace");
const { fileExists } = require("../fs_utils");
const { table } = require("../ui");

function owner(action, value, flags = {}, deps = {}) {
  const { appendAudit, ensureNoOtherOwner } = deps;
  ensureWorkspace();

  if (action === "transfer") {
    return ownerTransfer(value, flags, deps);
  }

  if (action === "docs") {
    return ownerDocs(value, flags, deps);
  }

  if (action === "session") {
    return ownerSession(value, flags, deps);
  }

  if (!action || action === "status") {
    const auth = readJsonFile(".kabeeri/owner_auth.json");
    const session = sweepOwnerSessionState(readJsonFile(".kabeeri/session.json"));
    const docsState = sweepOwnerDocsState(readOwnerDocsState());
    const active = isOwnerSessionActive(session);
    const activeDocsToken = docsState.tokens.find((item) => item.status === "active");
    console.log(table(["Field", "Value"], [
      ["Auth configured", auth.configured ? "yes" : "no"],
      ["Owner ID", auth.owner_id || ""],
      ["Session active", active ? "yes" : "no"],
      ["Session expires", session.expires_at || ""],
      ["Owner docs token active", activeDocsToken ? "yes" : "no"],
      ["Owner docs token expires", activeDocsToken ? activeDocsToken.expires_at || "" : ""]
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
    closeOwnerSession(session, "logout");
    closeOwnerDocsTokens("owner session closed");
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
    const report = {
      report_type: "owner_transfer_token_status",
      tokens: data.tokens.map((token) => ({
        token_id: token.token_id,
        from_owner_id: token.from_owner_id,
        to_owner_id: token.to_owner_id,
        status: token.status,
        issued_at: token.issued_at || token.created_at || null,
        accepted_at: token.accepted_at || null,
        used_at: token.used_at || null,
        revoked_at: token.revoked_at || null,
        transfer_path: token.transfer_path || token.status || null,
        usage_count: token.usage_count || 0,
        max_usage: token.max_usage || 1
      }))
    };
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    console.log(table(["Token", "From", "To", "Status", "Issued", "Used"], data.tokens.map((token) => [
      token.token_id,
      token.from_owner_id,
      token.to_owner_id,
      token.status,
      token.issued_at || token.created_at || "",
      token.used_at || ""
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
      issued_by: auth.owner_id,
      to_owner_id: toOwnerId,
      to_owner_name: flags.name || toOwnerId,
      old_owner_downgrade_to: flags.downgrade || "Maintainer",
      status: "issued",
      issued_at: new Date().toISOString(),
      usage_count: 0,
      max_usage: 1,
      token_hash: hashTransferToken(transferCode),
      created_at: new Date().toISOString(),
      expires_at: expiresAt,
      transfer_path: "issued"
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
    token.accepted_by = token.to_owner_id;
    token.accepted_at = new Date().toISOString();
    token.used_at = new Date().toISOString();
    token.usage_count = Number(token.usage_count || 0) + 1;
    token.transfer_path = "completed";
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
    token.revoked_by = readJsonFile(".kabeeri/owner_auth.json").owner_id || "owner";
    token.revoked_at = new Date().toISOString();
    token.transfer_path = "revoked";
    writeJsonFile(file, data);
    appendAudit("owner_transfer.revoked", "owner_transfer", tokenId, "Owner transfer token revoked");
    console.log(`Revoked owner transfer token ${tokenId}`);
    return;
  }

  throw new Error(`Unknown owner transfer action: ${action}`);
}

function ownerDocs(action, flags = {}, deps = {}) {
  const { appendAudit, requireOwnerAuthority, isExpired } = deps;
  const session = sweepOwnerSessionState(readJsonFile(".kabeeri/session.json"));
  if (!isOwnerSessionActive(session)) {
    throw new Error("Owner session is not active. Run `kvdf owner login` first.");
  }
  requireOwnerAuthority(flags);

  const data = sweepOwnerDocsState(readOwnerDocsState());
  const currentOwnerId = session.owner_id || readJsonFile(".kabeeri/owner_auth.json").owner_id || "owner";

  if (!action || action === "status" || action === "list") {
    const report = {
      report_type: "owner_docs_token_status",
      owner_id: currentOwnerId,
      session_active: isOwnerSessionActive(session),
      active_tokens: data.tokens.filter((token) => token.status === "active").map((token) => ({
        token_id: token.token_id,
        status: token.status,
        created_at: token.created_at || null,
        expires_at: token.expires_at || null,
        token_last4: token.token_last4 || null
      })),
      tokens: data.tokens.map((token) => ({
        token_id: token.token_id,
        status: token.status,
        created_at: token.created_at || null,
        expires_at: token.expires_at || null,
        token_last4: token.token_last4 || null
      }))
    };
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    console.log(table(["Token", "Status", "Created", "Expires", "Last 4"], data.tokens.map((token) => [
      token.token_id,
      token.status,
      token.created_at || "",
      token.expires_at || "",
      token.token_last4 || ""
    ])));
    return;
  }

  if (action === "open") {
    const previousActive = data.tokens.filter((token) => token.status === "active");
    for (const token of previousActive) {
      token.status = "superseded";
      token.superseded_at = new Date().toISOString();
      token.superseded_reason = "owner_docs_reopened";
    }
    const token = generateMixedToken(50);
    const now = new Date();
    const record = {
      token_id: `owner-docs-${String(data.tokens.length + 1).padStart(3, "0")}`,
      owner_id: currentOwnerId,
      session_started_at: session.started_at || null,
      status: "active",
      token_hash: hashOwnerDocsToken(token),
      token_last4: token.slice(-4),
      created_at: now.toISOString(),
      expires_at: new Date(now.getTime() + 60 * 1000).toISOString(),
      closed_at: null,
      closed_reason: null
    };
    data.tokens.push(record);
    writeOwnerDocsState(data);
    if (appendAudit) appendAudit("owner_docs.open", "owner_docs", record.token_id, "Owner docs token opened");
    const report = {
      report_type: "owner_docs_token_opened",
      owner_id: record.owner_id,
      token_id: record.token_id,
      token,
      expires_at: record.expires_at,
      session_started_at: record.session_started_at
    };
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    console.log(table(["Field", "Value"], [
      ["Token ID", record.token_id],
      ["Owner ID", record.owner_id],
      ["Expires", record.expires_at],
      ["Token", token]
    ]));
    return;
  }

  if (action === "close") {
    closeOwnerDocsTokens(flags.reason || "manual_close");
    if (appendAudit) appendAudit("owner_docs.close", "owner_docs", currentOwnerId, "Owner docs token closed");
    if (flags.json) {
      console.log(JSON.stringify({
        report_type: "owner_docs_token_closed",
        owner_id: currentOwnerId,
        closed_at: new Date().toISOString(),
        reason: flags.reason || "manual_close"
      }, null, 2));
      return;
    }
    console.log("Owner docs token closed.");
    return;
  }

  if (action === "use" || action === "verify") {
    const provided = getOwnerDocsTokenValue(flags);
    if (!provided) throw new Error("Missing owner docs token.");
    const activeToken = data.tokens.find((token) => token.status === "active");
    if (!activeToken) throw new Error("No active owner docs token exists.");
    if (isExpired(activeToken.expires_at)) {
      activeToken.status = "expired";
      activeToken.expired_at = new Date().toISOString();
      writeOwnerDocsState(data);
      throw new Error("Owner docs token expired.");
    }
    if (activeToken.token_hash !== hashOwnerDocsToken(provided)) {
      throw new Error("Invalid owner docs token.");
    }
    if (flags.json) {
      console.log(JSON.stringify({
        report_type: "owner_docs_token_verified",
        token_id: activeToken.token_id,
        status: "verified",
        expires_at: activeToken.expires_at || null
      }, null, 2));
      return;
    }
    console.log(table(["Field", "Value"], [
      ["Token ID", activeToken.token_id],
      ["Status", "verified"],
      ["Expires", activeToken.expires_at || ""]
    ]));
    return;
  }

  throw new Error(`Unknown owner docs action: ${action}`);
}

function ownerSession(action, flags = {}, deps = {}) {
  const { appendAudit } = deps;
  const session = sweepOwnerSessionState(readJsonFile(".kabeeri/session.json"));
  const docsState = sweepOwnerDocsState(readOwnerDocsState());
  const activeDocsToken = docsState.tokens.find((token) => token.status === "active");

  if (!action || action === "status") {
    const report = {
      report_type: "owner_session_status",
      session_active: isOwnerSessionActive(session),
      owner_id: session.owner_id || null,
      started_at: session.started_at || null,
      expires_at: session.expires_at || null,
      docs_token_active: Boolean(activeDocsToken),
      docs_token_expires_at: activeDocsToken ? activeDocsToken.expires_at || null : null
    };
    if (flags.json) {
      console.log(JSON.stringify(report, null, 2));
      return;
    }
    console.log(table(["Field", "Value"], [
      ["Session active", isOwnerSessionActive(session) ? "yes" : "no"],
      ["Owner ID", session.owner_id || ""],
      ["Started", session.started_at || ""],
      ["Expires", session.expires_at || ""],
      ["Docs token active", activeDocsToken ? "yes" : "no"],
      ["Docs token expires", activeDocsToken ? activeDocsToken.expires_at || "" : ""]
    ]));
    return;
  }

  if (action === "close" || action === "logout") {
    closeOwnerSession(session, flags.reason || "owner_session_close");
    closeOwnerDocsTokens(flags.reason || "owner_session_closed");
    if (appendAudit) appendAudit("owner_session.closed", "owner", session.owner_id || "owner", "Owner session closed");
    if (flags.json) {
      console.log(JSON.stringify({
        report_type: "owner_session_closed",
        owner_id: session.owner_id || null,
        closed_at: new Date().toISOString(),
        reason: flags.reason || "owner_session_close"
      }, null, 2));
      return;
    }
    console.log("Owner session ended.");
    return;
  }

  throw new Error(`Unknown owner session action: ${action}`);
}

function createSecretToken() {
  const crypto = require("crypto");
  return crypto.randomBytes(24).toString("base64url");
}

function readOwnerDocsState() {
  const file = ".kabeeri/owner_docs_tokens.json";
  if (!fileExists(file)) writeJsonFile(file, { version: "v1", tokens: [], updated_at: null });
  const data = readJsonFile(file);
  data.tokens = Array.isArray(data.tokens) ? data.tokens : [];
  return data;
}

function writeOwnerDocsState(data) {
  data.version = data.version || "v1";
  data.tokens = Array.isArray(data.tokens) ? data.tokens : [];
  data.updated_at = new Date().toISOString();
  writeJsonFile(".kabeeri/owner_docs_tokens.json", data);
}

function sweepOwnerDocsState(data) {
  let changed = false;
  const now = Date.now();
  for (const token of data.tokens || []) {
    if (token.status === "active" && token.expires_at && Date.parse(token.expires_at) <= now) {
      token.status = "expired";
      token.expired_at = new Date().toISOString();
      changed = true;
    }
  }
  if (changed) writeOwnerDocsState(data);
  return data;
}

function closeOwnerDocsTokens(reason = "manual_close") {
  const data = readOwnerDocsState();
  const now = new Date().toISOString();
  let changed = false;
  for (const token of data.tokens || []) {
    if (token.status === "active") {
      token.status = "closed";
      token.closed_at = now;
      token.closed_reason = reason;
      changed = true;
    }
  }
  if (changed) writeOwnerDocsState(data);
  return data;
}

function sweepOwnerSessionState(session) {
  if (!session) return { active: false };
  if (session.active && session.expires_at && Date.parse(session.expires_at) <= Date.now()) {
    return closeOwnerSession(session, "expired");
  }
  return session;
}

function closeOwnerSession(session, reason = "manual_close") {
  const next = {
    active: false,
    owner_id: session.owner_id || null,
    started_at: session.started_at || null,
    expires_at: session.expires_at || null,
    closed_at: new Date().toISOString(),
    close_reason: reason
  };
  writeJsonFile(".kabeeri/session.json", next);
  closeOwnerDocsTokens(reason);
  return next;
}

function generateMixedToken(length) {
  const crypto = require("crypto");
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  while (true) {
    let token = "";
    while (token.length < length) {
      const bytes = crypto.randomBytes(length);
      for (const byte of bytes) {
        token += alphabet[byte % alphabet.length];
        if (token.length === length) break;
      }
    }
    if (/[A-Z]/.test(token) && /[a-z]/.test(token) && /[0-9]/.test(token)) return token;
  }
}

function hashOwnerDocsToken(token) {
  const crypto = require("crypto");
  return crypto.createHash("sha256").update(String(token)).digest("hex");
}

function getOwnerDocsTokenValue(flags) {
  return flags.token || flags.value || flags.code || flags["docs-token"] || "";
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
