import { createSignal, For, Show } from "solid-js";
import { getSnap, saveSnap, deleteSnap } from "./Db.js";
import { extractUser, toSnapEntry, displayName } from "./memberUtils.js";
import { getRawMembers, getTotalMemberCount } from "./index.jsx";

const {
  plugin: { store },
  flux: { stores, dispatcher },
  ui: { TextBox },
} = shelter;

function getGuildName(guildId) {
  try { return stores.GuildStore?.getGuild(guildId)?.name ?? null; }
  catch { return null; }
}

function formatTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

const btn = (color, extra = {}) => ({
  background: color, color: "#fff", border: "none", "border-radius": "4px",
  padding: "6px 12px", cursor: "pointer", "font-size": "14px", "white-space": "nowrap",
  ...extra,
});

function fetchMembersViaChunks(guildId, onProgress) {
  return new Promise(resolve => {
    const collected = {};
    let expected = null;
    let received = 0;
    let done     = false;

    const finish = (complete) => {
      if (done) return;
      done = true;
      clearTimeout(timer);
      dispatcher.unsubscribe("GUILD_MEMBERS_CHUNK", handler);
      resolve({ members: collected, complete, count: Object.keys(collected).length });
    };

    const handler = ({ guildId: g, members, chunkIndex, chunkCount }) => {
      if (g !== guildId) return;
      if (expected === null) expected = chunkCount;
      received++;
      for (const member of members) {
        const u = extractUser(member);
        if (!u) continue;
        collected[u.id] = toSnapEntry(u);
      }
      onProgress?.(`Receiving… chunk ${received}/${expected} (${Object.keys(collected).length} members)`);
      if (received >= expected) finish(true);
    };

    dispatcher.subscribe("GUILD_MEMBERS_CHUNK", handler);
    try {
      dispatcher.dispatch({
        type: "GUILD_MEMBERS_REQUEST", guildIds: [guildId],
        query: "", limit: 0, presences: false,
      });
    } catch {}

    const timer = setTimeout(() => finish(false), 15_000);
  });
}

