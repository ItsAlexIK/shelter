const { flux: { stores } } = shelter;

function getUserFromStore(userId) {
  try { return stores.UserStore?.getUser(userId) ?? null; }
  catch { return null; }
}

export function extractUser(member) {
  if (!member) return null;
  if (typeof member === "string") return null;

  const userId = member.userId ?? member.id ?? member.user?.id;
  if (!userId) return null;

  const u = getUserFromStore(userId) ?? member.user ?? member;

  return {
    id:            userId,
    username:      u?.username      ?? u?.name        ?? "unknown",
    globalName:    u?.globalName    ?? u?.global_name ?? u?.displayName ?? null,
    discriminator: u?.discriminator ?? "0",
  };
}

export function toSnapEntry(u) {
  return {
    username:      u.username,
    globalName:    u.globalName,
    discriminator: u.discriminator,
  };
}

export function displayName(entry) {
  return entry?.globalName || entry?.username || "unknown";
}