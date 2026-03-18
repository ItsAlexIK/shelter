import { createSignal, For, Show } from "solid-js";

const {
  plugin: { store },
  flux: { stores },
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

export function LeaveLog() {
  const [history, setHistory] = createSignal([...(store.leaveHistory ?? [])]);

  function clear() {
    store.leaveHistory = [];
    setHistory([]);
  }

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
              background: "var(--button-danger-background)",
              color: "#fff",
              border: "none",
              "border-radius": "4px",
              padding: "6px 12px",
              cursor: "pointer",
              "font-size": "14px",
            }}
          >
            Clear
          </button>
        </Show>
      </div>

      <Show when={history().length === 0}>
        <p style={{ color: "var(--text-muted)" }}>No leaves recorded yet.</p>
      </Show>

      <For each={history()}>
        {entry => {
          const name = entry.globalName || entry.username;
          const guild = getGuildName(entry.guildId) ?? entry.guildName ?? entry.guildId;
          return (
            <div style={{
              padding: "8px 12px",
              "margin-bottom": "4px",
              background: "var(--background-secondary)",
              "border-radius": "6px",
            }}>
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