export function MainPanel() {
  const [tab, setTab] = createSignal("servers");

  const [guilds, setGuilds]         = createSignal([...(store.watchedGuilds ?? [])]);
  const [input, setInput]           = createSignal("");
  const [error, setError]           = createSignal("");
  const [checkState, setCheck]      = createSignal({});
  const [snapCounts, setSnapCounts] = createSignal({});
  const [expanded, setExpanded]     = createSignal(null);
  const [memberList, setMemberList] = createSignal({});

  const [history, setHistory] = createSignal([...(store.leaveHistory ?? [])]);

  guilds().forEach(id => {
    getSnap(id).then(snap => setSnapCounts(s => ({ ...s, [id]: Object.keys(snap).length })));
  });

  function add() {
    const id = input().trim();
    if (!id)                      return setError("Enter a server ID.");
    if (!/^\d{17,20}$/.test(id)) return setError("Invalid ID - must be 17-20 digits.");
    if (guilds().includes(id))   return setError("Already watching this server.");
    const next = [...guilds(), id];
    store.watchedGuilds = next;
    setGuilds(next);
    setInput("");
    setError("");
    getSnap(id).then(snap => setSnapCounts(s => ({ ...s, [id]: Object.keys(snap).length })));
  }

  function remove(id) {
    const next = guilds().filter(g => g !== id);
    store.watchedGuilds = next;

    deleteSnap(id);

    store.leaveHistory = (store.leaveHistory ?? []).filter(e => e.guildId !== id);

    setGuilds(next);
    setSnapCounts(s => { const n = { ...s }; delete n[id]; return n; });
    setCheck(s => { const n = { ...s }; delete n[id]; return n; });
    setMemberList(s => { const n = { ...s }; delete n[id]; return n; });
    if (expanded() === id) setExpanded(null);

    setHistory([...(store.leaveHistory ?? [])]);
  }

  async function checkMembers(guildId) {
    if (checkState()[guildId]?.phase === "checking") return;
    setCheck(s => ({ ...s, [guildId]: { phase: "checking", progress: "Reading Discord cache…" } }));

    const raw  = getRawMembers(guildId);
    const snap = await getSnap(guildId);
    for (const member of Object.values(raw)) {
      const u = extractUser(member);
      if (!u) continue;
      snap[u.id] = toSnapEntry(u);
    }
    await saveSnap(guildId, snap);
    setSnapCounts(s => ({ ...s, [guildId]: Object.keys(snap).length }));
    setCheck(s => ({ ...s, [guildId]: {
      phase: "checking",
      progress: `Cache: ${Object.keys(snap).length} members. Requesting full list from gateway…`,
    }}));

    const { members: chunkMembers, complete, count: chunkCount } =
      await fetchMembersViaChunks(guildId, msg => {
        setCheck(s => ({ ...s, [guildId]: { phase: "checking", progress: msg } }));
      });

    if (chunkCount > 0) {
      const finalSnap = await getSnap(guildId);
      for (const [uid, entry] of Object.entries(chunkMembers)) finalSnap[uid] = entry;
      await saveSnap(guildId, finalSnap);
    }

    const finalSnap = await getSnap(guildId);
    const saved     = Object.keys(finalSnap).length;
    const total     = getTotalMemberCount(guildId);
    setSnapCounts(s => ({ ...s, [guildId]: saved }));
    setCheck(s => ({ ...s, [guildId]: {
      phase: "done", complete,
      progress: complete
        ? `Done: ${saved} members saved${total > 0 ? ` / ${total} total` : ""}.`
        : `Gateway didn't respond. Saved ${saved} from cache${total > 0 ? ` / ${total} total` : ""}. Browse the server to load more.`,
    }}));

    if (expanded() === guildId) await loadMemberList(guildId);
  }

  async function loadMemberList(guildId) {
    const snap    = await getSnap(guildId);
    const entries = Object.entries(snap)
      .map(([uid, info]) => ({ uid, name: info.globalName || info.username || "unknown", ...info }))
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    setMemberList(s => ({ ...s, [guildId]: entries }));
  }

  async function toggleMemberList(guildId) {
    if (expanded() === guildId) {
      setExpanded(null);
    } else {
      setExpanded(guildId);
      await loadMemberList(guildId);
    }
  }

  function clearLog() {
    store.leaveHistory = [];
    setHistory([]);
  }

  const tabBtn = (key, label) => (
    <button
      style={{
        padding: "6px 16px", "border-radius": "4px", border: "none", cursor: "pointer",
        "font-size": "14px",
        "font-weight": tab() === key ? "700" : "400",
        background: tab() === key ? "var(--brand-experiment)" : "var(--background-secondary)",
        color: tab() === key ? "#fff" : "var(--text-muted)",
      }}
      onClick={() => { setTab(key); if (key === "log") setHistory([...(store.leaveHistory ?? [])]); }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: "0 0 16px 0" }}>
      <span style={{ color: "var(--header-primary)", "font-size": "20px", "font-weight": "700" }}>
        ServerSentinel
      </span>

      <div style={{ display: "flex", gap: "6px", margin: "12px 0 16px" }}>
        {tabBtn("servers", "Watched Servers")}
        {tabBtn("log", "Leave Log" + (store.leaveHistory?.length ? ` (${store.leaveHistory.length})` : ""))}
      </div>

      {/* ── SERVERS TAB ── */}
      <Show when={tab() === "servers"}>
        <div style={{ display: "flex", gap: "8px", "margin-bottom": "8px" }}>
          <TextBox
            value={input()}
            onInput={v => { setInput(v); setError(""); }}
            onKeyDown={e => e.key === "Enter" && add()}
            placeholder="Server ID..."
          />
          <button style={btn("var(--button-positive-background)")} onClick={add}>Add</button>
        </div>

        <Show when={error()}>
          <p style={{ color: "var(--status-danger)", "font-size": "13px", margin: "0 0 8px" }}>{error()}</p>
        </Show>

        <Show when={guilds().length === 0}>
          <p style={{ color: "var(--text-muted)" }}>No servers added yet.</p>
        </Show>

        <For each={guilds()}>
          {id => {
            const cs         = () => checkState()[id];
            const count      = () => snapCounts()[id] ?? 0;
            const total      = () => getTotalMemberCount(id);
            const incomplete = () => total() > 0 && count() < total();
            const isExpanded = () => expanded() === id;
            const members    = () => memberList()[id] ?? [];

            return (
              <div style={{ "margin-bottom": "6px", background: "var(--background-secondary)", "border-radius": "6px", overflow: "hidden" }}>
                {/* Main row */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", gap: "8px" }}>
                    <div style={{ "min-width": 0 }}>
                      <span style={{ color: "var(--header-primary)", "font-weight": "600" }}>
                        {getGuildName(id) ?? "Unknown Server"}
                      </span>
                      <span style={{ color: "var(--text-muted)", "font-size": "12px", "margin-left": "8px" }}>{id}</span>
                    </div>
                    <div style={{ display: "flex", gap: "6px", "flex-shrink": "0" }}>
                      <button
                        style={btn("var(--button-secondary-background)", { opacity: cs()?.phase === "checking" ? "0.6" : "1" })}
                        onClick={() => checkMembers(id)}
                      >
                        {cs()?.phase === "checking" ? "Checking…" : "Check Members"}
                      </button>
                      <button style={btn("var(--button-danger-background)")} onClick={() => remove(id)}>
                        Remove
                      </button>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div style={{ "margin-top": "6px", "font-size": "12px", color: "var(--text-muted)", display: "flex", gap: "12px", "flex-wrap": "wrap", "align-items": "center" }}>
                    <span>
                      Snapshot:{" "}
                      <strong style={{ color: incomplete() ? "var(--text-warning)" : "var(--text-positive)" }}>
                        {count()}
                      </strong>
                      <Show when={total() > 0}> / {total()} on server</Show>
                    </span>
                    <Show when={incomplete() && !cs()}>
                      <span style={{ color: "var(--text-warning)", "font-size": "11px" }}>
                        Incomplete - click Check Members
                      </span>
                    </Show>
                    <Show when={count() > 0}>
                      <button
                        onClick={() => toggleMemberList(id)}
                        style={{
                          background: "none", border: "none", cursor: "pointer",
                          color: "var(--text-link)", "font-size": "12px", padding: "0",
                        }}
                      >
                        {isExpanded() ? "Hide members" : `Show all ${count()} members`}
                      </button>
                    </Show>
                  </div>

                  {/* Check progress */}
                  <Show when={cs()?.progress}>
                    <p style={{
                      "font-size": "12px", "margin-top": "6px", "margin-bottom": 0,
                      color: cs()?.phase === "done"
                        ? (cs()?.complete ? "var(--text-positive)" : "var(--text-warning)")
                        : "var(--text-muted)",
                    }}>
                      {cs().progress}
                    </p>
                  </Show>
                </div>

                {/* Member list (expandable) */}
                <Show when={isExpanded()}>
                  <div style={{
                    "border-top": "1px solid var(--background-modifier-accent)",
                    "max-height": "280px",
                    "overflow-y": "auto",
                  }}>
                    <Show when={members().length === 0}>
                      <p style={{ color: "var(--text-muted)", padding: "10px 12px", margin: 0 }}>
                        No members in snapshot yet.
                      </p>
                    </Show>
                    <For each={members()}>
                      {entry => (
                        <div style={{
                          display: "flex",
                          "justify-content": "space-between",
                          "align-items": "center",
                          padding: "5px 12px",
                          "border-bottom": "1px solid var(--background-modifier-accent)",
                          "font-size": "13px",
                        }}>
                          <span style={{ color: "var(--header-primary)" }}>
                            {entry.name}
                            <Show when={entry.username && entry.globalName && entry.username !== entry.globalName}>
                              <span style={{ color: "var(--text-muted)", "margin-left": "6px", "font-size": "11px" }}>
                                @{entry.username}
                              </span>
                            </Show>
                          </span>
                          <span style={{
                            color: "var(--text-muted)", "font-size": "11px",
                            "font-family": "monospace", "flex-shrink": 0, "margin-left": "12px",
                          }}>
                            {entry.uid}
                          </span>
                        </div>
                      )}
                    </For>
                  </div>
                </Show>
              </div>
            );
          }}
        </For>

        <Show when={guilds().length > 0}>
          <p style={{ color: "var(--text-muted)", "font-size": "12px", "margin-top": "10px" }}>
            Click "Check Members" after adding a server to build a snapshot. Snapshot data persists across Discord restarts. For servers with 150+ members Discord may not send the full list - browse channels to improve coverage.
          </p>
        </Show>
      </Show>

      {/* ── LEAVE LOG TAB ── */}
      <Show when={tab() === "log"}>
        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "12px" }}>
          <span style={{ color: "var(--text-muted)", "font-size": "13px" }}>
            {history().length} event{history().length !== 1 ? "s" : ""} recorded
          </span>
          <Show when={history().length > 0}>
            <button onClick={clearLog} style={btn("var(--button-danger-background)")}>Clear</button>
          </Show>
        </div>

        <Show when={history().length === 0}>
          <p style={{ color: "var(--text-muted)" }}>No leaves recorded yet.</p>
        </Show>

        <For each={history()}>
          {entry => {
            const name  = displayName(entry);
            const guild = (() => {
              try { return stores.GuildStore?.getGuild(entry.guildId)?.name ?? entry.guildName ?? entry.guildId; }
              catch { return entry.guildName ?? entry.guildId; }
            })();
            return (
              <div style={{
                padding: "8px 12px", "margin-bottom": "4px",
                background: "var(--background-secondary)", "border-radius": "6px",
                "border-left": "3px solid var(--status-danger)",
              }}>
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <span>
                    <span style={{ color: "var(--header-primary)", "font-weight": "600" }}>{name}</span>
                    <span style={{ color: "var(--text-muted)", "font-size": "12px", "margin-left": "6px" }}>({entry.userId})</span>
                  </span>
                  <span style={{ color: "var(--text-muted)", "font-size": "12px" }}>{formatTime(entry.timestamp)}</span>
                </div>
                <div style={{ color: "var(--text-muted)", "font-size": "13px", "margin-top": "2px" }}>
                  Left {guild}
                </div>
              </div>
            );
          }}
        </For>
      </Show>
    </div>
  );
}

export default MainPanel;