import { createSignal, For, Show } from "solid-js";

const {
  plugin: { store },
  flux: { stores },
  ui: { TextBox },
} = shelter;

function getGuildName(guildId) {
  try { return stores.GuildStore?.getGuild(guildId)?.name ?? null; }
  catch { return null; }
}

const btn = (color) => ({
  background: color,
  color: "#fff",
  border: "none",
  "border-radius": "4px",
  padding: "6px 12px",
  cursor: "pointer",
  "font-size": "14px",
  "white-space": "nowrap",
});

export default () => {
  const [guilds, setGuilds] = createSignal([...(store.watchedGuilds ?? [])]);
  const [input, setInput]   = createSignal("");
  const [error, setError]   = createSignal("");

  function add() {
    const id = input().trim();
    if (!id) return setError("Enter a server ID.");
    if (!/^\d{17,20}$/.test(id)) return setError("Invalid ID — must be 17–20 digits.");
    if (guilds().includes(id)) return setError("Already watching this server.");
    const next = [...guilds(), id];
    store.watchedGuilds = next;
    setGuilds(next);
    setInput("");
    setError("");
  }

  function remove(id) {
    const next = guilds().filter(g => g !== id);
    store.watchedGuilds = next;
    try {
      const data = JSON.parse(store.snapshots || "{}");
      delete data[id];
      store.snapshots = JSON.stringify(data);
    } catch {}
    setGuilds(next);
  }

  return (
    <div style={{ padding: "16px 0" }}>
      <span style={{ color: "var(--header-primary)", "font-size": "20px", "font-weight": "700" }}>
        Watched Servers
      </span>
      <p style={{ color: "var(--text-muted)", "font-size": "13px", margin: "6px 0 12px" }}>
        Leave history is in the "Leave Log" section in the sidebar.
      </p>

      <div style={{ display: "flex", gap: "8px", "margin-bottom": "8px" }}>
        <TextBox
          value={input()}
          onInput={v => { setInput(v); setError(""); }}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Server ID…"
        />
        <button style={btn("var(--button-positive-background)")} onClick={add}>Add</button>
      </div>

      <Show when={error()}>
        <p style={{ color: "var(--status-danger)", "font-size": "13px", margin: "4px 0" }}>{error()}</p>
      </Show>

      <Show when={guilds().length === 0}>
        <p style={{ color: "var(--text-muted)" }}>No servers added yet.</p>
      </Show>

      <For each={guilds()}>
        {id => (
          <div style={{
            display: "flex",
            "align-items": "center",
            "justify-content": "space-between",
            padding: "8px 12px",
            "margin-bottom": "4px",
            background: "var(--background-secondary)",
            "border-radius": "6px",
          }}>
            <div>
              <span style={{ color: "var(--header-primary)", "font-weight": "600" }}>
                {getGuildName(id) ?? "Unknown Server"}
              </span>
              <span style={{ color: "var(--text-muted)", "font-size": "12px", "margin-left": "8px" }}>
                {id}
              </span>
            </div>
            <button style={btn("var(--button-danger-background)")} onClick={() => remove(id)}>Remove</button>
          </div>
        )}
      </For>
    </div>
  );
};