(function(exports) {

//#region rolldown:runtime
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function() {
	return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));

//#endregion

//#region solid-js/web
var require_web = __commonJS({ "solid-js/web"(exports, module) {
	module.exports = shelter.solidWeb;
} });

//#endregion
//#region solid-js
var require_solid_js = __commonJS({ "solid-js"(exports, module) {
	module.exports = shelter.solid;
} });

//#endregion
//#region plugins/ServerSentinel/settings.jsx
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_web$10 = __toESM(require_web(), 1);
var import_web$11 = __toESM(require_web(), 1);
var import_web$12 = __toESM(require_web(), 1);
var import_web$13 = __toESM(require_web(), 1);
var import_web$14 = __toESM(require_web(), 1);
var import_web$15 = __toESM(require_web(), 1);
var import_web$16 = __toESM(require_web(), 1);
var import_web$17 = __toESM(require_web(), 1);
var import_solid_js$1 = __toESM(require_solid_js(), 1);
const _tmpl$$1 = /*#__PURE__*/ (0, import_web$8.template)(`<p></p>`, 2), _tmpl$2$1 = /*#__PURE__*/ (0, import_web$8.template)(`<p>No servers added yet.</p>`, 2), _tmpl$3$1 = /*#__PURE__*/ (0, import_web$8.template)(`<div><span>Watched Servers</span><p>Leave history is in the "Leave Log" section in the sidebar.</p><div><!#><!/><button>Add</button></div><!#><!/><!#><!/><!#><!/></div>`, 18), _tmpl$4$1 = /*#__PURE__*/ (0, import_web$8.template)(`<div><div><span></span><span></span></div><button>Remove</button></div>`, 10);
const { plugin: { store: store$2 }, flux: { stores: stores$2 }, ui: { TextBox } } = shelter;
function getGuildName$2(guildId) {
	try {
		return stores$2.GuildStore?.getGuild(guildId)?.name ?? null;
	} catch {
		return null;
	}
}
const btn = (color) => ({
	background: color,
	color: "#fff",
	border: "none",
	"border-radius": "4px",
	padding: "6px 12px",
	cursor: "pointer",
	"font-size": "14px",
	"white-space": "nowrap"
});
var settings_default = () => {
	const [guilds, setGuilds] = (0, import_solid_js$1.createSignal)([...store$2.watchedGuilds ?? []]);
	const [input, setInput] = (0, import_solid_js$1.createSignal)("");
	const [error, setError] = (0, import_solid_js$1.createSignal)("");
	function add() {
		const id = input().trim();
		if (!id) return setError("Enter a server ID.");
		if (!/^\d{17,20}$/.test(id)) return setError("Invalid ID — must be 17–20 digits.");
		if (guilds().includes(id)) return setError("Already watching this server!");
		const next = [...guilds(), id];
		store$2.watchedGuilds = next;
		setGuilds(next);
		setInput("");
		setError("");
	}
	function remove(id) {
		const next = guilds().filter((g) => g !== id);
		store$2.watchedGuilds = next;
		try {
			const data = JSON.parse(store$2.snapshots || "{}");
			delete data[id];
			store$2.snapshots = JSON.stringify(data);
		} catch {}
		setGuilds(next);
	}
	return (() => {
		const _el$ = (0, import_web$14.getNextElement)(_tmpl$3$1), _el$2 = _el$.firstChild, _el$3 = _el$2.nextSibling, _el$4 = _el$3.nextSibling, _el$6 = _el$4.firstChild, [_el$7, _co$] = (0, import_web$15.getNextMarker)(_el$6.nextSibling), _el$5 = _el$7.nextSibling, _el$0 = _el$4.nextSibling, [_el$1, _co$2] = (0, import_web$15.getNextMarker)(_el$0.nextSibling), _el$10 = _el$1.nextSibling, [_el$11, _co$3] = (0, import_web$15.getNextMarker)(_el$10.nextSibling), _el$12 = _el$11.nextSibling, [_el$13, _co$4] = (0, import_web$15.getNextMarker)(_el$12.nextSibling);
		_el$.style.setProperty("padding", "0px 0px 16px 0px");
		_el$2.style.setProperty("color", "var(--header-primary)");
		_el$2.style.setProperty("font-size", "20px");
		_el$2.style.setProperty("font-weight", "700");
		_el$3.style.setProperty("color", "var(--text-muted)");
		_el$3.style.setProperty("font-size", "13px");
		_el$3.style.setProperty("margin", "6px 0 12px");
		_el$4.style.setProperty("display", "flex");
		_el$4.style.setProperty("gap", "8px");
		_el$4.style.setProperty("margin-bottom", "8px");
		(0, import_web$16.insert)(_el$4, (0, import_web$17.createComponent)(TextBox, {
			get value() {
				return input();
			},
			onInput: (v) => {
				setInput(v);
				setError("");
			},
			onKeyDown: (e) => e.key === "Enter" && add(),
			placeholder: "Server ID…"
		}), _el$7, _co$);
		_el$5.$$click = add;
		(0, import_web$16.insert)(_el$, (0, import_web$17.createComponent)(import_solid_js$1.Show, {
			get when() {
				return error();
			},
			get children() {
				const _el$8 = (0, import_web$14.getNextElement)(_tmpl$$1);
				_el$8.style.setProperty("color", "var(--status-danger)");
				_el$8.style.setProperty("font-size", "13px");
				_el$8.style.setProperty("margin", "4px 0");
				(0, import_web$16.insert)(_el$8, error);
				return _el$8;
			}
		}), _el$1, _co$2);
		(0, import_web$16.insert)(_el$, (0, import_web$17.createComponent)(import_solid_js$1.Show, {
			get when() {
				return guilds().length === 0;
			},
			get children() {
				const _el$9 = (0, import_web$14.getNextElement)(_tmpl$2$1);
				_el$9.style.setProperty("color", "var(--text-muted)");
				return _el$9;
			}
		}), _el$11, _co$3);
		(0, import_web$16.insert)(_el$, (0, import_web$17.createComponent)(import_solid_js$1.For, {
			get each() {
				return guilds();
			},
			children: (id) => (() => {
				const _el$14 = (0, import_web$14.getNextElement)(_tmpl$4$1), _el$15 = _el$14.firstChild, _el$16 = _el$15.firstChild, _el$17 = _el$16.nextSibling, _el$18 = _el$15.nextSibling;
				_el$14.style.setProperty("display", "flex");
				_el$14.style.setProperty("align-items", "center");
				_el$14.style.setProperty("justify-content", "space-between");
				_el$14.style.setProperty("padding", "8px 12px");
				_el$14.style.setProperty("margin-bottom", "4px");
				_el$14.style.setProperty("background", "var(--background-secondary)");
				_el$14.style.setProperty("border-radius", "6px");
				_el$16.style.setProperty("color", "var(--header-primary)");
				_el$16.style.setProperty("font-weight", "600");
				(0, import_web$16.insert)(_el$16, () => getGuildName$2(id) ?? "Unknown Server");
				_el$17.style.setProperty("color", "var(--text-muted)");
				_el$17.style.setProperty("font-size", "12px");
				_el$17.style.setProperty("margin-left", "8px");
				(0, import_web$16.insert)(_el$17, id);
				_el$18.$$click = () => remove(id);
				(0, import_web$12.effect)((_$p) => (0, import_web$11.style)(_el$18, btn("var(--button-danger-background)"), _$p));
				(0, import_web$13.runHydrationEvents)();
				return _el$14;
			})()
		}), _el$13, _co$4);
		(0, import_web$12.effect)((_$p) => (0, import_web$11.style)(_el$5, btn("var(--button-positive-background)"), _$p));
		(0, import_web$13.runHydrationEvents)();
		return _el$;
	})();
};
(0, import_web$9.delegateEvents)(["click"]);

//#endregion
//#region plugins/ServerSentinel/LeaveLog.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_solid_js = __toESM(require_solid_js(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<button>Clear</button>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<p>No leaves recorded yet.</p>`, 2), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<div><div><span>Leave Log</span><!#><!/></div><!#><!/><!#><!/></div>`, 12), _tmpl$4 = /*#__PURE__*/ (0, import_web.template)(`<div><div><span><span></span><span>(<!#><!/>)</span></span><span></span></div><div>Left <!#><!/><!#><!/></div></div>`, 20);
const { plugin: { store: store$1 }, flux: { stores: stores$1 } } = shelter;
function formatTime(ts) {
	return new Date(ts).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function getGuildName$1(guildId) {
	try {
		return stores$1.GuildStore?.getGuild(guildId)?.name ?? null;
	} catch {
		return null;
	}
}
function LeaveLog() {
	const [history, setHistory] = (0, import_solid_js.createSignal)([...store$1.leaveHistory ?? []]);
	function clear() {
		store$1.leaveHistory = [];
		setHistory([]);
	}
	return (() => {
		const _el$ = (0, import_web$6.getNextElement)(_tmpl$3), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$5 = _el$3.nextSibling, [_el$6, _co$] = (0, import_web$3.getNextMarker)(_el$5.nextSibling), _el$8 = _el$2.nextSibling, [_el$9, _co$2] = (0, import_web$3.getNextMarker)(_el$8.nextSibling), _el$0 = _el$9.nextSibling, [_el$1, _co$3] = (0, import_web$3.getNextMarker)(_el$0.nextSibling);
		_el$.style.setProperty("padding", "16px 0");
		_el$2.style.setProperty("display", "flex");
		_el$2.style.setProperty("align-items", "center");
		_el$2.style.setProperty("justify-content", "space-between");
		_el$2.style.setProperty("margin-bottom", "12px");
		_el$3.style.setProperty("color", "var(--header-primary)");
		_el$3.style.setProperty("font-size", "20px");
		_el$3.style.setProperty("font-weight", "700");
		(0, import_web$4.insert)(_el$2, (0, import_web$5.createComponent)(import_solid_js.Show, {
			get when() {
				return history().length > 0;
			},
			get children() {
				const _el$4 = (0, import_web$6.getNextElement)(_tmpl$);
				_el$4.$$click = clear;
				_el$4.style.setProperty("background", "var(--button-danger-background)");
				_el$4.style.setProperty("color", "#fff");
				_el$4.style.setProperty("border", "none");
				_el$4.style.setProperty("border-radius", "4px");
				_el$4.style.setProperty("padding", "6px 12px");
				_el$4.style.setProperty("cursor", "pointer");
				_el$4.style.setProperty("font-size", "14px");
				(0, import_web$7.runHydrationEvents)();
				return _el$4;
			}
		}), _el$6, _co$);
		(0, import_web$4.insert)(_el$, (0, import_web$5.createComponent)(import_solid_js.Show, {
			get when() {
				return history().length === 0;
			},
			get children() {
				const _el$7 = (0, import_web$6.getNextElement)(_tmpl$2);
				_el$7.style.setProperty("color", "var(--text-muted)");
				return _el$7;
			}
		}), _el$9, _co$2);
		(0, import_web$4.insert)(_el$, (0, import_web$5.createComponent)(import_solid_js.For, {
			get each() {
				return history();
			},
			children: (entry) => {
				const name = entry.globalName || entry.username;
				const guild = getGuildName$1(entry.guildId) ?? entry.guildName ?? entry.guildId;
				return (() => {
					const _el$10 = (0, import_web$6.getNextElement)(_tmpl$4), _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$12.firstChild, _el$14 = _el$13.nextSibling, _el$15 = _el$14.firstChild, _el$17 = _el$15.nextSibling, [_el$18, _co$4] = (0, import_web$3.getNextMarker)(_el$17.nextSibling), _el$16 = _el$18.nextSibling, _el$19 = _el$12.nextSibling, _el$20 = _el$11.nextSibling, _el$21 = _el$20.firstChild, _el$22 = _el$21.nextSibling, [_el$23, _co$5] = (0, import_web$3.getNextMarker)(_el$22.nextSibling), _el$24 = _el$23.nextSibling, [_el$25, _co$6] = (0, import_web$3.getNextMarker)(_el$24.nextSibling);
					_el$10.style.setProperty("padding", "8px 12px");
					_el$10.style.setProperty("margin-bottom", "4px");
					_el$10.style.setProperty("background", "var(--background-secondary)");
					_el$10.style.setProperty("border-radius", "6px");
					_el$11.style.setProperty("display", "flex");
					_el$11.style.setProperty("justify-content", "space-between");
					_el$11.style.setProperty("align-items", "center");
					_el$13.style.setProperty("color", "var(--header-primary)");
					_el$13.style.setProperty("font-weight", "600");
					(0, import_web$4.insert)(_el$13, name);
					_el$14.style.setProperty("color", "var(--text-muted)");
					_el$14.style.setProperty("font-size", "12px");
					_el$14.style.setProperty("margin-left", "6px");
					(0, import_web$4.insert)(_el$14, () => entry.userId, _el$18, _co$4);
					_el$19.style.setProperty("color", "var(--text-muted)");
					_el$19.style.setProperty("font-size", "12px");
					(0, import_web$4.insert)(_el$19, () => formatTime(entry.timestamp));
					_el$20.style.setProperty("color", "var(--text-muted)");
					_el$20.style.setProperty("font-size", "13px");
					_el$20.style.setProperty("margin-top", "2px");
					(0, import_web$4.insert)(_el$20, guild, _el$23, _co$5);
					(0, import_web$4.insert)(_el$20, () => entry.offline ? " · detected offline" : "", _el$25, _co$6);
					return _el$10;
				})();
			}
		}), _el$1, _co$3);
		return _el$;
	})();
}
(0, import_web$1.delegateEvents)(["click"]);

//#endregion
//#region plugins/ServerSentinel/index.jsx
const { flux: { dispatcher, stores }, plugin: { store }, ui: { showToast }, settings: { registerSection } } = shelter;
const MAX_HISTORY = 200;
let diffDone = false;
let unregisterSection = null;
const seenThisSession = new Map();
function markSeen(guildId, userId) {
	if (!seenThisSession.has(guildId)) seenThisSession.set(guildId, new Set());
	seenThisSession.get(guildId).add(userId);
}
function wasSeen(guildId, userId) {
	return seenThisSession.get(guildId)?.has(userId) ?? false;
}
function safeGet(key) {
	try {
		return store[key];
	} catch {
		return undefined;
	}
}
function bootstrapStore() {
	if (safeGet("watchedGuilds") == null) store.watchedGuilds = [];
	if (safeGet("leaveHistory") == null) store.leaveHistory = [];
	if (safeGet("enabled") == null) store.enabled = true;
	if (safeGet("snapshots") == null) store.snapshots = "{}";
}
function readSnapshots() {
	try {
		return JSON.parse(store.snapshots || "{}");
	} catch {
		return {};
	}
}
function saveSnapshots(data) {
	const json = JSON.stringify(data);
	setTimeout(() => {
		store.snapshots = json;
	}, 0);
}
function getGuildName(guildId) {
	try {
		return stores.GuildStore?.getGuild(guildId)?.name ?? null;
	} catch {
		return null;
	}
}
function getLoadedMembers(guildId) {
	try {
		return stores.GuildMemberStore?.getMembers(guildId) ?? {};
	} catch {
		return {};
	}
}
function getGuildMemberCount(guildId) {
	try {
		return stores.GuildStore?.getGuild(guildId)?.memberCount ?? 0;
	} catch {
		return 0;
	}
}
function seedSeenFromCache(guildId) {
	const loaded = getLoadedMembers(guildId);
	for (const userId of Object.keys(loaded)) markSeen(guildId, userId);
}
function snapshotGuild(guildId, data) {
	const loaded = getLoadedMembers(guildId);
	if (!data[guildId]) data[guildId] = {};
	for (const [, member] of Object.entries(loaded)) {
		const user = member?.user;
		if (!user?.id) continue;
		data[guildId][user.id] = {
			username: user.username ?? "unknown",
			globalName: user.global_name ?? user.globalName ?? null,
			discriminator: user.discriminator ?? "0"
		};
		markSeen(guildId, user.id);
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
		duration: 999999999,
		onClick() {
			close();
		}
	});
}
function diffGuild(guildId, data) {
	const snapshot = data[guildId];
	const loaded = getLoadedMembers(guildId);
	const loadedCount = Object.keys(loaded).length;
	const totalCount = getGuildMemberCount(guildId);
	const coverage = totalCount > 0 ? loadedCount / totalCount : 0;
	if (totalCount > 250 && coverage < .9) {
		snapshotGuild(guildId, data);
		return;
	}
	if (!snapshot || Object.keys(snapshot).length === 0) {
		snapshotGuild(guildId, data);
		return;
	}
	const loadedIds = new Set(Object.keys(loaded));
	for (const [userId, info] of Object.entries(snapshot)) {
		if (loadedIds.has(userId)) continue;
		recordLeave({
			guildId,
			guildName: getGuildName(guildId) ?? guildId,
			userId,
			username: info.username,
			globalName: info.globalName,
			discriminator: info.discriminator,
			timestamp: Date.now(),
			offline: true
		});
		delete data[guildId][userId];
	}
	snapshotGuild(guildId, data);
}
function runOfflineDiff() {
	if (diffDone) return;
	diffDone = true;
	const data = readSnapshots();
	for (const guildId of store.watchedGuilds) diffGuild(guildId, data);
	saveSnapshots(data);
}
function onMemberRemove({ guildId, user }) {
	if (!user?.id || !guildId) return;
	if (!store.watchedGuilds.includes(guildId)) return;
	if (!wasSeen(guildId, user.id)) return;
	seenThisSession.get(guildId)?.delete(user.id);
	const data = readSnapshots();
	if (data[guildId]?.[user.id]) {
		delete data[guildId][user.id];
		saveSnapshots(data);
	}
	if (!store.enabled) return;
	recordLeave({
		guildId,
		guildName: getGuildName(guildId) ?? guildId,
		userId: user.id,
		username: user.username,
		globalName: user.global_name ?? user.globalName ?? null,
		discriminator: user.discriminator ?? "0",
		timestamp: Date.now(),
		offline: false
	});
}
function onMemberAdd({ guildId, member }) {
	if (!store.watchedGuilds.includes(guildId)) return;
	const user = member?.user;
	if (!user?.id) return;
	markSeen(guildId, user.id);
	const data = readSnapshots();
	if (!data[guildId]) data[guildId] = {};
	data[guildId][user.id] = {
		username: user.username ?? "unknown",
		globalName: user.global_name ?? user.globalName ?? null,
		discriminator: user.discriminator ?? "0"
	};
	saveSnapshots(data);
}
function onMemberListUpdate({ guildId, ops }) {
	if (!store.watchedGuilds.includes(guildId)) return;
	if (!Array.isArray(ops)) return;
	for (const op of ops) {
		const items = op.items ?? (op.item ? [op.item] : []);
		for (const item of items) {
			const userId = item?.member?.user?.id;
			if (userId) markSeen(guildId, userId);
		}
	}
}
function onConnectionOpen() {
	for (const guildId of store.watchedGuilds) seedSeenFromCache(guildId);
	if (diffDone) return;
	setTimeout(() => {
		if (!store.enabled) return;
		if (!store.watchedGuilds?.length) return;
		runOfflineDiff();
	}, 6e3);
}
function onLoad() {
	bootstrapStore();
	diffDone = false;
	seenThisSession.clear();
	for (const guildId of store.watchedGuilds) seedSeenFromCache(guildId);
	dispatcher.subscribe("CONNECTION_OPEN", onConnectionOpen);
	dispatcher.subscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
	dispatcher.subscribe("GUILD_MEMBER_ADD", onMemberAdd);
	dispatcher.subscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
	unregisterSection = registerSection("section", "sentinel-leaves", "Leave Log", LeaveLog);
}
function onUnload() {
	diffDone = false;
	seenThisSession.clear();
	dispatcher.unsubscribe("CONNECTION_OPEN", onConnectionOpen);
	dispatcher.unsubscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
	dispatcher.unsubscribe("GUILD_MEMBER_ADD", onMemberAdd);
	dispatcher.unsubscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
	unregisterSection?.();
}

//#endregion
exports.onLoad = onLoad
exports.onUnload = onUnload
exports.settings = settings_default
return exports;
})({});