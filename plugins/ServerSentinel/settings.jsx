import { createSignal, createMemo, For, Show } from "solid-js";
import { getSnap, saveSnap, deleteSnap } from "./Db.js";
import { extractUser, toSnapEntry, displayName } from "./memberUtils.js";
import { getRawMembers, getTotalMemberCount, playNotificationSound } from "./index.jsx";

const {
  plugin: { store },
  flux: { stores, dispatcher },
  ui: { TextBox },
} = shelter;

function getGuildName(guildId) {
  try { return stores.GuildStore?.getGuild(guildId)?.name ?? null; }
  catch { return null; }
}

function getGuildIcon(guildId) {
  try {
    const icon = stores.GuildStore?.getGuild(guildId)?.icon;
    if (!icon) return null;
    const ext = icon.startsWith("a_") ? "gif" : "webp";
    return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=32`;
  } catch { return null; }
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
        {/* Click-outside backdrop */}
        <div
          style={{ position: "fixed", inset: "0", "z-index": "9999" }}
          onClick={() => setOpen(false)}
        />
      </Show>
    </div>
  );
}

function getAllGuilds() {
  try {
    const guildsMap = stores.GuildStore?.getGuilds() ?? {};
    return Object.entries(guildsMap).map(([id, guild]) => ({
      ...guild,
      id: guild.id ?? id,
      name: guild.name ?? id,
    })).sort((a, b) =>
      (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" })
    );
  } catch { return []; }
}

function GuildPickerModal({ onAdd, alreadyWatched, onClose }) {
  const [search, setSearch] = createSignal("");

  const allGuilds = getAllGuilds();

  const filtered = createMemo(() => {
    const q = search().trim().toLowerCase();
    if (!q) return allGuilds;
    return allGuilds.filter(g =>
      g.name?.toLowerCase().includes(q) || g.id?.includes(q)
    );
  });

  function pickGuild(id) {
    if (alreadyWatched.includes(id)) return;
    onAdd(id);
    onClose();
  }

  const inputStyle = {
    background: "#1e1f22",
    color: "#dbdee1",
    border: "1px solid #3f4147",
    "border-radius": "6px",
    padding: "8px 11px",
    "font-size": "14px",
    width: "100%",
    "box-sizing": "border-box",
    outline: "none",
    "color-scheme": "dark",
  };

  return (
    <div
      style={{
        position: "fixed", inset: "0", "z-index": "9999",
        background: "rgba(0,0,0,0.7)",
        display: "flex", "align-items": "center", "justify-content": "center",
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{
        background: "#2b2d31",
        border: "1px solid #1e1f22",
        "border-radius": "10px",
        width: "420px",
        "max-width": "calc(100vw - 32px)",
        "max-height": "80vh",
        display: "flex",
        "flex-direction": "column",
        overflow: "hidden",
        "box-shadow": "0 8px 32px rgba(0,0,0,0.8)",
        "color-scheme": "dark",
      }}>
        {/* Header */}
        <div style={{
          padding: "14px 16px 12px",
          "border-bottom": "1px solid #1e1f22",
          display: "flex", "align-items": "center", "justify-content": "space-between",
          background: "#2b2d31",
        }}>
          <span style={{ color: "#f2f3f5", "font-size": "16px", "font-weight": "700" }}>
            Pick a Server
          </span>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              color: "#80848e", "font-size": "20px",
              "line-height": "1", padding: "0 2px",
            }}
          >×</button>
        </div>

        {/* Search */}
        <div style={{ padding: "10px 12px 6px", background: "#2b2d31" }}>
          <input
            type="text"
            value={search()}
            onInput={e => setSearch(e.target.value)}
            placeholder="Search by name or ID…"
            style={inputStyle}
            autofocus
          />
        </div>

        {/* Guild list */}
        <div style={{ "overflow-y": "auto", flex: "1", background: "#2b2d31" }}>
          <Show when={filtered().length === 0}>
            <p style={{ color: "#80848e", "font-size": "14px", padding: "12px 16px", margin: 0 }}>No servers found.</p>
          </Show>
          <For each={filtered()}>
            {guild => {
              const watched = alreadyWatched.includes(guild.id);
              const iconUrl = (() => {
                if (!guild.icon) return null;
                const ext = guild.icon.startsWith("a_") ? "gif" : "webp";
                return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=32`;
              })();
              return (
                <div
                  onClick={() => !watched && pickGuild(guild.id)}
                  style={{
                    display: "flex", "align-items": "center", gap: "10px",
                    padding: "8px 14px",
                    cursor: watched ? "default" : "pointer",
                    opacity: watched ? "0.45" : "1",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={e => { if (!watched) e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
                >
                  <Show
                    when={iconUrl}
                    fallback={
                      <div style={{
                        width: "36px", height: "36px", "border-radius": "50%",
                        background: "#3f4147",
                        display: "flex", "align-items": "center", "justify-content": "center",
                        "flex-shrink": "0", "font-size": "13px", color: "#80848e",
                        "font-weight": "600",
                      }}>
                        {guild.name?.[0]?.toUpperCase() ?? "?"}
                      </div>
                    }
                  >
                    <img
                      src={iconUrl}
                      style={{ width: "36px", height: "36px", "border-radius": "50%", "object-fit": "cover", "flex-shrink": "0" }}
                    />
                  </Show>
                  <div style={{ "min-width": 0 }}>
                    <div style={{
                      color: "#f2f3f5", "font-size": "14px", "font-weight": "600",
                      overflow: "hidden", "text-overflow": "ellipsis", "white-space": "nowrap",
                    }}>{guild.name}</div>
                    <div style={{ color: "#80848e", "font-size": "11px", "font-family": "monospace" }}>{guild.id}</div>
                  </div>
                  <Show when={watched}>
                    <span style={{ "margin-left": "auto", "font-size": "11px", color: "#80848e", "flex-shrink": "0" }}>Watching</span>
                  </Show>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
}

export function ReloadModal({ onClose }) {
  return (
  <div
    style={{
      position: "fixed", inset: "0", "z-index": "99999",
      display: "flex", "align-items": "center", "justify-content": "center",
      background: "rgba(0,0,0,0.4)",
      "backdrop-filter": "blur(10px)"
    }}
      onClick={e => e.target === e.currentTarget && onClose?.()}
    >
      <div style={{
        background: "#111214",
        border: "1px solid #2e2f33",
        "border-radius": "10px",
        overflow: "hidden",
        width: "520px",
        "box-shadow": "0 8px 24px rgba(0,0,0,0.6)",
      }}>
        {/* Header */}
        <div style={{
          padding: "18px 20px",
          "border-bottom": "1px solid #1e1f22",
        }}>
          <div style={{ "font-size": "17px", "font-weight": "700", color: "#dbdee1", "margin-bottom": "4px" }}>
            ServerSentinel enabled
          </div>
          <div style={{ "font-size": "13px", color: "#6d6f78" }}>One more step needed</div>
        </div>

        {/* Body */}
        <div style={{ padding: "16px 20px", display: "flex", "flex-direction": "column", gap: "14px" }}>
          <div style={{ "font-size": "14px", color: "#b5bac1", "line-height": "1.6" }}>
            Close and reopen <span style={{ color: "#dbdee1", "font-weight": "600" }}>Discord Settings</span> for the plugin to fully load.
          </div>

          <div style={{ display: "flex", "flex-direction": "column", gap: "8px" }}>
            {[
              "Close this Settings panel",
              "Reopen Discord Settings",
              "Navigate to ServerSentinel",
            ].map((label, i) => (
              <div style={{ display: "flex", "align-items": "center", gap: "10px" }}>
                <div style={{
                  width: "22px", height: "22px", "border-radius": "50%",
                  background: "#1e1f22", border: "1px solid #2e2f33",
                  display: "flex", "align-items": "center", "justify-content": "center",
                  "flex-shrink": "0", "font-size": "11px", "font-weight": "700",
                  color: "#6d6f78",
                }}>{i + 1}</div>
                <span style={{ "font-size": "14px", color: "#b5bac1" }}>{label}</span>
              </div>
            ))}
          </div>

          <div
            onClick={() => onClose?.()}
            style={{
              "padding-top": "12px",
              "text-align": "center", "font-size": "13px", "font-weight": "600",
              color: "#5865f2", cursor: "pointer",
              "border-top": "1px solid #1e1f22",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#7289da"}
            onMouseLeave={e => e.currentTarget.style.color = "#5865f2"}
          >Got it</div>
        </div>
      </div>
    </div>
  );
}
function formatTime(ts) {
  return new Date(ts).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function openProfile(userId, guildId) {
  try {
    dispatcher.dispatch({ type: "USER_PROFILE_MODAL_OPEN", userId, guildId });
  } catch {}
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

    const timer = setTimeout(() => finish(false), 5_000);
  });
}

export function MainPanel() {
  const [tab, setTab] = createSignal("servers");

  const [guilds, setGuilds]         = createSignal([...(store.watchedGuilds ?? [])]);
  const [showPicker, setShowPicker] = createSignal(false);
  const [input, setInput]           = createSignal("");
  const [error, setError]           = createSignal("");
  const [checkState, setCheck]      = createSignal({});
  const [snapCounts, setSnapCounts] = createSignal({});
  const [expanded, setExpanded]     = createSignal(null);
  const [memberList, setMemberList] = createSignal({});

  const [history, setHistory]   = createSignal([...(store.leaveHistory ?? [])]);
  const [logSearch, setLogSearch] = createSignal("");
  const [logGuild, setLogGuild]   = createSignal("all");
  const [soundFileName, setSoundFileName] = createSignal(
    store.customSoundFile ? "sound_uploaded.mp3" : "No file selected"
  );
  const [hasCustomSound, setHasCustomSound] = createSignal(!!store.customSoundFile);

  guilds().forEach(id => {
    getSnap(id).then(snap => setSnapCounts(s => ({ ...s, [id]: Object.keys(snap).length })));
  });

  const logGuildOptions = createMemo(() => {
    const seen = new Map();
    for (const e of history()) {
      if (!seen.has(e.guildId)) {
        seen.set(e.guildId, getGuildName(e.guildId) ?? e.guildName ?? e.guildId);
      }
    }
    return [...seen.entries()];
  });

  const filteredHistory = createMemo(() => {
    const q = logSearch().trim().toLowerCase();
    const g = logGuild();
    return history().filter(e => {
      if (g !== "all" && e.guildId !== g) return false;
      if (!q) return true;
      const name = (e.globalName || e.username || "").toLowerCase();
      const id   = e.userId;
      return name.includes(q) || id.includes(q);
    });
  });

  function add(id) {
    const guildId = (id ?? input()).trim();
    if (!guildId)                      return setError("Enter a server ID.");
    if (!/^\d{17,20}$/.test(guildId)) return setError("Invalid ID - must be 17-20 digits.");
    if (guilds().includes(guildId))   return setError("Already watching this server.");
    const next = [...guilds(), guildId];
    store.watchedGuilds = next;
    setGuilds(next);
    setInput("");
    setError("");
    getSnap(guildId).then(snap => setSnapCounts(s => ({ ...s, [guildId]: Object.keys(snap).length })));
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
      progress: `Cache: ${Object.keys(snap).length} members. Requesting available members…`,
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
        : `Saved ${saved} from cache${total > 0 ? ` / ${total} total` : ""}. Coverage grows passively as members become active.`,
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

  function handleSoundFileUpload(event) {
    const file = event.currentTarget?.files?.[0] || event.target?.files?.[0];
    if (!file) return;
    
    const isAudio = file.type.startsWith("audio/");
    const hasAudioExt = /\.(mp3|wav|ogg|webm|flac|aac|m4a)$/i.test(file.name);
    
    if (!isAudio && !hasAudioExt) {
      alert("Please upload an audio file (MP3, WAV, OGG, etc.)");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("File is too large. Maximum size is 5MB.");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const result = e.target?.result;
        if (typeof result === "string") {
          store.customSoundFile = result;
          setSoundFileName(file.name);
          setHasCustomSound(true);
        }
      } catch (err) {
        console.error("Error reading file:", err);
        alert("Failed to load sound file");
      }
    };
    reader.onerror = () => {
      alert("Failed to read file");
    };
    reader.readAsDataURL(file);
  }

  function clearSoundFile() {
    store.customSoundFile = null;
    setSoundFileName("No file selected");
    setHasCustomSound(false);
    const fileInput = document.getElementById("sound-file-input");
    if (fileInput) {
      fileInput.value = "";
    }
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
    <div style={{ padding: "0 0 5px 0" }}>
      <span style={{ color: "var(--header-primary)", "font-size": "20px", "font-weight": "700" }}>
        ServerSentinel
      </span>

      {/* Sound Settings Section */}
      <div style={{ 
        "margin": "12px 0 16px",
        "padding": "8px 10px",
        "background": "var(--background-secondary)",
        "border-radius": "4px",
        display: "flex",
        "align-items": "center",
        gap: "8px",
        "flex-wrap": "wrap"
      }}>
        <label style={{ "font-size": "12px", color: "var(--text-muted)", "white-space": "nowrap" }}>
          Leave sound:
        </label>
        
        <input
          id="sound-file-input"
          type="file"
          accept="audio/*,.mp3,.wav,.ogg,.webm,.flac,.aac,.m4a"
          onChange={(e) => handleSoundFileUpload(e)}
          style={{ display: "none" }}
        />
        
        <button
          style={{
            ...btn("var(--button-secondary-background)"),
            "padding": "4px 10px",
            "font-size": "12px",
            flex: "0 0 auto",
          }}
          onClick={() => document.getElementById("sound-file-input")?.click()}
          title="Max 5MB MP3 file"
        >
          {hasCustomSound() ? "Change" : "Upload"}
        </button>
        
        <Show when={hasCustomSound()}>
          <span style={{ "font-size": "12px", color: "var(--text-normal)", flex: "0 1 auto" }}>
            {soundFileName()}
          </span>
          <button
            style={{
              ...btn("var(--button-positive-background)"),
              "padding": "4px 8px",
              "font-size": "11px",
              flex: "0 0 auto",
            }}
            onClick={() => playNotificationSound()}
            title="Test the sound"
          >
            Test
          </button>
          <button
            style={{
              ...btn("var(--button-danger-background)"),
              "padding": "4px 8px",
              "font-size": "11px",
              flex: "0 0 auto",
            }}
            onClick={clearSoundFile}
            title="Remove custom sound"
          >
            Clear
          </button>
        </Show>
        <Show when={!hasCustomSound()}>
          <span style={{ "font-size": "12px", color: "var(--text-muted)" }}>No file selected</span>
        </Show>
      </div>

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
          <button style={btn("var(--button-positive-background)")} onClick={() => add()}>Add</button>
          <button style={btn("var(--button-secondary-background)")} onClick={() => setShowPicker(true)}>Browse</button>
        </div>

        <Show when={error()}>
          <p style={{ color: "var(--status-danger)", "font-size": "13px", margin: "0 0 8px" }}>{error()}</p>
        </Show>

        <Show when={showPicker()}>
          <GuildPickerModal
            alreadyWatched={guilds()}
            onAdd={id => add(id)}
            onClose={() => setShowPicker(false)}
          />
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
            const iconUrl    = () => getGuildIcon(id);

            return (
              <div style={{ "margin-bottom": "6px", background: "var(--background-secondary)", "border-radius": "6px", overflow: "hidden" }}>
                {/* Main row */}
                <div style={{ padding: "10px 12px" }}>
                  <div style={{ display: "flex", "align-items": "center", "justify-content": "space-between", gap: "8px" }}>
                    {/* Guild identity */}
                    <div style={{ display: "flex", "align-items": "center", gap: "10px", "min-width": 0 }}>
                      <Show
                        when={iconUrl()}
                        fallback={
                          <div style={{
                            width: "32px", height: "32px", "border-radius": "50%",
                            background: "var(--background-modifier-accent)",
                            display: "flex", "align-items": "center", "justify-content": "center",
                            "flex-shrink": "0", "font-size": "12px", color: "var(--text-muted)",
                          }}>
                            {(getGuildName(id) ?? "?")[0]?.toUpperCase()}
                          </div>
                        }
                      >
                        <img
                          src={iconUrl()}
                          style={{
                            width: "32px", height: "32px", "border-radius": "50%",
                            "object-fit": "cover", "flex-shrink": "0",
                          }}
                        />
                      </Show>
                      <div style={{ "min-width": 0 }}>
                        <span style={{ color: "var(--header-primary)", "font-weight": "600" }}>
                          {getGuildName(id) ?? "Unknown Server"}
                        </span>
                        <span style={{ color: "var(--text-muted)", "font-size": "12px", "margin-left": "8px" }}>{id}</span>
                      </div>
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
            Click "Check Members" to snapshot whoever Discord has loaded locally. Coverage grows automatically over time as members send messages or appear in the member sidebar.
          </p>
        </Show>
      </Show>

      {/* ── LEAVE LOG TAB ── */}
      <Show when={tab() === "log"}>
        {/* Search + filter bar */}
        <div style={{ display: "flex", gap: "8px", "margin-bottom": "10px", "align-items": "center" }}>
          <div style={{ flex: "1" }}>
            <TextBox
              value={logSearch()}
              onInput={v => setLogSearch(v)}
              placeholder="Search by username or user ID…"
            />
          </div>
          <Show when={logGuildOptions().length > 1}>
            <DarkSelect
              value={logGuild}
              onChange={v => setLogGuild(v)}
              options={[
                { value: "all", label: "All servers" },
                ...logGuildOptions().map(([guildId, name]) => ({ value: guildId, label: name })),
              ]}
            />
          </Show>
        </div>

        <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center", "margin-bottom": "12px" }}>
          <span style={{ color: "var(--text-muted)", "font-size": "13px" }}>
            {filteredHistory().length}{filteredHistory().length !== history().length ? ` / ${history().length}` : ""} record{history().length !== 1 ? "s" : ""}
          </span>
          <Show when={history().length > 0}>
            <button onClick={clearLog} style={btn("var(--button-danger-background)")}>Clear</button>
          </Show>
        </div>

        <Show when={history().length === 0}>
          <p style={{ color: "var(--text-muted)" }}>No leaves recorded yet.</p>
        </Show>

        <Show when={history().length > 0 && filteredHistory().length === 0}>
          <p style={{ color: "var(--text-muted)" }}>No results match your search.</p>
        </Show>

        <For each={filteredHistory()}>
          {entry => {
            const name  = displayName(entry);
            const guild = (() => {
              try { return stores.GuildStore?.getGuild(entry.guildId)?.name ?? entry.guildName ?? entry.guildId; }
              catch { return entry.guildName ?? entry.guildId; }
            })();
            return (
              <div
                onClick={() => openProfile(entry.userId, entry.guildId)}
                style={{
                  padding: "8px 12px", "margin-bottom": "4px",
                  background: "var(--background-secondary)", "border-radius": "6px",
                  "border-left": entry.isBan ? "3px solid #f23f43" : "3px solid var(--status-danger)",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={e => e.currentTarget.style.background = "var(--background-modifier-hover)"}
                onMouseLeave={e => e.currentTarget.style.background = "var(--background-secondary)"}
              >
                <div style={{ display: "flex", "justify-content": "space-between", "align-items": "center" }}>
                  <span>
                    <span style={{ color: "var(--header-primary)", "font-weight": "600" }}>{name}</span>
                    <span style={{ color: "var(--text-muted)", "font-size": "12px", "margin-left": "6px" }}>({entry.userId})</span>
                  </span>
                  <span style={{ color: "var(--text-muted)", "font-size": "12px" }}>{formatTime(entry.timestamp)}</span>
                </div>
                <div style={{ color: "var(--text-muted)", "font-size": "13px", "margin-top": "2px" }}>
                  {entry.isBan
                    ? <span style={{ color: "#f23f43" }}>Banned from {guild}</span>
                    : <>Left {guild}</>
                  }
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