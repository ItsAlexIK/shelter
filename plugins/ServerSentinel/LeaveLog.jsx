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
  try { return stores.GuildStore?.getGuilds()?.[guildId]?.name ?? null; }
  catch { return null; }
}

function openProfile(userId, guildId) {
  try {
    dispatcher.dispatch({ type: "USER_PROFILE_MODAL_OPEN", userId, guildId });
  } catch {}
}

function DarkSelect({ value, onChange, options }) {
  const [open, setOpen] = createSignal(false);
  const selected = () => options.find(o => o.value === value()) ?? options[0];

  return (
    <div style={{ position: "relative", "flex-shrink": "0" }}>
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          background: "#1e1f22",
          color: "#dbdee1",
          border: "1px solid #3f4147",
          "border-radius": "4px",
          padding: "7px 28px 7px 10px",
          "font-size": "14px",
          cursor: "pointer",
          "white-space": "nowrap",
          "user-select": "none",
          position: "relative",
          "min-width": "120px",
        }}
      >
        {selected()?.label}
        <span style={{
          position: "absolute", right: "8px", top: "50%",
          transform: "translateY(-50%)",
          color: "#80848e", "font-size": "10px", "pointer-events": "none",
        }}>▼</span>
      </div>
      <Show when={open()}>
        <div
          style={{
            position: "absolute", top: "calc(100% + 4px)", right: "0",
            background: "#2b2d31",
            border: "1px solid #1e1f22",
            "border-radius": "6px",
            "box-shadow": "0 8px 24px rgba(0,0,0,0.6)",
            "z-index": "10000",
            "min-width": "100%",
            "max-height": "260px",
            "overflow-y": "auto",
          }}
        >
          <For each={options}>
            {opt => (
              <div
                onClick={() => { onChange(opt.value); setOpen(false); }}
                style={{
                  padding: "8px 12px",
                  "font-size": "14px",
                  color: opt.value === value() ? "#fff" : "#dbdee1",
                  background: opt.value === value() ? "var(--brand-experiment, #5865f2)" : "transparent",
                  cursor: "pointer",
                  "white-space": "nowrap",
                }}
                onMouseEnter={e => { if (opt.value !== value()) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                onMouseLeave={e => { if (opt.value !== value()) e.currentTarget.style.background = "transparent"; }}
              >{opt.label}</div>
            )}
          </For>
        </div>
        <div
          style={{ position: "fixed", inset: "0", "z-index": "9999" }}
          onClick={() => setOpen(false)}
        />
      </Show>
    </div>
  );
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
            <DarkSelect
              value={guild}
              onChange={v => setGuild(v)}
              options={[
                { value: "all", label: "All servers" },
                ...guildOptions().map(([guildId, name]) => ({ value: guildId, label: name })),
              ]}
            />
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