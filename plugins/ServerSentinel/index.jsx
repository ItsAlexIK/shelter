import { MainPanel, ReloadModal } from "./settings.jsx";
import { getSnap, saveSnap } from "./Db.js";
import { extractUser, toSnapEntry } from "./memberUtils.js";

const {
  flux: { dispatcher, stores },
  plugin: { store },
  ui: { showToast },
  settings: { registerSection },
} = shelter;

const MAX_HISTORY     = 400;
const seenThisSession = new Map();

let unregMain    = null;
let toastStyleEl = null;

let reloadModalEl = null;

function showReloadModal() {
  if (reloadModalEl) return;
  reloadModalEl = <ReloadModal onClose={() => removeReloadModal()} />;
  document.body.appendChild(reloadModalEl);
}

function removeReloadModal() {
  reloadModalEl?.remove();
  reloadModalEl = null;
}

function bootstrapStore() {
  if (store.watchedGuilds   == null) store.watchedGuilds   = [];
  if (store.leaveHistory    == null) store.leaveHistory    = [];
  if (store.enabled         == null) store.enabled         = true;
  if (store.soundEnabled    == null) store.soundEnabled    = true;
  if (store.shownReloadHint == null) store.shownReloadHint = false;
  if (store.customSoundFile == null) store.customSoundFile = null;
}

function injectToastStyle() {
  toastStyleEl = document.createElement("style");
  toastStyleEl.id = "sentinel-toast-style";
  toastStyleEl.textContent = `
    [class*="_toast_"][class*="_info_"] {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
    [class*="_toast_"][class*="_info_"] > div > span[class*="_text_"] {
      padding: 0 !important;
    }
  `;
  document.head.appendChild(toastStyleEl);
}

function removeToastStyle() {
  toastStyleEl?.remove();
  toastStyleEl = null;
}

function markSeen(guildId, userId) {
  if (!seenThisSession.has(guildId)) seenThisSession.set(guildId, new Set());
  seenThisSession.get(guildId).add(userId);
}

function wasSeen(guildId, userId) {
  return seenThisSession.get(guildId)?.has(userId) ?? false;
}

function getGuildName(guildId) {
  try { return stores.GuildStore?.getGuild(guildId)?.name ?? guildId; }
  catch { return guildId; }
}

function getUserFromStore(userId) {
  try { return stores.UserStore?.getUser(userId) ?? null; }
  catch { return null; }
}

export function getRawMembers(guildId) {
  try { return stores.GuildMemberStore?.getMembers(guildId) ?? {}; }
  catch { return {}; }
}

export function getTotalMemberCount(guildId) {
  try {
    const g = stores.GuildStore?.getGuild(guildId);
    return g?.memberCount ?? g?.member_count ?? g?.approximateMemberCount ?? 0;
  } catch { return 0; }
}

export function extractCacheMembers(guildId) {
  const raw    = getRawMembers(guildId);
  const result = {};
  for (const member of Object.values(raw)) {
    const u = extractUser(member);
    if (!u) continue;
    result[u.id] = toSnapEntry(u);
    markSeen(guildId, u.id);
  }
  return result;
}

