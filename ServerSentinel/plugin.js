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
//#region plugins/ServerSentinel/db.js
const DB_NAME = "ServerSentinel";
const DB_VERSION = 1;
const STORE_NAME = "snapshots";
let _db = null;
function openDB() {
	if (_db) return Promise.resolve(_db);
	return new Promise((resolve, reject) => {
		const req = indexedDB.open(DB_NAME, DB_VERSION);
		req.onupgradeneeded = (e) => {
			e.target.result.createObjectStore(STORE_NAME);
		};
		req.onsuccess = (e) => {
			_db = e.target.result;
			_db.onclose = () => {
				_db = null;
			};
			resolve(_db);
		};
		req.onerror = (e) => reject(e.target.error);
	});
}
async function getSnap(guildId) {
	try {
		const db = await openDB();
		return await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readonly");
			const req = tx.objectStore(STORE_NAME).get(guildId);
			req.onsuccess = (e) => resolve(e.target.result ?? {});
			req.onerror = (e) => reject(e.target.error);
		});
	} catch (err) {
		console.error("[ServerSentinel] getSnap failed:", err);
		return {};
	}
}
async function saveSnap(guildId, data) {
	try {
		const db = await openDB();
		await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readwrite");
			tx.objectStore(STORE_NAME).put(data, guildId);
			tx.oncomplete = resolve;
			tx.onerror = (e) => reject(e.target.error);
		});
	} catch (err) {
		console.error("[ServerSentinel] saveSnap failed:", err);
	}
}
async function deleteSnap(guildId) {
	try {
		const db = await openDB();
		await new Promise((resolve, reject) => {
			const tx = db.transaction(STORE_NAME, "readwrite");
			tx.objectStore(STORE_NAME).delete(guildId);
			tx.oncomplete = resolve;
			tx.onerror = (e) => reject(e.target.error);
		});
	} catch (err) {
		console.error("[ServerSentinel] deleteSnap failed:", err);
	}
}

//#endregion
//#region plugins/ServerSentinel/memberUtils.js
const { flux: { stores: stores$2 } } = shelter;
function getUserFromStore(userId) {
	try {
		return stores$2.UserStore?.getUser(userId) ?? null;
	} catch {
		return null;
	}
}
function extractUser(member) {
	if (!member) return null;
	if (typeof member === "string") return null;
	const userId = member.userId ?? member.id ?? member.user?.id;
	if (!userId) return null;
	const u = getUserFromStore(userId) ?? member.user ?? member;
	return {
		id: userId,
		username: u?.username ?? u?.name ?? "unknown",
		globalName: u?.globalName ?? u?.global_name ?? u?.displayName ?? null,
		discriminator: u?.discriminator ?? "0"
	};
}
function toSnapEntry(u) {
	return {
		username: u.username,
		globalName: u.globalName,
		discriminator: u.discriminator
	};
}
function displayName(entry) {
	return entry?.globalName || entry?.username || "unknown";
}

