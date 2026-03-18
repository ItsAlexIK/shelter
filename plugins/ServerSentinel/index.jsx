import Settings from "./settings.jsx";
import { LeaveLog } from "./LeaveLog.jsx";

const {
  flux: { dispatcher, stores },
  plugin: { store },
  ui: { showToast },
  settings: { registerSection },
} = shelter;

const MAX_HISTORY = 200;
let diffDone = false;
let unregisterSection = null;

function safeGet(key) {
  try { return store[key]; } catch { return undefined; }
}

function bootstrapStore() {
  if (safeGet("watchedGuilds") == null) store.watchedGuilds = [];
  if (safeGet("leaveHistory")  == null) store.leaveHistory  = [];
  if (safeGet("enabled")       == null) store.enabled       = true;
  if (safeGet("snapshots")     == null) store.snapshots     = "{}";
}

function readSnapshots() {
  try { return JSON.parse(store.snapshots || "{}"); } catch { return {}; }
}

function saveSnapshots(data) {
  const json = JSON.stringify(data);
  setTimeout(() => { store.snapshots = json; }, 0);
}

function getGuildName(guildId) {
  try { return stores.GuildStore?.getGuild(guildId)?.name ?? null; }
  catch { return null; }
}

function getLoadedMembers(guildId) {
  try { return stores.GuildMemberStore?.getMembers(guildId) ?? {}; }
  catch { return {}; }
}

function snapshotGuild(guildId, data) {
  const loaded = getLoadedMembers(guildId);
  if (!data[guildId]) data[guildId] = {};
  for (const [, member] of Object.entries(loaded)) {
    const user = member?.user;
    if (!user?.id) continue;
    data[guildId][user.id] = {
      username:      user.username      ?? "unknown",
      globalName:    user.global_name   ?? user.globalName ?? null,
      discriminator: user.discriminator ?? "0",
    };
  }
}

function recordLeave(entry) {
  setTimeout(() => {
    store.leaveHistory = [entry, ...store.leaveHistory].slice(0, MAX_HISTORY);
  }, 0);

  const name = entry.globalName || entry.username;
  const close = showToast({
    title: entry.offline ? "Member Left While Offline" : "Member Left",
    content: `${name} (${entry.userId}) left ${entry.guildName}`,
    duration: 999_999_999,
    onClick() { close(); },
  });
}

function runOfflineDiff() {
  if (diffDone) return;
  diffDone = true;

  const data = readSnapshots();

  for (const guildId of store.watchedGuilds) {
    const snapshot = data[guildId];
    const loaded    = getLoadedMembers(guildId);
    const loadedIds = new Set(Object.keys(loaded));

    if (!snapshot || Object.keys(snapshot).length === 0) {
      snapshotGuild(guildId, data);
      continue;
    }

    for (const [userId, info] of Object.entries(snapshot)) {
      if (loadedIds.has(userId)) continue;
      recordLeave({
        guildId,
        guildName:     getGuildName(guildId) ?? guildId,
        userId,
        username:      info.username,
        globalName:    info.globalName,
        discriminator: info.discriminator,
        timestamp:     Date.now(),
        offline:       true,
      });
      delete data[guildId][userId];
    }

    snapshotGuild(guildId, data);
  }

  saveSnapshots(data);
}

function onMemberRemove({ guildId, user }) {
  if (!user?.id || !guildId) return;
  if (!store.watchedGuilds.includes(guildId)) return;

  const data = readSnapshots();
  if (data[guildId]?.[user.id]) {
    delete data[guildId][user.id];
    saveSnapshots(data);
  }

  if (!store.enabled) return;

  recordLeave({
    guildId,
    guildName:     getGuildName(guildId) ?? guildId,
    userId:        user.id,
    username:      user.username,
    globalName:    user.global_name ?? user.globalName ?? null,
    discriminator: user.discriminator ?? "0",
    timestamp:     Date.now(),
    offline:       false,
  });
}

function onConnectionOpen() {
  if (diffDone) return;
  setTimeout(() => {
    if (!store.enabled) return;
    if (!store.watchedGuilds?.length) return;
    runOfflineDiff();
  }, 6_000);
}

export function onLoad() {
  bootstrapStore();
  diffDone = false;
  dispatcher.subscribe("CONNECTION_OPEN",     onConnectionOpen);
  dispatcher.subscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
  unregisterSection = registerSection("section", "sentinel-leaves", "Leave Log", LeaveLog);
}

export function onUnload() {
  diffDone = false;
  dispatcher.unsubscribe("CONNECTION_OPEN",     onConnectionOpen);
  dispatcher.unsubscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
  unregisterSection?.();
}

export { Settings as settings };