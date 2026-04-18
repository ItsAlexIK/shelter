import { createSignal, createMemo, For, Show } from "solid-js";

const {
  plugin: { store },
  flux: { stores, dispatcher },
} = shelter;

function formatTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function getGuildName(guildId) {
  try { return stores.GuildStore?.getGuild(guildId)?.name ?? null; }
  catch { return null; }
}

function openProfile(userId, guildId) {
  try {
    dispatcher.dispatch({ type: "USER_PROFILE_MODAL_OPEN", userId, guildId });
  } catch {}
}

export function LeaveLog() {
  const [history, setHistory] = createSignal([...(store.leaveHistory ?? [])]);
  const [search, setSearch]   = createSignal("");
  const [guild, setGuild]     = createSignal("all");

  const guildOptions = createMemo(() => {
    const seen = new Map();
    for (const e of history()) {
      if (!seen.has(e.guildId)) {
        seen.set(e.guildId, getGuildName(e.guildId) ?? e.guildName ?? e.guildId);
      }
    }
    return [...seen.entries()];
  });

  const filtered = createMemo(() => {
    const q = search().trim().toLowerCase();
    const g = guild();
    return history().filter(e => {
      if (g !== "all" && e.guildId !== g) return false;
      if (!q) return true;
      return (e.globalName || e.username || "").toLowerCase().includes(q) || e.userId.includes(q);
    });
  });

  function clear() {
    store.leaveHistory = [];
    setHistory([]);
  }

  const inputStyle = {
    background: "var(--input-background)",
    color: "var(--text-normal)",
    border: "1px solid var(--background-modifier-accent)",
    "border-radius": "4px",
    padding: "7px 10px",
    "font-size": "14px",
    width: "100%",
    "box-sizing": "border-box",
  };

  return (
    <div style={{ padding: "16px 0" }}>
      <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", "margin-bottom": "12px" }}>
        <span style={{ color: "var(--header-primary)", "font-size": "20px", "font-weight": "700" }}>
          Leave Log
        </span>
        <Show when={history().length > 0}>
          <button
            onClick={clear}
            style={{
              background: "var(--button-danger-background)", color: "#fff", border: "none",
              "border-radius": "4px", padding: "6px 12px", cursor: "pointer", "font-size": "14px",
            }}
          >
            Clear
          </button>
        </Show>
      </div>

      <Show when={history().length > 0}>
        {/* Search + guild filter */}
        <div style={{ display: "flex", gap: "8px", "margin-bottom": "10px" }}>
          <input
            type="text"
            value={search()}
            onInput={e => setSearch(e.target.value)}
            placeholder="Search by username or user ID…"
            style={{ ...inputStyle, flex: "1" }}
          />
          <Show when={guildOptions().length > 1}>
            <select
              value={guild()}
              onChange={e => setGuild(e.target.value)}
              style={{ ...inputStyle, flex: "0 0 auto", cursor: "pointer", "color-scheme": "dark" }}
            >
              <option value="all">All servers</option>
              <For each={guildOptions()}>
                {([guildId, name]) => <option value={guildId}>{name}</option>}
              </For>
            </select>
          </Show>
        </div>

        <div style={{ color: "var(--text-muted)", "font-size": "13px", "margin-bottom": "10px" }}>
          {filtered().length}{filtered().length !== history().length ? ` / ${history().length}` : ""} record{history().length !== 1 ? "s" : ""}
        </div>
      </Show>

      <Show when={history().length === 0}>
        <p style={{ color: "var(--text-muted)" }}>No leaves recorded yet.</p>
      </Show>

      <Show when={history().length > 0 && filtered().length === 0}>
        <p style={{ color: "var(--text-muted)" }}>No results match your search.</p>
      </Show>

      <For each={filtered()}>
        {entry => {
          const name  = entry.globalName || entry.username;
          const guild = getGuildName(entry.guildId) ?? entry.guildName ?? entry.guildId;
          return (
            <div
              onClick={() => openProfile(entry.userId, entry.guildId)}
              style={{
                padding: "8px 12px", "margin-bottom": "4px",
                background: "var(--background-secondary)", "border-radius": "6px",
                cursor: "pointer",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--background-modifier-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "var(--background-secondary)"}
            >
              <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                <span>
                  <span style={{ color: "var(--header-primary)", "font-weight": "600" }}>{name}</span>
                  <span style={{ color: "var(--text-muted)", "font-size": "12px", "margin-left": "6px" }}>
                    ({entry.userId})
                  </span>
                </span>
                <span style={{ color: "var(--text-muted)", "font-size": "12px" }}>
                  {formatTime(entry.timestamp)}
                </span>
              </div>
              <div style={{ color: "var(--text-muted)", "font-size": "13px", "margin-top": "2px" }}>
                Left {guild}{entry.offline ? " · detected offline" : ""}
              </div>
            </div>
          );
        }}
      </For>
    </div>
  );
}