function getAvatarUrl(userId, avatarHash) {
  if (avatarHash) {
    const ext = avatarHash.startsWith("a_") ? "gif" : "webp";
    return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`;
  }
  const index = Number(BigInt(userId) % 6n);
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function makeToastContent(entry) {
  const name      = entry.globalName || entry.username || "Unknown";
  const handle    = entry.username && entry.username !== "unknown" ? entry.username : null;
  const avatarUrl = getAvatarUrl(entry.userId, entry.avatar ?? null);

  return (
    <div style={{
      background: "#111214",
      border: "1px solid #2e2f33",
      "border-radius": "10px",
      overflow: "hidden",
      width: "260px",
    }}>
      <div style={{
        padding: "13px 15px",
        display: "flex",
        "align-items": "center",
        gap: "11px",
        "border-bottom": "1px solid #1e1f22",
      }}>
        <img src={avatarUrl} style={{
          width: "40px",
          height: "40px",
          "border-radius": "50%",
          "object-fit": "cover",
          display: "block",
          "flex-shrink": "0",
        }} />
        <div style={{ "min-width": "0" }}>
          <div style={{
            "font-size": "14px",
            "font-weight": "600",
            color: "#dbdee1",
            "white-space": "nowrap",
            overflow: "hidden",
            "text-overflow": "ellipsis",
          }}>{name}</div>
          <div style={{ "font-size": "12px", color: "#6d6f78" }}>{handle ? `@${handle}` : ""}</div>
        </div>
      </div>
      <div style={{ padding: "9px 15px", display: "flex", "flex-direction": "column", gap: "6px" }}>
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
          <span style={{ "font-size": "10px", color: "#4e5058", "text-transform": "uppercase", "letter-spacing": ".5px" }}>Server</span>
          <span style={{ "font-size": "12px", color: "#b5bac1" }}>{entry.guildName}</span>
        </div>
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
          <span style={{ "font-size": "10px", color: "#4e5058", "text-transform": "uppercase", "letter-spacing": ".5px" }}>User ID</span>
          <span style={{ "font-size": "10px", color: "#4e5058", "font-family": "monospace" }}>{entry.userId}</span>
        </div>
      </div>
    </div>
  );
}

function playNotificationSound() {
  if (store.customSoundFile) {
    try {
      const audio = new Audio(store.customSoundFile);
      audio.volume = 1;
      audio.play().catch(e => {
        console.error("Failed to play custom sound, falling back to beep:", e);
      });
      return;
    } catch (e) {
      console.error("Failed to create audio element:", e);
    }
  }
}

export { playNotificationSound };

function recordLeave(entry) {
  store.leaveHistory = [entry, ...store.leaveHistory].slice(0, MAX_HISTORY);
  if (!store.enabled) return;
  if (store.soundEnabled) playNotificationSound();
  const close = showToast({
    content:  makeToastContent(entry),
    duration: 999_999_999,
    onClick() { close(); },
  });
}

function onGuildMembersChunk({ guildId, members }) {
  if (!store.watchedGuilds.includes(guildId)) return;
  if (!Array.isArray(members)) return;
  getSnap(guildId).then(snap => {
    let changed = false;
    for (const member of members) {
      const u = extractUser(member);
      if (!u) continue;
      const fromStore = getUserFromStore(u.id);
      snap[u.id] = { ...toSnapEntry(u), avatar: fromStore?.avatar ?? null };
      markSeen(guildId, u.id);
      changed = true;
    }
    if (changed) saveSnap(guildId, snap);
  });
}

function onMemberRemove({ guildId, user }) {
  if (!user?.id || !guildId) return;
  if (!store.watchedGuilds.includes(guildId)) return;
  if (!wasSeen(guildId, user.id)) return;

  seenThisSession.get(guildId)?.delete(user.id);

  getSnap(guildId).then(snap => {
    const snapEntry = snap[user.id] ?? null;

    if (snapEntry) {
      delete snap[user.id];
      saveSnap(guildId, snap);
    }

    if (!store.enabled) return;

    const fromStore     = getUserFromStore(user.id);
    const username      = fromStore?.username      ?? user.username     ?? snapEntry?.username      ?? "unknown";
    const globalName    = fromStore?.globalName    ?? fromStore?.global_name
                       ?? user.global_name         ?? user.globalName
                       ?? snapEntry?.globalName    ?? null;
    const discriminator = fromStore?.discriminator ?? user.discriminator ?? snapEntry?.discriminator ?? "0";
    const avatar        = fromStore?.avatar        ?? user.avatar        ?? snapEntry?.avatar        ?? null;

    recordLeave({
      guildId,
      guildName: getGuildName(guildId),
      userId: user.id,
      username,
      globalName,
      discriminator,
      avatar,
      timestamp: Date.now(),
    });
  });
}

function onMemberAdd({ guildId, member }) {
  if (!store.watchedGuilds.includes(guildId)) return;
  const u = extractUser(member);
  if (!u) return;
  markSeen(guildId, u.id);
  const fromStore = getUserFromStore(u.id);
  getSnap(guildId).then(snap => {
    snap[u.id] = { ...toSnapEntry(u), avatar: fromStore?.avatar ?? null };
    saveSnap(guildId, snap);
  });
}

function onMemberListUpdate({ guildId, ops }) {
  if (!store.watchedGuilds.includes(guildId)) return;
  if (!Array.isArray(ops)) return;
  getSnap(guildId).then(snap => {
    let changed = false;
    for (const op of ops) {
      const items = op.items ?? (op.item ? [op.item] : []);
      for (const item of items) {
        const u = extractUser(item?.member ?? item);
        if (!u) continue;
        markSeen(guildId, u.id);
        const fromStore = getUserFromStore(u.id);
        snap[u.id] = { ...toSnapEntry(u), avatar: fromStore?.avatar ?? null };
        changed = true;
      }
    }
    if (changed) saveSnap(guildId, snap);
  });
}

function onConnectionOpen() {
  for (const guildId of store.watchedGuilds) {
    getSnap(guildId).then(snap => {
      for (const uid of Object.keys(snap)) markSeen(guildId, uid);
    });
    for (const m of Object.values(getRawMembers(guildId))) {
      const u = extractUser(m);
      if (u) markSeen(guildId, u.id);
    }
  }
}

export function onLoad() {
  bootstrapStore();
  seenThisSession.clear();
  injectToastStyle();

  if (!store.shownReloadHint) {
    store.shownReloadHint = true;
    showReloadModal();
  }

  for (const guildId of store.watchedGuilds) {
    getSnap(guildId).then(snap => {
      for (const uid of Object.keys(snap)) markSeen(guildId, uid);
    });
    for (const m of Object.values(getRawMembers(guildId))) {
      const u = extractUser(m);
      if (u) markSeen(guildId, u.id);
    }
  }

  dispatcher.subscribe("CONNECTION_OPEN",          onConnectionOpen);
  dispatcher.subscribe("GUILD_MEMBER_REMOVE",      onMemberRemove);
  dispatcher.subscribe("GUILD_MEMBER_ADD",         onMemberAdd);
  dispatcher.subscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
  dispatcher.subscribe("GUILD_MEMBERS_CHUNK",      onGuildMembersChunk);

  unregMain = registerSection("section", "sentinel-main", "ServerSentinel", MainPanel);
}

export function onUnload() {
  seenThisSession.clear();
  removeToastStyle();
  removeReloadModal();

  dispatcher.unsubscribe("CONNECTION_OPEN",          onConnectionOpen);
  dispatcher.unsubscribe("GUILD_MEMBER_REMOVE",      onMemberRemove);
  dispatcher.unsubscribe("GUILD_MEMBER_ADD",         onMemberAdd);
  dispatcher.unsubscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
  dispatcher.unsubscribe("GUILD_MEMBERS_CHUNK",      onGuildMembersChunk);

  unregMain?.();
}