//#endregion
//#region plugins/ServerSentinel/settings.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_solid_js = __toESM(require_solid_js(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<button></button>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web.template)(`<div><!#><!/><button>Add</button></div>`, 6), _tmpl$3 = /*#__PURE__*/ (0, import_web.template)(`<p></p>`, 2), _tmpl$4 = /*#__PURE__*/ (0, import_web.template)(`<p>No servers added yet.</p>`, 2), _tmpl$5 = /*#__PURE__*/ (0, import_web.template)(`<p>Click "Check Members" right after adding a server to build a complete snapshot. For servers with 150+ members, Discord may not send the full list - browse channels to improve coverage.</p>`, 2), _tmpl$6 = /*#__PURE__*/ (0, import_web.template)(`<button>Clear</button>`, 2), _tmpl$7 = /*#__PURE__*/ (0, import_web.template)(`<div><span><!#><!/> event<!#><!/> recorded</span><!#><!/></div>`, 10), _tmpl$8 = /*#__PURE__*/ (0, import_web.template)(`<p>No leaves recorded yet.</p>`, 2), _tmpl$9 = /*#__PURE__*/ (0, import_web.template)(`<div><span>ServerSentinel</span><div><!#><!/><!#><!/></div><!#><!/><!#><!/></div>`, 14), _tmpl$0 = /*#__PURE__*/ (0, import_web.template)(`<span> / <!#><!/> on server</span>`, 4), _tmpl$1 = /*#__PURE__*/ (0, import_web.template)(`<span>Snapshot incomplete - click Check Members</span>`, 2), _tmpl$10 = /*#__PURE__*/ (0, import_web.template)(`<div><div><div><span></span><span></span></div><div><button></button></div></div><div><span>Snapshot: <strong></strong><!#><!/></span><!#><!/></div><!#><!/></div>`, 26), _tmpl$11 = /*#__PURE__*/ (0, import_web.template)(`<div><div><span><span></span><span>(<!#><!/>)</span></span><span></span></div><div>Left <!#><!/></div></div>`, 18);
const { plugin: { store: store$1 }, flux: { stores: stores$1, dispatcher: dispatcher$1 }, ui: { TextBox } } = shelter;
function getGuildName$1(guildId) {
	try {
		return stores$1.GuildStore?.getGuild(guildId)?.name ?? null;
	} catch {
		return null;
	}
}
function formatTime(ts) {
	return new Date(ts).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
const btn = (color, extra = {}) => ({
	background: color,
	color: "#fff",
	border: "none",
	"border-radius": "4px",
	padding: "6px 12px",
	cursor: "pointer",
	"font-size": "14px",
	"white-space": "nowrap",
	...extra
});
function fetchMembersViaChunks(guildId, onProgress) {
	return new Promise((resolve) => {
		const collected = {};
		let expected = null;
		let received = 0;
		let done = false;
		const finish = (complete) => {
			if (done) return;
			done = true;
			clearTimeout(timer);
			dispatcher$1.unsubscribe("GUILD_MEMBERS_CHUNK", handler);
			resolve({
				members: collected,
				complete,
				count: Object.keys(collected).length
			});
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
			onProgress?.(`Receiving members… chunk ${received}/${expected} (${Object.keys(collected).length} so far)`);
			if (received >= expected) finish(true);
		};
		dispatcher$1.subscribe("GUILD_MEMBERS_CHUNK", handler);
		try {
			dispatcher$1.dispatch({
				type: "GUILD_MEMBERS_REQUEST",
				guildIds: [guildId],
				query: "",
				limit: 0,
				presences: false
			});
		} catch (e) {
			console.error("[ServerSentinel] GUILD_MEMBERS_REQUEST error:", e);
		}
		const timer = setTimeout(() => finish(false), 15e3);
	});
}
function MainPanel() {
	const [tab, setTab] = (0, import_solid_js.createSignal)("servers");
	const [guilds, setGuilds] = (0, import_solid_js.createSignal)([...store$1.watchedGuilds ?? []]);
	const [input, setInput] = (0, import_solid_js.createSignal)("");
	const [error, setError] = (0, import_solid_js.createSignal)("");
	const [checkState, setCheck] = (0, import_solid_js.createSignal)({});
	const [snapCounts, setSnapCounts] = (0, import_solid_js.createSignal)({});
	const [history, setHistory] = (0, import_solid_js.createSignal)([...store$1.leaveHistory ?? []]);
	guilds().forEach((id) => {
		getSnap(id).then((snap) => setSnapCounts((s) => ({
			...s,
			[id]: Object.keys(snap).length
		})));
	});
	function add() {
		const id = input().trim();
		if (!id) return setError("Enter a server ID.");
		if (!/^\d{17,20}$/.test(id)) return setError("Invalid ID - must be 17-20 digits.");
		if (guilds().includes(id)) return setError("Already watching this server.");
		const next = [...guilds(), id];
		store$1.watchedGuilds = next;
		setGuilds(next);
		setInput("");
		setError("");
		getSnap(id).then((snap) => setSnapCounts((s) => ({
			...s,
			[id]: Object.keys(snap).length
		})));
	}
	function remove(id) {
		store$1.watchedGuilds = guilds().filter((g) => g !== id);
		deleteSnap(id);
		setGuilds(guilds().filter((g) => g !== id));
		setSnapCounts((s) => {
			const n = { ...s };
			delete n[id];
			return n;
		});
		setCheck((s) => {
			const n = { ...s };
			delete n[id];
			return n;
		});
	}
	async function checkMembers(guildId) {
		if (checkState()[guildId]?.phase === "checking") return;
		setCheck((s) => ({
			...s,
			[guildId]: {
				phase: "checking",
				progress: "Reading Discord cache…"
			}
		}));
		const raw = getRawMembers(guildId);
		const snap = await getSnap(guildId);
		let fromCache = 0;
		for (const member of Object.values(raw)) {
			const u = extractUser(member);
			if (!u) continue;
			snap[u.id] = toSnapEntry(u);
			fromCache++;
		}
		if (fromCache > 0) {
			await saveSnap(guildId, snap);
			setSnapCounts((s) => ({
				...s,
				[guildId]: Object.keys(snap).length
			}));
		}
		setCheck((s) => ({
			...s,
			[guildId]: {
				phase: "checking",
				progress: `Cache: ${fromCache} members. Requesting full list from Discord gateway…`
			}
		}));
		const { members: chunkMembers, complete, count: chunkCount } = await fetchMembersViaChunks(guildId, (msg) => {
			setCheck((s) => ({
				...s,
				[guildId]: {
					phase: "checking",
					progress: msg
				}
			}));
		});
		if (chunkCount > 0) {
			const finalSnap$1 = await getSnap(guildId);
			for (const [uid, entry] of Object.entries(chunkMembers)) finalSnap$1[uid] = entry;
			await saveSnap(guildId, finalSnap$1);
		}
		const finalSnap = await getSnap(guildId);
		const saved = Object.keys(finalSnap).length;
		const total = getTotalMemberCount(guildId);
		setSnapCounts((s) => ({
			...s,
			[guildId]: saved
		}));
		setCheck((s) => ({
			...s,
			[guildId]: {
				phase: "done",
				complete,
				snapCount: saved,
				total,
				progress: complete ? `Complete! ${saved} members saved${total > 0 ? ` / ${total} total` : ""}.` : `Gateway didn't respond with chunks. Saved ${saved} from cache${total > 0 ? ` / ${total} total` : ""}. Try again later or browse the server to load more members.`
			}
		}));
	}
	function clearLog() {
		store$1.leaveHistory = [];
		setHistory([]);
	}
	const tabBtn = (key, label) => (() => {
		const _el$ = (0, import_web$7.getNextElement)(_tmpl$);
		_el$.$$click = () => {
			setTab(key);
			if (key === "log") setHistory([...store$1.leaveHistory ?? []]);
		};
		_el$.style.setProperty("padding", "6px 16px");
		_el$.style.setProperty("border-radius", "4px");
		_el$.style.setProperty("border", "none");
		_el$.style.setProperty("cursor", "pointer");
		_el$.style.setProperty("font-size", "14px");
		(0, import_web$9.insert)(_el$, label);
		(0, import_web$6.effect)((_p$) => {
			const _v$ = tab() === key ? "700" : "400", _v$2 = tab() === key ? "var(--brand-experiment)" : "var(--background-secondary)", _v$3 = tab() === key ? "#fff" : "var(--text-muted)";
			_v$ !== _p$._v$ && _el$.style.setProperty("font-weight", _p$._v$ = _v$);
			_v$2 !== _p$._v$2 && _el$.style.setProperty("background", _p$._v$2 = _v$2);
			_v$3 !== _p$._v$3 && _el$.style.setProperty("color", _p$._v$3 = _v$3);
			return _p$;
		}, {
			_v$: undefined,
			_v$2: undefined,
			_v$3: undefined
		});
		(0, import_web$8.runHydrationEvents)();
		return _el$;
	})();
	return (() => {
		const _el$2 = (0, import_web$7.getNextElement)(_tmpl$9), _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild, [_el$6, _co$] = (0, import_web$5.getNextMarker)(_el$5.nextSibling), _el$7 = _el$6.nextSibling, [_el$8, _co$2] = (0, import_web$5.getNextMarker)(_el$7.nextSibling), _el$26 = _el$4.nextSibling, [_el$27, _co$7] = (0, import_web$5.getNextMarker)(_el$26.nextSibling), _el$28 = _el$27.nextSibling, [_el$29, _co$8] = (0, import_web$5.getNextMarker)(_el$28.nextSibling);
		_el$2.style.setProperty("padding", "0 0 16px 0");
		_el$3.style.setProperty("color", "var(--header-primary)");
		_el$3.style.setProperty("font-size", "20px");
		_el$3.style.setProperty("font-weight", "700");
		_el$4.style.setProperty("display", "flex");
		_el$4.style.setProperty("gap", "6px");
		_el$4.style.setProperty("margin", "12px 0 16px");
		(0, import_web$9.insert)(_el$4, () => tabBtn("servers", "Watched Servers"), _el$6, _co$);
		(0, import_web$9.insert)(_el$4, () => tabBtn("log", "Leave Log" + (store$1.leaveHistory?.length ? ` (${store$1.leaveHistory.length})` : "")), _el$8, _co$2);
		(0, import_web$9.insert)(_el$2, (0, import_web$4.createComponent)(import_solid_js.Show, {
			get when() {
				return tab() === "servers";
			},
			get children() {
				return [
					(() => {
						const _el$9 = (0, import_web$7.getNextElement)(_tmpl$2), _el$1 = _el$9.firstChild, [_el$10, _co$3] = (0, import_web$5.getNextMarker)(_el$1.nextSibling), _el$0 = _el$10.nextSibling;
						_el$9.style.setProperty("display", "flex");
						_el$9.style.setProperty("gap", "8px");
						_el$9.style.setProperty("margin-bottom", "8px");
						(0, import_web$9.insert)(_el$9, (0, import_web$4.createComponent)(TextBox, {
							get value() {
								return input();
							},
							onInput: (v) => {
								setInput(v);
								setError("");
							},
							onKeyDown: (e) => e.key === "Enter" && add(),
							placeholder: "Server ID..."
						}), _el$10, _co$3);
						_el$0.$$click = add;
						(0, import_web$6.effect)((_$p) => (0, import_web$3.style)(_el$0, btn("var(--button-positive-background)"), _$p));
						(0, import_web$8.runHydrationEvents)();
						return _el$9;
					})(),
					(0, import_web$4.createComponent)(import_solid_js.Show, {
						get when() {
							return error();
						},
						get children() {
							const _el$11 = (0, import_web$7.getNextElement)(_tmpl$3);
							_el$11.style.setProperty("color", "var(--status-danger)");
							_el$11.style.setProperty("font-size", "13px");
							_el$11.style.setProperty("margin", "0 0 8px");
							(0, import_web$9.insert)(_el$11, error);
							return _el$11;
						}
					}),
					(0, import_web$4.createComponent)(import_solid_js.Show, {
						get when() {
							return guilds().length === 0;
						},
						get children() {
							const _el$12 = (0, import_web$7.getNextElement)(_tmpl$4);
							_el$12.style.setProperty("color", "var(--text-muted)");
							return _el$12;
						}
					}),
					(0, import_web$4.createComponent)(import_solid_js.For, {
						get each() {
							return guilds();
						},
						children: (id) => {
							const cs = () => checkState()[id];
							const count = () => snapCounts()[id] ?? 0;
							const total = () => getTotalMemberCount(id);
							const incomplete = () => total() > 0 && count() < total();
							return (() => {
								const _el$30 = (0, import_web$7.getNextElement)(_tmpl$10), _el$31 = _el$30.firstChild, _el$32 = _el$31.firstChild, _el$33 = _el$32.firstChild, _el$34 = _el$33.nextSibling, _el$35 = _el$32.nextSibling, _el$36 = _el$35.firstChild, _el$37 = _el$31.nextSibling, _el$38 = _el$37.firstChild, _el$39 = _el$38.firstChild, _el$40 = _el$39.nextSibling, _el$46 = _el$40.nextSibling, [_el$47, _co$0] = (0, import_web$5.getNextMarker)(_el$46.nextSibling), _el$49 = _el$38.nextSibling, [_el$50, _co$1] = (0, import_web$5.getNextMarker)(_el$49.nextSibling), _el$52 = _el$37.nextSibling, [_el$53, _co$10] = (0, import_web$5.getNextMarker)(_el$52.nextSibling);
								_el$30.style.setProperty("padding", "10px 12px");
								_el$30.style.setProperty("margin-bottom", "6px");
								_el$30.style.setProperty("background", "var(--background-secondary)");
								_el$30.style.setProperty("border-radius", "6px");
								_el$31.style.setProperty("display", "flex");
								_el$31.style.setProperty("align-items", "center");
								_el$31.style.setProperty("justify-content", "space-between");
								_el$31.style.setProperty("gap", "8px");
								_el$32.style.setProperty("min-width", "0");
								_el$33.style.setProperty("color", "var(--header-primary)");
								_el$33.style.setProperty("font-weight", "600");
								(0, import_web$9.insert)(_el$33, () => getGuildName$1(id) ?? "Unknown Server");
								_el$34.style.setProperty("color", "var(--text-muted)");
								_el$34.style.setProperty("font-size", "12px");
								_el$34.style.setProperty("margin-left", "8px");
								(0, import_web$9.insert)(_el$34, id);
								_el$35.style.setProperty("display", "flex");
								_el$35.style.setProperty("gap", "6px");
								_el$35.style.setProperty("flex-shrink", "0");
								_el$36.$$click = () => checkMembers(id);
								(0, import_web$9.insert)(_el$36, () => cs()?.phase === "checking" ? "Checking…" : "Check Members");
								_el$37.style.setProperty("margin-top", "6px");
								_el$37.style.setProperty("font-size", "12px");
								_el$37.style.setProperty("color", "var(--text-muted)");
								_el$37.style.setProperty("display", "flex");
								_el$37.style.setProperty("gap", "12px");
								_el$37.style.setProperty("flex-wrap", "wrap");
								_el$37.style.setProperty("align-items", "center");
								(0, import_web$9.insert)(_el$40, count);
								(0, import_web$9.insert)(_el$38, (0, import_web$4.createComponent)(import_solid_js.Show, {
									get when() {
										return total() > 0;
									},
									get children() {
										const _el$41 = (0, import_web$7.getNextElement)(_tmpl$0), _el$42 = _el$41.firstChild, _el$44 = _el$42.nextSibling, [_el$45, _co$9] = (0, import_web$5.getNextMarker)(_el$44.nextSibling), _el$43 = _el$45.nextSibling;
										(0, import_web$9.insert)(_el$41, total, _el$45, _co$9);
										return _el$41;
									}
								}), _el$47, _co$0);
								(0, import_web$9.insert)(_el$37, (0, import_web$4.createComponent)(import_solid_js.Show, {
									get when() {
										return (0, import_web$2.memo)(() => !!incomplete())() && !cs();
									},
									get children() {
										const _el$48 = (0, import_web$7.getNextElement)(_tmpl$1);
										_el$48.style.setProperty("color", "var(--text-warning)");
										_el$48.style.setProperty("font-size", "11px");
										return _el$48;
									}
								}), _el$50, _co$1);
								(0, import_web$9.insert)(_el$30, (0, import_web$4.createComponent)(import_solid_js.Show, {
									get when() {
										return cs()?.progress;
									},
									get children() {
										const _el$51 = (0, import_web$7.getNextElement)(_tmpl$3);
										_el$51.style.setProperty("font-size", "12px");
										_el$51.style.setProperty("margin-top", "6px");
										_el$51.style.setProperty("margin-bottom", "0");
										(0, import_web$9.insert)(_el$51, () => cs().progress);
										(0, import_web$6.effect)(() => _el$51.style.setProperty("color", cs()?.phase === "done" ? cs()?.complete ? "var(--text-positive)" : "var(--text-warning)" : "var(--text-muted)"));
										return _el$51;
									}
								}), _el$53, _co$10);
								(0, import_web$6.effect)((_p$) => {
									const _v$4 = btn("var(--button-secondary-background)", { opacity: cs()?.phase === "checking" ? "0.6" : "1" }), _v$5 = incomplete() ? "var(--text-warning)" : "var(--text-positive)";
									_p$._v$4 = (0, import_web$3.style)(_el$36, _v$4, _p$._v$4);
									_v$5 !== _p$._v$5 && _el$40.style.setProperty("color", _p$._v$5 = _v$5);
									return _p$;
								}, {
									_v$4: undefined,
									_v$5: undefined
								});
								(0, import_web$8.runHydrationEvents)();
								return _el$30;
							})();
						}
					}),
					(0, import_web$4.createComponent)(import_solid_js.Show, {
						get when() {
							return guilds().length > 0;
						},
						get children() {
							const _el$13 = (0, import_web$7.getNextElement)(_tmpl$5);
							_el$13.style.setProperty("color", "var(--text-muted)");
							_el$13.style.setProperty("font-size", "12px");
							_el$13.style.setProperty("margin-top", "10px");
							return _el$13;
						}
					})
				];
			}
		}), _el$27, _co$7);
		(0, import_web$9.insert)(_el$2, (0, import_web$4.createComponent)(import_solid_js.Show, {
			get when() {
				return tab() === "log";
			},
			get children() {
				return [
					(() => {
						const _el$14 = (0, import_web$7.getNextElement)(_tmpl$7), _el$15 = _el$14.firstChild, _el$18 = _el$15.firstChild, [_el$19, _co$4] = (0, import_web$5.getNextMarker)(_el$18.nextSibling), _el$16 = _el$19.nextSibling, _el$20 = _el$16.nextSibling, [_el$21, _co$5] = (0, import_web$5.getNextMarker)(_el$20.nextSibling), _el$17 = _el$21.nextSibling, _el$23 = _el$15.nextSibling, [_el$24, _co$6] = (0, import_web$5.getNextMarker)(_el$23.nextSibling);
						_el$14.style.setProperty("display", "flex");
						_el$14.style.setProperty("justify-content", "space-between");
						_el$14.style.setProperty("align-items", "center");
						_el$14.style.setProperty("margin-bottom", "12px");
						_el$15.style.setProperty("color", "var(--text-muted)");
						_el$15.style.setProperty("font-size", "13px");
						(0, import_web$9.insert)(_el$15, () => history().length, _el$19, _co$4);
						(0, import_web$9.insert)(_el$15, () => history().length !== 1 ? "s" : "", _el$21, _co$5);
						(0, import_web$9.insert)(_el$14, (0, import_web$4.createComponent)(import_solid_js.Show, {
							get when() {
								return history().length > 0;
							},
							get children() {
								const _el$22 = (0, import_web$7.getNextElement)(_tmpl$6);
								_el$22.$$click = clearLog;
								(0, import_web$6.effect)((_$p) => (0, import_web$3.style)(_el$22, btn("var(--button-danger-background)"), _$p));
								(0, import_web$8.runHydrationEvents)();
								return _el$22;
							}
						}), _el$24, _co$6);
						return _el$14;
					})(),
					(0, import_web$4.createComponent)(import_solid_js.Show, {
						get when() {
							return history().length === 0;
						},
						get children() {
							const _el$25 = (0, import_web$7.getNextElement)(_tmpl$8);
							_el$25.style.setProperty("color", "var(--text-muted)");
							return _el$25;
						}
					}),
					(0, import_web$4.createComponent)(import_solid_js.For, {
						get each() {
							return history();
						},
						children: (entry) => {
							const name = displayName(entry);
							const guild = (() => {
								try {
									return stores$1.GuildStore?.getGuild(entry.guildId)?.name ?? entry.guildName ?? entry.guildId;
								} catch {
									return entry.guildName ?? entry.guildId;
								}
							})();
							return (() => {
								const _el$54 = (0, import_web$7.getNextElement)(_tmpl$11), _el$55 = _el$54.firstChild, _el$56 = _el$55.firstChild, _el$57 = _el$56.firstChild, _el$58 = _el$57.nextSibling, _el$59 = _el$58.firstChild, _el$61 = _el$59.nextSibling, [_el$62, _co$11] = (0, import_web$5.getNextMarker)(_el$61.nextSibling), _el$60 = _el$62.nextSibling, _el$63 = _el$56.nextSibling, _el$64 = _el$55.nextSibling, _el$65 = _el$64.firstChild, _el$66 = _el$65.nextSibling, [_el$67, _co$12] = (0, import_web$5.getNextMarker)(_el$66.nextSibling);
								_el$54.style.setProperty("padding", "8px 12px");
								_el$54.style.setProperty("margin-bottom", "4px");
								_el$54.style.setProperty("background", "var(--background-secondary)");
								_el$54.style.setProperty("border-radius", "6px");
								_el$54.style.setProperty("border-left", "3px solid var(--status-danger)");
								_el$55.style.setProperty("display", "flex");
								_el$55.style.setProperty("justify-content", "space-between");
								_el$55.style.setProperty("align-items", "center");
								_el$57.style.setProperty("color", "var(--header-primary)");
								_el$57.style.setProperty("font-weight", "600");
								(0, import_web$9.insert)(_el$57, name);
								_el$58.style.setProperty("color", "var(--text-muted)");
								_el$58.style.setProperty("font-size", "12px");
								_el$58.style.setProperty("margin-left", "6px");
								(0, import_web$9.insert)(_el$58, () => entry.userId, _el$62, _co$11);
								_el$63.style.setProperty("color", "var(--text-muted)");
								_el$63.style.setProperty("font-size", "12px");
								(0, import_web$9.insert)(_el$63, () => formatTime(entry.timestamp));
								_el$64.style.setProperty("color", "var(--text-muted)");
								_el$64.style.setProperty("font-size", "13px");
								_el$64.style.setProperty("margin-top", "2px");
								(0, import_web$9.insert)(_el$64, guild, _el$67, _co$12);
								return _el$54;
							})();
						}
					})
				];
			}
		}), _el$29, _co$8);
		return _el$2;
	})();
}
(0, import_web$1.delegateEvents)(["click"]);

//#endregion
//#region plugins/ServerSentinel/index.jsx
const { flux: { dispatcher, stores }, plugin: { store }, ui: { showToast }, settings: { registerSection } } = shelter;
const MAX_HISTORY = 400;
const seenThisSession = new Map();
let unregMain = null;
function bootstrapStore() {
	if (store.watchedGuilds == null) store.watchedGuilds = [];
	if (store.leaveHistory == null) store.leaveHistory = [];
	if (store.enabled == null) store.enabled = true;
}
function markSeen(guildId, userId) {
	if (!seenThisSession.has(guildId)) seenThisSession.set(guildId, new Set());
	seenThisSession.get(guildId).add(userId);
}
function wasSeen(guildId, userId) {
	return seenThisSession.get(guildId)?.has(userId) ?? false;
}
function getGuildName(guildId) {
	try {
		return stores.GuildStore?.getGuild(guildId)?.name ?? guildId;
	} catch {
		return guildId;
	}
}
function getRawMembers(guildId) {
	try {
		return stores.GuildMemberStore?.getMembers(guildId) ?? {};
	} catch {
		return {};
	}
}
function getTotalMemberCount(guildId) {
	try {
		const g = stores.GuildStore?.getGuild(guildId);
		return g?.memberCount ?? g?.member_count ?? g?.approximateMemberCount ?? 0;
	} catch {
		return 0;
	}
}
function recordLeave(entry) {
	store.leaveHistory = [entry, ...store.leaveHistory].slice(0, MAX_HISTORY);
	if (!store.enabled) return;
	const name = displayName(entry);
	const close = showToast({
		title: "Member Left",
		content: `${name} (${entry.userId}) left ${entry.guildName}`,
		duration: 999999999,
		onClick() {
			close();
		}
	});
}
function onGuildMembersChunk({ guildId, members }) {
	if (!store.watchedGuilds.includes(guildId)) return;
	if (!Array.isArray(members)) return;
	getSnap(guildId).then((snap) => {
		let changed = false;
		for (const member of members) {
			const u = extractUser(member);
			if (!u) continue;
			snap[u.id] = toSnapEntry(u);
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
	getSnap(guildId).then((snap) => {
		if (snap[user.id]) {
			delete snap[user.id];
			saveSnap(guildId, snap);
		}
	});
	if (!store.enabled) return;
	recordLeave({
		guildId,
		guildName: getGuildName(guildId),
		userId: user.id,
		username: user.username ?? "unknown",
		globalName: user.global_name ?? user.globalName ?? null,
		discriminator: user.discriminator ?? "0",
		timestamp: Date.now()
	});
}
function onMemberAdd({ guildId, member }) {
	if (!store.watchedGuilds.includes(guildId)) return;
	const u = extractUser(member);
	if (!u) return;
	markSeen(guildId, u.id);
	getSnap(guildId).then((snap) => {
		snap[u.id] = toSnapEntry(u);
		saveSnap(guildId, snap);
	});
}
function onMemberListUpdate({ guildId, ops }) {
	if (!store.watchedGuilds.includes(guildId)) return;
	if (!Array.isArray(ops)) return;
	getSnap(guildId).then((snap) => {
		let changed = false;
		for (const op of ops) {
			const items = op.items ?? (op.item ? [op.item] : []);
			for (const item of items) {
				const u = extractUser(item?.member ?? item);
				if (!u) continue;
				markSeen(guildId, u.id);
				snap[u.id] = toSnapEntry(u);
				changed = true;
			}
		}
		if (changed) saveSnap(guildId, snap);
	});
}
async function onConnectionOpen() {
	for (const guildId of store.watchedGuilds) {
		const snap = await getSnap(guildId);
		for (const uid of Object.keys(snap)) markSeen(guildId, uid);
		for (const m of Object.values(getRawMembers(guildId))) {
			const u = extractUser(m);
			if (u) markSeen(guildId, u.id);
		}
	}
}
function onLoad() {
	bootstrapStore();
	seenThisSession.clear();
	for (const guildId of store.watchedGuilds) {
		getSnap(guildId).then((snap) => {
			for (const uid of Object.keys(snap)) markSeen(guildId, uid);
		});
		for (const m of Object.values(getRawMembers(guildId))) {
			const u = extractUser(m);
			if (u) markSeen(guildId, u.id);
		}
	}
	dispatcher.subscribe("CONNECTION_OPEN", onConnectionOpen);
	dispatcher.subscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
	dispatcher.subscribe("GUILD_MEMBER_ADD", onMemberAdd);
	dispatcher.subscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
	dispatcher.subscribe("GUILD_MEMBERS_CHUNK", onGuildMembersChunk);
	unregMain = registerSection("section", "sentinel-main", "ServerSentinel", MainPanel);
}
function onUnload() {
	seenThisSession.clear();
	dispatcher.unsubscribe("CONNECTION_OPEN", onConnectionOpen);
	dispatcher.unsubscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
	dispatcher.unsubscribe("GUILD_MEMBER_ADD", onMemberAdd);
	dispatcher.unsubscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
	dispatcher.unsubscribe("GUILD_MEMBERS_CHUNK", onGuildMembersChunk);
	unregMain?.();
}

//#endregion
exports.getRawMembers = getRawMembers
exports.getTotalMemberCount = getTotalMemberCount
exports.onLoad = onLoad
exports.onUnload = onUnload
exports.settings = MainPanel
return exports;
})({});