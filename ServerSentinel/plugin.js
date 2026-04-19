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
//#region plugins/ServerSentinel/Db.js
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
function getUserFromStore$1(userId) {
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
	const u = getUserFromStore$1(userId) ?? member.user ?? member;
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
var import_web$5 = __toESM(require_web(), 1);
var import_web$6 = __toESM(require_web(), 1);
var import_web$7 = __toESM(require_web(), 1);
var import_web$8 = __toESM(require_web(), 1);
var import_web$9 = __toESM(require_web(), 1);
var import_web$10 = __toESM(require_web(), 1);
var import_web$11 = __toESM(require_web(), 1);
var import_web$12 = __toESM(require_web(), 1);
var import_web$13 = __toESM(require_web(), 1);
var import_web$14 = __toESM(require_web(), 1);
var import_web$15 = __toESM(require_web(), 1);
var import_web$16 = __toESM(require_web(), 1);
var import_solid_js = __toESM(require_solid_js(), 1);
const _tmpl$$1 = /*#__PURE__*/ (0, import_web$5.template)(`<div></div>`, 2), _tmpl$2 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div><!#><!/><span>▼</span></div><!#><!/></div>`, 10), _tmpl$3 = /*#__PURE__*/ (0, import_web$5.template)(`<p>No servers found.</p>`, 2), _tmpl$4 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div><div><span>Pick a Server</span><button>×</button></div><div><input type="text" placeholder="Search by name or ID…" autofocus></div><div><!#><!/><!#><!/></div></div></div>`, 19), _tmpl$5 = /*#__PURE__*/ (0, import_web$5.template)(`<img>`, 1), _tmpl$6 = /*#__PURE__*/ (0, import_web$5.template)(`<span>Watching</span>`, 2), _tmpl$7 = /*#__PURE__*/ (0, import_web$5.template)(`<div><!#><!/><div><div></div><div></div></div><!#><!/></div>`, 12), _tmpl$8 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div><div><div>ServerSentinel enabled</div><div>One more step needed</div></div><div><div>Close and reopen <span>Discord Settings</span> for the plugin to fully load.</div><div></div><div>Got it</div></div></div></div>`, 20), _tmpl$9 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div></div><span></span></div>`, 6), _tmpl$0 = /*#__PURE__*/ (0, import_web$5.template)(`<button></button>`, 2), _tmpl$1 = /*#__PURE__*/ (0, import_web$5.template)(`<div><!#><!/><button>Add</button><button>Browse</button></div>`, 8), _tmpl$10 = /*#__PURE__*/ (0, import_web$5.template)(`<p></p>`, 2), _tmpl$11 = /*#__PURE__*/ (0, import_web$5.template)(`<p>No servers added yet.</p>`, 2), _tmpl$12 = /*#__PURE__*/ (0, import_web$5.template)(`<p>Click "Check Members" after adding a server to build a snapshot. Snapshot data persists across Discord restarts. For servers with 150+ members Discord may not send the full list - browse channels to improve coverage.</p>`, 2), _tmpl$13 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div></div><!#><!/></div>`, 6), _tmpl$14 = /*#__PURE__*/ (0, import_web$5.template)(`<button>Clear</button>`, 2), _tmpl$15 = /*#__PURE__*/ (0, import_web$5.template)(`<div><span><!#><!/><!#><!/> record<!#><!/></span><!#><!/></div>`, 12), _tmpl$16 = /*#__PURE__*/ (0, import_web$5.template)(`<p>No leaves recorded yet.</p>`, 2), _tmpl$17 = /*#__PURE__*/ (0, import_web$5.template)(`<p>No results match your search.</p>`, 2), _tmpl$18 = /*#__PURE__*/ (0, import_web$5.template)(`<div><span>ServerSentinel</span><div><!#><!/><!#><!/></div><!#><!/><!#><!/></div>`, 14), _tmpl$19 = /*#__PURE__*/ (0, import_web$5.template)(`<span>Incomplete - click Check Members</span>`, 2), _tmpl$20 = /*#__PURE__*/ (0, import_web$5.template)(`<p>No members in snapshot yet.</p>`, 2), _tmpl$21 = /*#__PURE__*/ (0, import_web$5.template)(`<div><!#><!/><!#><!/></div>`, 6), _tmpl$22 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div><div><div><!#><!/><div><span></span><span></span></div></div><div><button></button><button>Remove</button></div></div><div><span>Snapshot: <strong></strong><!#><!/></span><!#><!/><!#><!/></div><!#><!/></div><!#><!/></div>`, 38), _tmpl$23 = /*#__PURE__*/ (0, import_web$5.template)(`<span>@<!#><!/></span>`, 4), _tmpl$24 = /*#__PURE__*/ (0, import_web$5.template)(`<div><span><!#><!/><!#><!/></span><span></span></div>`, 10), _tmpl$25 = /*#__PURE__*/ (0, import_web$5.template)(`<div><div><span><span></span><span>(<!#><!/>)</span></span><span></span></div><div>Left <!#><!/></div></div>`, 18);
const { plugin: { store: store$1 }, flux: { stores: stores$1, dispatcher: dispatcher$1 }, ui: { TextBox } } = shelter;
function getGuildName$1(guildId) {
	try {
		return stores$1.GuildStore?.getGuild(guildId)?.name ?? null;
	} catch {
		return null;
	}
}
function getGuildIcon(guildId) {
	try {
		const icon = stores$1.GuildStore?.getGuild(guildId)?.icon;
		if (!icon) return null;
		const ext = icon.startsWith("a_") ? "gif" : "webp";
		return `https://cdn.discordapp.com/icons/${guildId}/${icon}.${ext}?size=32`;
	} catch {
		return null;
	}
}
function DarkSelect({ value, onChange, options }) {
	const [open, setOpen] = (0, import_solid_js.createSignal)(false);
	const selected = () => options.find((o) => o.value === value()) ?? options[0];
	return (() => {
		const _el$ = (0, import_web$13.getNextElement)(_tmpl$2), _el$2 = _el$.firstChild, _el$4 = _el$2.firstChild, [_el$5, _co$] = (0, import_web$15.getNextMarker)(_el$4.nextSibling), _el$3 = _el$5.nextSibling, _el$8 = _el$2.nextSibling, [_el$9, _co$2] = (0, import_web$15.getNextMarker)(_el$8.nextSibling);
		_el$.style.setProperty("position", "relative");
		_el$.style.setProperty("flex-shrink", "0");
		_el$2.$$click = () => setOpen((o) => !o);
		_el$2.style.setProperty("background", "#1e1f22");
		_el$2.style.setProperty("color", "#dbdee1");
		_el$2.style.setProperty("border", "1px solid #3f4147");
		_el$2.style.setProperty("border-radius", "4px");
		_el$2.style.setProperty("padding", "7px 28px 7px 10px");
		_el$2.style.setProperty("font-size", "14px");
		_el$2.style.setProperty("cursor", "pointer");
		_el$2.style.setProperty("white-space", "nowrap");
		_el$2.style.setProperty("user-select", "none");
		_el$2.style.setProperty("position", "relative");
		_el$2.style.setProperty("min-width", "120px");
		(0, import_web$16.insert)(_el$2, () => selected()?.label, _el$5, _co$);
		_el$3.style.setProperty("position", "absolute");
		_el$3.style.setProperty("right", "8px");
		_el$3.style.setProperty("top", "50%");
		_el$3.style.setProperty("transform", "translateY(-50%)");
		_el$3.style.setProperty("color", "#80848e");
		_el$3.style.setProperty("font-size", "10px");
		_el$3.style.setProperty("pointer-events", "none");
		(0, import_web$16.insert)(_el$, (0, import_web$14.createComponent)(import_solid_js.Show, {
			get when() {
				return open();
			},
			get children() {
				return [(() => {
					const _el$6 = (0, import_web$13.getNextElement)(_tmpl$$1);
					_el$6.style.setProperty("position", "absolute");
					_el$6.style.setProperty("top", "calc(100% + 4px)");
					_el$6.style.setProperty("right", "0");
					_el$6.style.setProperty("background", "#2b2d31");
					_el$6.style.setProperty("border", "1px solid #1e1f22");
					_el$6.style.setProperty("border-radius", "6px");
					_el$6.style.setProperty("box-shadow", "0 8px 24px rgba(0,0,0,0.6)");
					_el$6.style.setProperty("z-index", "10000");
					_el$6.style.setProperty("min-width", "100%");
					_el$6.style.setProperty("max-height", "260px");
					_el$6.style.setProperty("overflow-y", "auto");
					(0, import_web$16.insert)(_el$6, (0, import_web$14.createComponent)(import_solid_js.For, {
						each: options,
						children: (opt) => (() => {
							const _el$0 = (0, import_web$13.getNextElement)(_tmpl$$1);
							_el$0.addEventListener("mouseleave", (e) => {
								if (opt.value !== value()) e.currentTarget.style.background = "transparent";
							});
							_el$0.addEventListener("mouseenter", (e) => {
								if (opt.value !== value()) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
							});
							_el$0.$$click = () => {
								onChange(opt.value);
								setOpen(false);
							};
							_el$0.style.setProperty("padding", "8px 12px");
							_el$0.style.setProperty("font-size", "14px");
							_el$0.style.setProperty("cursor", "pointer");
							_el$0.style.setProperty("white-space", "nowrap");
							(0, import_web$16.insert)(_el$0, () => opt.label);
							(0, import_web$11.effect)((_p$) => {
								const _v$ = opt.value === value() ? "#fff" : "#dbdee1", _v$2 = opt.value === value() ? "var(--brand-experiment, #5865f2)" : "transparent";
								_v$ !== _p$._v$ && _el$0.style.setProperty("color", _p$._v$ = _v$);
								_v$2 !== _p$._v$2 && _el$0.style.setProperty("background", _p$._v$2 = _v$2);
								return _p$;
							}, {
								_v$: undefined,
								_v$2: undefined
							});
							(0, import_web$12.runHydrationEvents)();
							return _el$0;
						})()
					}));
					return _el$6;
				})(), (() => {
					const _el$7 = (0, import_web$13.getNextElement)(_tmpl$$1);
					_el$7.$$click = () => setOpen(false);
					_el$7.style.setProperty("position", "fixed");
					_el$7.style.setProperty("inset", "0");
					_el$7.style.setProperty("z-index", "9999");
					(0, import_web$12.runHydrationEvents)();
					return _el$7;
				})()];
			}
		}), _el$9, _co$2);
		(0, import_web$12.runHydrationEvents)();
		return _el$;
	})();
}
function getAllGuilds() {
	try {
		const guildsMap = stores$1.GuildStore?.getGuilds() ?? {};
		return Object.values(guildsMap).sort((a, b) => (a.name ?? "").localeCompare(b.name ?? "", undefined, { sensitivity: "base" }));
	} catch {
		return [];
	}
}
function GuildPickerModal({ onAdd, alreadyWatched, onClose }) {
	const [search, setSearch] = (0, import_solid_js.createSignal)("");
	const allGuilds = getAllGuilds();
	const filtered = (0, import_solid_js.createMemo)(() => {
		const q = search().trim().toLowerCase();
		if (!q) return allGuilds;
		return allGuilds.filter((g) => g.name?.toLowerCase().includes(q) || g.id?.includes(q));
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
		"color-scheme": "dark"
	};
	return (() => {
		const _el$1 = (0, import_web$13.getNextElement)(_tmpl$4), _el$10 = _el$1.firstChild, _el$11 = _el$10.firstChild, _el$12 = _el$11.firstChild, _el$13 = _el$12.nextSibling, _el$14 = _el$11.nextSibling, _el$15 = _el$14.firstChild, _el$16 = _el$14.nextSibling, _el$18 = _el$16.firstChild, [_el$19, _co$3] = (0, import_web$15.getNextMarker)(_el$18.nextSibling), _el$20 = _el$19.nextSibling, [_el$21, _co$4] = (0, import_web$15.getNextMarker)(_el$20.nextSibling);
		_el$1.$$click = (e) => e.target === e.currentTarget && onClose();
		_el$1.style.setProperty("position", "fixed");
		_el$1.style.setProperty("inset", "0");
		_el$1.style.setProperty("z-index", "9999");
		_el$1.style.setProperty("background", "rgba(0,0,0,0.7)");
		_el$1.style.setProperty("display", "flex");
		_el$1.style.setProperty("align-items", "center");
		_el$1.style.setProperty("justify-content", "center");
		_el$10.style.setProperty("background", "#2b2d31");
		_el$10.style.setProperty("border", "1px solid #1e1f22");
		_el$10.style.setProperty("border-radius", "10px");
		_el$10.style.setProperty("width", "420px");
		_el$10.style.setProperty("max-width", "calc(100vw - 32px)");
		_el$10.style.setProperty("max-height", "80vh");
		_el$10.style.setProperty("display", "flex");
		_el$10.style.setProperty("flex-direction", "column");
		_el$10.style.setProperty("overflow", "hidden");
		_el$10.style.setProperty("box-shadow", "0 8px 32px rgba(0,0,0,0.8)");
		_el$10.style.setProperty("color-scheme", "dark");
		_el$11.style.setProperty("padding", "14px 16px 12px");
		_el$11.style.setProperty("border-bottom", "1px solid #1e1f22");
		_el$11.style.setProperty("display", "flex");
		_el$11.style.setProperty("align-items", "center");
		_el$11.style.setProperty("justify-content", "space-between");
		_el$11.style.setProperty("background", "#2b2d31");
		_el$12.style.setProperty("color", "#f2f3f5");
		_el$12.style.setProperty("font-size", "16px");
		_el$12.style.setProperty("font-weight", "700");
		(0, import_web$10.addEventListener)(_el$13, "click", onClose, true);
		_el$13.style.setProperty("background", "none");
		_el$13.style.setProperty("border", "none");
		_el$13.style.setProperty("cursor", "pointer");
		_el$13.style.setProperty("color", "#80848e");
		_el$13.style.setProperty("font-size", "20px");
		_el$13.style.setProperty("line-height", "1");
		_el$13.style.setProperty("padding", "0 2px");
		_el$14.style.setProperty("padding", "10px 12px 6px");
		_el$14.style.setProperty("background", "#2b2d31");
		_el$15.$$input = (e) => setSearch(e.target.value);
		(0, import_web$9.style)(_el$15, inputStyle);
		_el$16.style.setProperty("overflow-y", "auto");
		_el$16.style.setProperty("flex", "1");
		_el$16.style.setProperty("background", "#2b2d31");
		(0, import_web$16.insert)(_el$16, (0, import_web$14.createComponent)(import_solid_js.Show, {
			get when() {
				return filtered().length === 0;
			},
			get children() {
				const _el$17 = (0, import_web$13.getNextElement)(_tmpl$3);
				_el$17.style.setProperty("color", "#80848e");
				_el$17.style.setProperty("font-size", "14px");
				_el$17.style.setProperty("padding", "12px 16px");
				_el$17.style.setProperty("margin", "0");
				return _el$17;
			}
		}), _el$19, _co$3);
		(0, import_web$16.insert)(_el$16, (0, import_web$14.createComponent)(import_solid_js.For, {
			get each() {
				return filtered();
			},
			children: (guild) => {
				const watched = alreadyWatched.includes(guild.id);
				const iconUrl = (() => {
					if (!guild.icon) return null;
					const ext = guild.icon.startsWith("a_") ? "gif" : "webp";
					return `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.${ext}?size=32`;
				})();
				return (() => {
					const _el$22 = (0, import_web$13.getNextElement)(_tmpl$7), _el$28 = _el$22.firstChild, [_el$29, _co$5] = (0, import_web$15.getNextMarker)(_el$28.nextSibling), _el$24 = _el$29.nextSibling, _el$25 = _el$24.firstChild, _el$26 = _el$25.nextSibling, _el$30 = _el$24.nextSibling, [_el$31, _co$6] = (0, import_web$15.getNextMarker)(_el$30.nextSibling);
					_el$22.addEventListener("mouseleave", (e) => {
						e.currentTarget.style.background = "transparent";
					});
					_el$22.addEventListener("mouseenter", (e) => {
						if (!watched) e.currentTarget.style.background = "rgba(255,255,255,0.06)";
					});
					_el$22.$$click = () => !watched && pickGuild(guild.id);
					_el$22.style.setProperty("display", "flex");
					_el$22.style.setProperty("align-items", "center");
					_el$22.style.setProperty("gap", "10px");
					_el$22.style.setProperty("padding", "8px 14px");
					_el$22.style.setProperty("cursor", watched ? "default" : "pointer");
					_el$22.style.setProperty("opacity", watched ? "0.45" : "1");
					_el$22.style.setProperty("transition", "background 0.1s");
					(0, import_web$16.insert)(_el$22, (0, import_web$14.createComponent)(import_solid_js.Show, {
						when: iconUrl,
						get fallback() {
							return (() => {
								const _el$32 = (0, import_web$13.getNextElement)(_tmpl$$1);
								_el$32.style.setProperty("width", "36px");
								_el$32.style.setProperty("height", "36px");
								_el$32.style.setProperty("border-radius", "50%");
								_el$32.style.setProperty("background", "#3f4147");
								_el$32.style.setProperty("display", "flex");
								_el$32.style.setProperty("align-items", "center");
								_el$32.style.setProperty("justify-content", "center");
								_el$32.style.setProperty("flex-shrink", "0");
								_el$32.style.setProperty("font-size", "13px");
								_el$32.style.setProperty("color", "#80848e");
								_el$32.style.setProperty("font-weight", "600");
								(0, import_web$16.insert)(_el$32, () => guild.name?.[0]?.toUpperCase() ?? "?");
								return _el$32;
							})();
						},
						get children() {
							const _el$23 = (0, import_web$13.getNextElement)(_tmpl$5);
							(0, import_web$8.setAttribute)(_el$23, "src", iconUrl);
							_el$23.style.setProperty("width", "36px");
							_el$23.style.setProperty("height", "36px");
							_el$23.style.setProperty("border-radius", "50%");
							_el$23.style.setProperty("object-fit", "cover");
							_el$23.style.setProperty("flex-shrink", "0");
							return _el$23;
						}
					}), _el$29, _co$5);
					_el$24.style.setProperty("min-width", "0");
					_el$25.style.setProperty("color", "#f2f3f5");
					_el$25.style.setProperty("font-size", "14px");
					_el$25.style.setProperty("font-weight", "600");
					_el$25.style.setProperty("overflow", "hidden");
					_el$25.style.setProperty("text-overflow", "ellipsis");
					_el$25.style.setProperty("white-space", "nowrap");
					(0, import_web$16.insert)(_el$25, () => guild.name);
					_el$26.style.setProperty("color", "#80848e");
					_el$26.style.setProperty("font-size", "11px");
					_el$26.style.setProperty("font-family", "monospace");
					(0, import_web$16.insert)(_el$26, () => guild.id);
					(0, import_web$16.insert)(_el$22, (0, import_web$14.createComponent)(import_solid_js.Show, {
						when: watched,
						get children() {
							const _el$27 = (0, import_web$13.getNextElement)(_tmpl$6);
							_el$27.style.setProperty("margin-left", "auto");
							_el$27.style.setProperty("font-size", "11px");
							_el$27.style.setProperty("color", "#80848e");
							_el$27.style.setProperty("flex-shrink", "0");
							return _el$27;
						}
					}), _el$31, _co$6);
					(0, import_web$12.runHydrationEvents)();
					return _el$22;
				})();
			}
		}), _el$21, _co$4);
		(0, import_web$11.effect)(() => _el$15.value = search());
		(0, import_web$12.runHydrationEvents)();
		return _el$1;
	})();
}
function ReloadModal({ onClose }) {
	return (() => {
		const _el$33 = (0, import_web$13.getNextElement)(_tmpl$8), _el$34 = _el$33.firstChild, _el$35 = _el$34.firstChild, _el$36 = _el$35.firstChild, _el$37 = _el$36.nextSibling, _el$38 = _el$35.nextSibling, _el$39 = _el$38.firstChild, _el$40 = _el$39.firstChild, _el$41 = _el$40.nextSibling, _el$42 = _el$39.nextSibling, _el$43 = _el$42.nextSibling;
		_el$33.$$click = (e) => e.target === e.currentTarget && onClose?.();
		_el$33.style.setProperty("position", "fixed");
		_el$33.style.setProperty("inset", "0");
		_el$33.style.setProperty("z-index", "99999");
		_el$33.style.setProperty("display", "flex");
		_el$33.style.setProperty("align-items", "center");
		_el$33.style.setProperty("justify-content", "center");
		_el$33.style.setProperty("background", "rgba(0,0,0,0.4)");
		_el$33.style.setProperty("backdrop-filter", "blur(10px)");
		_el$34.style.setProperty("background", "#111214");
		_el$34.style.setProperty("border", "1px solid #2e2f33");
		_el$34.style.setProperty("border-radius", "10px");
		_el$34.style.setProperty("overflow", "hidden");
		_el$34.style.setProperty("width", "520px");
		_el$34.style.setProperty("box-shadow", "0 8px 24px rgba(0,0,0,0.6)");
		_el$35.style.setProperty("padding", "18px 20px");
		_el$35.style.setProperty("border-bottom", "1px solid #1e1f22");
		_el$36.style.setProperty("font-size", "17px");
		_el$36.style.setProperty("font-weight", "700");
		_el$36.style.setProperty("color", "#dbdee1");
		_el$36.style.setProperty("margin-bottom", "4px");
		_el$37.style.setProperty("font-size", "13px");
		_el$37.style.setProperty("color", "#6d6f78");
		_el$38.style.setProperty("padding", "16px 20px");
		_el$38.style.setProperty("display", "flex");
		_el$38.style.setProperty("flex-direction", "column");
		_el$38.style.setProperty("gap", "14px");
		_el$39.style.setProperty("font-size", "14px");
		_el$39.style.setProperty("color", "#b5bac1");
		_el$39.style.setProperty("line-height", "1.6");
		_el$41.style.setProperty("color", "#dbdee1");
		_el$41.style.setProperty("font-weight", "600");
		_el$42.style.setProperty("display", "flex");
		_el$42.style.setProperty("flex-direction", "column");
		_el$42.style.setProperty("gap", "8px");
		(0, import_web$16.insert)(_el$42, () => [
			"Close this Settings panel",
			"Reopen Discord Settings",
			"Navigate to ServerSentinel"
		].map((label, i) => (() => {
			const _el$44 = (0, import_web$13.getNextElement)(_tmpl$9), _el$45 = _el$44.firstChild, _el$46 = _el$45.nextSibling;
			_el$44.style.setProperty("display", "flex");
			_el$44.style.setProperty("align-items", "center");
			_el$44.style.setProperty("gap", "10px");
			_el$45.style.setProperty("width", "22px");
			_el$45.style.setProperty("height", "22px");
			_el$45.style.setProperty("border-radius", "50%");
			_el$45.style.setProperty("background", "#1e1f22");
			_el$45.style.setProperty("border", "1px solid #2e2f33");
			_el$45.style.setProperty("display", "flex");
			_el$45.style.setProperty("align-items", "center");
			_el$45.style.setProperty("justify-content", "center");
			_el$45.style.setProperty("flex-shrink", "0");
			_el$45.style.setProperty("font-size", "11px");
			_el$45.style.setProperty("font-weight", "700");
			_el$45.style.setProperty("color", "#6d6f78");
			(0, import_web$16.insert)(_el$45, i + 1);
			_el$46.style.setProperty("font-size", "14px");
			_el$46.style.setProperty("color", "#b5bac1");
			(0, import_web$16.insert)(_el$46, label);
			return _el$44;
		})()));
		_el$43.addEventListener("mouseleave", (e) => e.currentTarget.style.color = "#5865f2");
		_el$43.addEventListener("mouseenter", (e) => e.currentTarget.style.color = "#7289da");
		_el$43.$$click = () => onClose?.();
		_el$43.style.setProperty("padding-top", "12px");
		_el$43.style.setProperty("text-align", "center");
		_el$43.style.setProperty("font-size", "13px");
		_el$43.style.setProperty("font-weight", "600");
		_el$43.style.setProperty("color", "#5865f2");
		_el$43.style.setProperty("cursor", "pointer");
		_el$43.style.setProperty("border-top", "1px solid #1e1f22");
		(0, import_web$12.runHydrationEvents)();
		return _el$33;
	})();
}
function formatTime(ts) {
	return new Date(ts).toLocaleString(undefined, {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	});
}
function openProfile(userId, guildId) {
	try {
		dispatcher$1.dispatch({
			type: "USER_PROFILE_MODAL_OPEN",
			userId,
			guildId
		});
	} catch {}
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
			onProgress?.(`Receiving… chunk ${received}/${expected} (${Object.keys(collected).length} members)`);
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
		} catch {}
		const timer = setTimeout(() => finish(false), 15e3);
	});
}
function MainPanel() {
	const [tab, setTab] = (0, import_solid_js.createSignal)("servers");
	const [guilds, setGuilds] = (0, import_solid_js.createSignal)([...store$1.watchedGuilds ?? []]);
	const [showPicker, setShowPicker] = (0, import_solid_js.createSignal)(false);
	const [input, setInput] = (0, import_solid_js.createSignal)("");
	const [error, setError] = (0, import_solid_js.createSignal)("");
	const [checkState, setCheck] = (0, import_solid_js.createSignal)({});
	const [snapCounts, setSnapCounts] = (0, import_solid_js.createSignal)({});
	const [expanded, setExpanded] = (0, import_solid_js.createSignal)(null);
	const [memberList, setMemberList] = (0, import_solid_js.createSignal)({});
	const [history, setHistory] = (0, import_solid_js.createSignal)([...store$1.leaveHistory ?? []]);
	const [logSearch, setLogSearch] = (0, import_solid_js.createSignal)("");
	const [logGuild, setLogGuild] = (0, import_solid_js.createSignal)("all");
	guilds().forEach((id) => {
		getSnap(id).then((snap) => setSnapCounts((s) => ({
			...s,
			[id]: Object.keys(snap).length
		})));
	});
	const logGuildOptions = (0, import_solid_js.createMemo)(() => {
		const seen = new Map();
		for (const e of history()) if (!seen.has(e.guildId)) seen.set(e.guildId, getGuildName$1(e.guildId) ?? e.guildName ?? e.guildId);
		return [...seen.entries()];
	});
	const filteredHistory = (0, import_solid_js.createMemo)(() => {
		const q = logSearch().trim().toLowerCase();
		const g = logGuild();
		return history().filter((e) => {
			if (g !== "all" && e.guildId !== g) return false;
			if (!q) return true;
			const name = (e.globalName || e.username || "").toLowerCase();
			const id = e.userId;
			return name.includes(q) || id.includes(q);
		});
	});
	function add(id) {
		const guildId = (id ?? input()).trim();
		if (!guildId) return setError("Enter a server ID.");
		if (!/^\d{17,20}$/.test(guildId)) return setError("Invalid ID - must be 17-20 digits.");
		if (guilds().includes(guildId)) return setError("Already watching this server.");
		const next = [...guilds(), guildId];
		store$1.watchedGuilds = next;
		setGuilds(next);
		setInput("");
		setError("");
		getSnap(guildId).then((snap) => setSnapCounts((s) => ({
			...s,
			[guildId]: Object.keys(snap).length
		})));
	}
	function remove(id) {
		const next = guilds().filter((g) => g !== id);
		store$1.watchedGuilds = next;
		deleteSnap(id);
		store$1.leaveHistory = (store$1.leaveHistory ?? []).filter((e) => e.guildId !== id);
		setGuilds(next);
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
		setMemberList((s) => {
			const n = { ...s };
			delete n[id];
			return n;
		});
		if (expanded() === id) setExpanded(null);
		setHistory([...store$1.leaveHistory ?? []]);
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
		for (const member of Object.values(raw)) {
			const u = extractUser(member);
			if (!u) continue;
			snap[u.id] = toSnapEntry(u);
		}
		await saveSnap(guildId, snap);
		setSnapCounts((s) => ({
			...s,
			[guildId]: Object.keys(snap).length
		}));
		setCheck((s) => ({
			...s,
			[guildId]: {
				phase: "checking",
				progress: `Cache: ${Object.keys(snap).length} members. Requesting full list from gateway…`
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
				progress: complete ? `Done: ${saved} members saved${total > 0 ? ` / ${total} total` : ""}.` : `Gateway didn't respond. Saved ${saved} from cache${total > 0 ? ` / ${total} total` : ""}. Browse the server to load more.`
			}
		}));
		if (expanded() === guildId) await loadMemberList(guildId);
	}
	async function loadMemberList(guildId) {
		const snap = await getSnap(guildId);
		const entries = Object.entries(snap).map(([uid, info]) => ({
			uid,
			name: info.globalName || info.username || "unknown",
			...info
		})).sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
		setMemberList((s) => ({
			...s,
			[guildId]: entries
		}));
	}
	async function toggleMemberList(guildId) {
		if (expanded() === guildId) setExpanded(null);
else {
			setExpanded(guildId);
			await loadMemberList(guildId);
		}
	}
	function clearLog() {
		store$1.leaveHistory = [];
		setHistory([]);
	}
	const tabBtn = (key, label) => (() => {
		const _el$47 = (0, import_web$13.getNextElement)(_tmpl$0);
		_el$47.$$click = () => {
			setTab(key);
			if (key === "log") setHistory([...store$1.leaveHistory ?? []]);
		};
		_el$47.style.setProperty("padding", "6px 16px");
		_el$47.style.setProperty("border-radius", "4px");
		_el$47.style.setProperty("border", "none");
		_el$47.style.setProperty("cursor", "pointer");
		_el$47.style.setProperty("font-size", "14px");
		(0, import_web$16.insert)(_el$47, label);
		(0, import_web$11.effect)((_p$) => {
			const _v$3 = tab() === key ? "700" : "400", _v$4 = tab() === key ? "var(--brand-experiment)" : "var(--background-secondary)", _v$5 = tab() === key ? "#fff" : "var(--text-muted)";
			_v$3 !== _p$._v$3 && _el$47.style.setProperty("font-weight", _p$._v$3 = _v$3);
			_v$4 !== _p$._v$4 && _el$47.style.setProperty("background", _p$._v$4 = _v$4);
			_v$5 !== _p$._v$5 && _el$47.style.setProperty("color", _p$._v$5 = _v$5);
			return _p$;
		}, {
			_v$3: undefined,
			_v$4: undefined,
			_v$5: undefined
		});
		(0, import_web$12.runHydrationEvents)();
		return _el$47;
	})();
	return (() => {
		const _el$48 = (0, import_web$13.getNextElement)(_tmpl$18), _el$49 = _el$48.firstChild, _el$50 = _el$49.nextSibling, _el$51 = _el$50.firstChild, [_el$52, _co$7] = (0, import_web$15.getNextMarker)(_el$51.nextSibling), _el$53 = _el$52.nextSibling, [_el$54, _co$8] = (0, import_web$15.getNextMarker)(_el$53.nextSibling), _el$81 = _el$50.nextSibling, [_el$82, _co$13] = (0, import_web$15.getNextMarker)(_el$81.nextSibling), _el$83 = _el$82.nextSibling, [_el$84, _co$14] = (0, import_web$15.getNextMarker)(_el$83.nextSibling);
		_el$48.style.setProperty("padding", "0 0 5px 0");
		_el$49.style.setProperty("color", "var(--header-primary)");
		_el$49.style.setProperty("font-size", "20px");
		_el$49.style.setProperty("font-weight", "700");
		_el$50.style.setProperty("display", "flex");
		_el$50.style.setProperty("gap", "6px");
		_el$50.style.setProperty("margin", "12px 0 16px");
		(0, import_web$16.insert)(_el$50, () => tabBtn("servers", "Watched Servers"), _el$52, _co$7);
		(0, import_web$16.insert)(_el$50, () => tabBtn("log", "Leave Log" + (store$1.leaveHistory?.length ? ` (${store$1.leaveHistory.length})` : "")), _el$54, _co$8);
		(0, import_web$16.insert)(_el$48, (0, import_web$14.createComponent)(import_solid_js.Show, {
			get when() {
				return tab() === "servers";
			},
			get children() {
				return [
					(() => {
						const _el$55 = (0, import_web$13.getNextElement)(_tmpl$1), _el$58 = _el$55.firstChild, [_el$59, _co$9] = (0, import_web$15.getNextMarker)(_el$58.nextSibling), _el$56 = _el$59.nextSibling, _el$57 = _el$56.nextSibling;
						_el$55.style.setProperty("display", "flex");
						_el$55.style.setProperty("gap", "8px");
						_el$55.style.setProperty("margin-bottom", "8px");
						(0, import_web$16.insert)(_el$55, (0, import_web$14.createComponent)(TextBox, {
							get value() {
								return input();
							},
							onInput: (v) => {
								setInput(v);
								setError("");
							},
							onKeyDown: (e) => e.key === "Enter" && add(),
							placeholder: "Server ID..."
						}), _el$59, _co$9);
						_el$56.$$click = () => add();
						_el$57.$$click = () => setShowPicker(true);
						(0, import_web$11.effect)((_p$) => {
							const _v$6 = btn("var(--button-positive-background)"), _v$7 = btn("var(--button-secondary-background)");
							_p$._v$6 = (0, import_web$9.style)(_el$56, _v$6, _p$._v$6);
							_p$._v$7 = (0, import_web$9.style)(_el$57, _v$7, _p$._v$7);
							return _p$;
						}, {
							_v$6: undefined,
							_v$7: undefined
						});
						(0, import_web$12.runHydrationEvents)();
						return _el$55;
					})(),
					(0, import_web$14.createComponent)(import_solid_js.Show, {
						get when() {
							return error();
						},
						get children() {
							const _el$60 = (0, import_web$13.getNextElement)(_tmpl$10);
							_el$60.style.setProperty("color", "var(--status-danger)");
							_el$60.style.setProperty("font-size", "13px");
							_el$60.style.setProperty("margin", "0 0 8px");
							(0, import_web$16.insert)(_el$60, error);
							return _el$60;
						}
					}),
					(0, import_web$14.createComponent)(import_solid_js.Show, {
						get when() {
							return showPicker();
						},
						get children() {
							return (0, import_web$14.createComponent)(GuildPickerModal, {
								get alreadyWatched() {
									return guilds();
								},
								onAdd: (id) => add(id),
								onClose: () => setShowPicker(false)
							});
						}
					}),
					(0, import_web$14.createComponent)(import_solid_js.Show, {
						get when() {
							return guilds().length === 0;
						},
						get children() {
							const _el$61 = (0, import_web$13.getNextElement)(_tmpl$11);
							_el$61.style.setProperty("color", "var(--text-muted)");
							return _el$61;
						}
					}),
					(0, import_web$14.createComponent)(import_solid_js.For, {
						get each() {
							return guilds();
						},
						children: (id) => {
							const cs = () => checkState()[id];
							const count = () => snapCounts()[id] ?? 0;
							const total = () => getTotalMemberCount(id);
							const incomplete = () => total() > 0 && count() < total();
							const isExpanded = () => expanded() === id;
							const members = () => memberList()[id] ?? [];
							const iconUrl = () => getGuildIcon(id);
							return (() => {
								const _el$85 = (0, import_web$13.getNextElement)(_tmpl$22), _el$86 = _el$85.firstChild, _el$87 = _el$86.firstChild, _el$88 = _el$87.firstChild, _el$93 = _el$88.firstChild, [_el$94, _co$15] = (0, import_web$15.getNextMarker)(_el$93.nextSibling), _el$90 = _el$94.nextSibling, _el$91 = _el$90.firstChild, _el$92 = _el$91.nextSibling, _el$95 = _el$88.nextSibling, _el$96 = _el$95.firstChild, _el$97 = _el$96.nextSibling, _el$98 = _el$87.nextSibling, _el$99 = _el$98.firstChild, _el$100 = _el$99.firstChild, _el$102 = _el$100.nextSibling, _el$103 = _el$102.nextSibling, [_el$104, _co$16] = (0, import_web$15.getNextMarker)(_el$103.nextSibling), _el$107 = _el$99.nextSibling, [_el$108, _co$17] = (0, import_web$15.getNextMarker)(_el$107.nextSibling), _el$109 = _el$108.nextSibling, [_el$110, _co$18] = (0, import_web$15.getNextMarker)(_el$109.nextSibling), _el$112 = _el$98.nextSibling, [_el$113, _co$19] = (0, import_web$15.getNextMarker)(_el$112.nextSibling), _el$120 = _el$86.nextSibling, [_el$121, _co$22] = (0, import_web$15.getNextMarker)(_el$120.nextSibling);
								_el$85.style.setProperty("margin-bottom", "6px");
								_el$85.style.setProperty("background", "var(--background-secondary)");
								_el$85.style.setProperty("border-radius", "6px");
								_el$85.style.setProperty("overflow", "hidden");
								_el$86.style.setProperty("padding", "10px 12px");
								_el$87.style.setProperty("display", "flex");
								_el$87.style.setProperty("align-items", "center");
								_el$87.style.setProperty("justify-content", "space-between");
								_el$87.style.setProperty("gap", "8px");
								_el$88.style.setProperty("display", "flex");
								_el$88.style.setProperty("align-items", "center");
								_el$88.style.setProperty("gap", "10px");
								_el$88.style.setProperty("min-width", "0");
								(0, import_web$16.insert)(_el$88, (0, import_web$14.createComponent)(import_solid_js.Show, {
									get when() {
										return iconUrl();
									},
									get fallback() {
										return (() => {
											const _el$122 = (0, import_web$13.getNextElement)(_tmpl$$1);
											_el$122.style.setProperty("width", "32px");
											_el$122.style.setProperty("height", "32px");
											_el$122.style.setProperty("border-radius", "50%");
											_el$122.style.setProperty("background", "var(--background-modifier-accent)");
											_el$122.style.setProperty("display", "flex");
											_el$122.style.setProperty("align-items", "center");
											_el$122.style.setProperty("justify-content", "center");
											_el$122.style.setProperty("flex-shrink", "0");
											_el$122.style.setProperty("font-size", "12px");
											_el$122.style.setProperty("color", "var(--text-muted)");
											(0, import_web$16.insert)(_el$122, () => (getGuildName$1(id) ?? "?")[0]?.toUpperCase());
											return _el$122;
										})();
									},
									get children() {
										const _el$89 = (0, import_web$13.getNextElement)(_tmpl$5);
										_el$89.style.setProperty("width", "32px");
										_el$89.style.setProperty("height", "32px");
										_el$89.style.setProperty("border-radius", "50%");
										_el$89.style.setProperty("object-fit", "cover");
										_el$89.style.setProperty("flex-shrink", "0");
										(0, import_web$11.effect)(() => (0, import_web$8.setAttribute)(_el$89, "src", iconUrl()));
										return _el$89;
									}
								}), _el$94, _co$15);
								_el$90.style.setProperty("min-width", "0");
								_el$91.style.setProperty("color", "var(--header-primary)");
								_el$91.style.setProperty("font-weight", "600");
								(0, import_web$16.insert)(_el$91, () => getGuildName$1(id) ?? "Unknown Server");
								_el$92.style.setProperty("color", "var(--text-muted)");
								_el$92.style.setProperty("font-size", "12px");
								_el$92.style.setProperty("margin-left", "8px");
								(0, import_web$16.insert)(_el$92, id);
								_el$95.style.setProperty("display", "flex");
								_el$95.style.setProperty("gap", "6px");
								_el$95.style.setProperty("flex-shrink", "0");
								_el$96.$$click = () => checkMembers(id);
								(0, import_web$16.insert)(_el$96, () => cs()?.phase === "checking" ? "Checking…" : "Check Members");
								_el$97.$$click = () => remove(id);
								_el$98.style.setProperty("margin-top", "6px");
								_el$98.style.setProperty("font-size", "12px");
								_el$98.style.setProperty("color", "var(--text-muted)");
								_el$98.style.setProperty("display", "flex");
								_el$98.style.setProperty("gap", "12px");
								_el$98.style.setProperty("flex-wrap", "wrap");
								_el$98.style.setProperty("align-items", "center");
								(0, import_web$16.insert)(_el$102, count);
								(0, import_web$16.insert)(_el$99, (0, import_web$14.createComponent)(import_solid_js.Show, {
									get when() {
										return total() > 0;
									},
									get children() {
										return [
											" / ",
											(0, import_web$7.memo)(() => total()),
											" on server"
										];
									}
								}), _el$104, _co$16);
								(0, import_web$16.insert)(_el$98, (0, import_web$14.createComponent)(import_solid_js.Show, {
									get when() {
										return (0, import_web$7.memo)(() => !!incomplete())() && !cs();
									},
									get children() {
										const _el$105 = (0, import_web$13.getNextElement)(_tmpl$19);
										_el$105.style.setProperty("color", "var(--text-warning)");
										_el$105.style.setProperty("font-size", "11px");
										return _el$105;
									}
								}), _el$108, _co$17);
								(0, import_web$16.insert)(_el$98, (0, import_web$14.createComponent)(import_solid_js.Show, {
									get when() {
										return count() > 0;
									},
									get children() {
										const _el$106 = (0, import_web$13.getNextElement)(_tmpl$0);
										_el$106.$$click = () => toggleMemberList(id);
										_el$106.style.setProperty("background", "none");
										_el$106.style.setProperty("border", "none");
										_el$106.style.setProperty("cursor", "pointer");
										_el$106.style.setProperty("color", "var(--text-link)");
										_el$106.style.setProperty("font-size", "12px");
										_el$106.style.setProperty("padding", "0");
										(0, import_web$16.insert)(_el$106, (() => {
											const _c$2 = (0, import_web$7.memo)(() => !!isExpanded());
											return () => _c$2() ? "Hide members" : `Show all ${count()} members`;
										})());
										(0, import_web$12.runHydrationEvents)();
										return _el$106;
									}
								}), _el$110, _co$18);
								(0, import_web$16.insert)(_el$86, (0, import_web$14.createComponent)(import_solid_js.Show, {
									get when() {
										return cs()?.progress;
									},
									get children() {
										const _el$111 = (0, import_web$13.getNextElement)(_tmpl$10);
										_el$111.style.setProperty("font-size", "12px");
										_el$111.style.setProperty("margin-top", "6px");
										_el$111.style.setProperty("margin-bottom", "0");
										(0, import_web$16.insert)(_el$111, () => cs().progress);
										(0, import_web$11.effect)(() => _el$111.style.setProperty("color", cs()?.phase === "done" ? cs()?.complete ? "var(--text-positive)" : "var(--text-warning)" : "var(--text-muted)"));
										return _el$111;
									}
								}), _el$113, _co$19);
								(0, import_web$16.insert)(_el$85, (0, import_web$14.createComponent)(import_solid_js.Show, {
									get when() {
										return isExpanded();
									},
									get children() {
										const _el$114 = (0, import_web$13.getNextElement)(_tmpl$21), _el$116 = _el$114.firstChild, [_el$117, _co$20] = (0, import_web$15.getNextMarker)(_el$116.nextSibling), _el$118 = _el$117.nextSibling, [_el$119, _co$21] = (0, import_web$15.getNextMarker)(_el$118.nextSibling);
										_el$114.style.setProperty("border-top", "1px solid var(--background-modifier-accent)");
										_el$114.style.setProperty("max-height", "280px");
										_el$114.style.setProperty("overflow-y", "auto");
										(0, import_web$16.insert)(_el$114, (0, import_web$14.createComponent)(import_solid_js.Show, {
											get when() {
												return members().length === 0;
											},
											get children() {
												const _el$115 = (0, import_web$13.getNextElement)(_tmpl$20);
												_el$115.style.setProperty("color", "var(--text-muted)");
												_el$115.style.setProperty("padding", "10px 12px");
												_el$115.style.setProperty("margin", "0");
												return _el$115;
											}
										}), _el$117, _co$20);
										(0, import_web$16.insert)(_el$114, (0, import_web$14.createComponent)(import_solid_js.For, {
											get each() {
												return members();
											},
											children: (entry) => (() => {
												const _el$123 = (0, import_web$13.getNextElement)(_tmpl$24), _el$124 = _el$123.firstChild, _el$129 = _el$124.firstChild, [_el$130, _co$24] = (0, import_web$15.getNextMarker)(_el$129.nextSibling), _el$131 = _el$130.nextSibling, [_el$132, _co$25] = (0, import_web$15.getNextMarker)(_el$131.nextSibling), _el$133 = _el$124.nextSibling;
												_el$123.style.setProperty("display", "flex");
												_el$123.style.setProperty("justify-content", "space-between");
												_el$123.style.setProperty("align-items", "center");
												_el$123.style.setProperty("padding", "5px 12px");
												_el$123.style.setProperty("border-bottom", "1px solid var(--background-modifier-accent)");
												_el$123.style.setProperty("font-size", "13px");
												_el$124.style.setProperty("color", "var(--header-primary)");
												(0, import_web$16.insert)(_el$124, () => entry.name, _el$130, _co$24);
												(0, import_web$16.insert)(_el$124, (0, import_web$14.createComponent)(import_solid_js.Show, {
													get when() {
														return entry.username && entry.globalName && entry.username !== entry.globalName;
													},
													get children() {
														const _el$125 = (0, import_web$13.getNextElement)(_tmpl$23), _el$126 = _el$125.firstChild, _el$127 = _el$126.nextSibling, [_el$128, _co$23] = (0, import_web$15.getNextMarker)(_el$127.nextSibling);
														_el$125.style.setProperty("color", "var(--text-muted)");
														_el$125.style.setProperty("margin-left", "6px");
														_el$125.style.setProperty("font-size", "11px");
														(0, import_web$16.insert)(_el$125, () => entry.username, _el$128, _co$23);
														return _el$125;
													}
												}), _el$132, _co$25);
												_el$133.style.setProperty("color", "var(--text-muted)");
												_el$133.style.setProperty("font-size", "11px");
												_el$133.style.setProperty("font-family", "monospace");
												_el$133.style.setProperty("flex-shrink", "0");
												_el$133.style.setProperty("margin-left", "12px");
												(0, import_web$16.insert)(_el$133, () => entry.uid);
												return _el$123;
											})()
										}), _el$119, _co$21);
										return _el$114;
									}
								}), _el$121, _co$22);
								(0, import_web$11.effect)((_p$) => {
									const _v$8 = btn("var(--button-secondary-background)", { opacity: cs()?.phase === "checking" ? "0.6" : "1" }), _v$9 = btn("var(--button-danger-background)"), _v$0 = incomplete() ? "var(--text-warning)" : "var(--text-positive)";
									_p$._v$8 = (0, import_web$9.style)(_el$96, _v$8, _p$._v$8);
									_p$._v$9 = (0, import_web$9.style)(_el$97, _v$9, _p$._v$9);
									_v$0 !== _p$._v$0 && _el$102.style.setProperty("color", _p$._v$0 = _v$0);
									return _p$;
								}, {
									_v$8: undefined,
									_v$9: undefined,
									_v$0: undefined
								});
								(0, import_web$12.runHydrationEvents)();
								return _el$85;
							})();
						}
					}),
					(0, import_web$14.createComponent)(import_solid_js.Show, {
						get when() {
							return guilds().length > 0;
						},
						get children() {
							const _el$62 = (0, import_web$13.getNextElement)(_tmpl$12);
							_el$62.style.setProperty("color", "var(--text-muted)");
							_el$62.style.setProperty("font-size", "12px");
							_el$62.style.setProperty("margin-top", "10px");
							return _el$62;
						}
					})
				];
			}
		}), _el$82, _co$13);
		(0, import_web$16.insert)(_el$48, (0, import_web$14.createComponent)(import_solid_js.Show, {
			get when() {
				return tab() === "log";
			},
			get children() {
				return [
					(() => {
						const _el$63 = (0, import_web$13.getNextElement)(_tmpl$13), _el$64 = _el$63.firstChild, _el$65 = _el$64.nextSibling, [_el$66, _co$0] = (0, import_web$15.getNextMarker)(_el$65.nextSibling);
						_el$63.style.setProperty("display", "flex");
						_el$63.style.setProperty("gap", "8px");
						_el$63.style.setProperty("margin-bottom", "10px");
						_el$63.style.setProperty("align-items", "center");
						_el$64.style.setProperty("flex", "1");
						(0, import_web$16.insert)(_el$64, (0, import_web$14.createComponent)(TextBox, {
							get value() {
								return logSearch();
							},
							onInput: (v) => setLogSearch(v),
							placeholder: "Search by username or user ID…"
						}));
						(0, import_web$16.insert)(_el$63, (0, import_web$14.createComponent)(import_solid_js.Show, {
							get when() {
								return logGuildOptions().length > 1;
							},
							get children() {
								return (0, import_web$14.createComponent)(DarkSelect, {
									value: logGuild,
									onChange: (v) => setLogGuild(v),
									get options() {
										return [{
											value: "all",
											label: "All servers"
										}, ...logGuildOptions().map(([guildId, name]) => ({
											value: guildId,
											label: name
										}))];
									}
								});
							}
						}), _el$66, _co$0);
						return _el$63;
					})(),
					(() => {
						const _el$67 = (0, import_web$13.getNextElement)(_tmpl$15), _el$68 = _el$67.firstChild, _el$70 = _el$68.firstChild, [_el$71, _co$1] = (0, import_web$15.getNextMarker)(_el$70.nextSibling), _el$72 = _el$71.nextSibling, [_el$73, _co$10] = (0, import_web$15.getNextMarker)(_el$72.nextSibling), _el$69 = _el$73.nextSibling, _el$74 = _el$69.nextSibling, [_el$75, _co$11] = (0, import_web$15.getNextMarker)(_el$74.nextSibling), _el$77 = _el$68.nextSibling, [_el$78, _co$12] = (0, import_web$15.getNextMarker)(_el$77.nextSibling);
						_el$67.style.setProperty("display", "flex");
						_el$67.style.setProperty("justify-content", "space-between");
						_el$67.style.setProperty("align-items", "center");
						_el$67.style.setProperty("margin-bottom", "12px");
						_el$68.style.setProperty("color", "var(--text-muted)");
						_el$68.style.setProperty("font-size", "13px");
						(0, import_web$16.insert)(_el$68, () => filteredHistory().length, _el$71, _co$1);
						(0, import_web$16.insert)(_el$68, (() => {
							const _c$ = (0, import_web$7.memo)(() => filteredHistory().length !== history().length);
							return () => _c$() ? ` / ${history().length}` : "";
						})(), _el$73, _co$10);
						(0, import_web$16.insert)(_el$68, () => history().length !== 1 ? "s" : "", _el$75, _co$11);
						(0, import_web$16.insert)(_el$67, (0, import_web$14.createComponent)(import_solid_js.Show, {
							get when() {
								return history().length > 0;
							},
							get children() {
								const _el$76 = (0, import_web$13.getNextElement)(_tmpl$14);
								_el$76.$$click = clearLog;
								(0, import_web$11.effect)((_$p) => (0, import_web$9.style)(_el$76, btn("var(--button-danger-background)"), _$p));
								(0, import_web$12.runHydrationEvents)();
								return _el$76;
							}
						}), _el$78, _co$12);
						return _el$67;
					})(),
					(0, import_web$14.createComponent)(import_solid_js.Show, {
						get when() {
							return history().length === 0;
						},
						get children() {
							const _el$79 = (0, import_web$13.getNextElement)(_tmpl$16);
							_el$79.style.setProperty("color", "var(--text-muted)");
							return _el$79;
						}
					}),
					(0, import_web$14.createComponent)(import_solid_js.Show, {
						get when() {
							return (0, import_web$7.memo)(() => history().length > 0)() && filteredHistory().length === 0;
						},
						get children() {
							const _el$80 = (0, import_web$13.getNextElement)(_tmpl$17);
							_el$80.style.setProperty("color", "var(--text-muted)");
							return _el$80;
						}
					}),
					(0, import_web$14.createComponent)(import_solid_js.For, {
						get each() {
							return filteredHistory();
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
								const _el$134 = (0, import_web$13.getNextElement)(_tmpl$25), _el$135 = _el$134.firstChild, _el$136 = _el$135.firstChild, _el$137 = _el$136.firstChild, _el$138 = _el$137.nextSibling, _el$139 = _el$138.firstChild, _el$141 = _el$139.nextSibling, [_el$142, _co$26] = (0, import_web$15.getNextMarker)(_el$141.nextSibling), _el$140 = _el$142.nextSibling, _el$143 = _el$136.nextSibling, _el$144 = _el$135.nextSibling, _el$145 = _el$144.firstChild, _el$146 = _el$145.nextSibling, [_el$147, _co$27] = (0, import_web$15.getNextMarker)(_el$146.nextSibling);
								_el$134.addEventListener("mouseleave", (e) => e.currentTarget.style.background = "var(--background-secondary)");
								_el$134.addEventListener("mouseenter", (e) => e.currentTarget.style.background = "var(--background-modifier-hover)");
								_el$134.$$click = () => openProfile(entry.userId, entry.guildId);
								_el$134.style.setProperty("padding", "8px 12px");
								_el$134.style.setProperty("margin-bottom", "4px");
								_el$134.style.setProperty("background", "var(--background-secondary)");
								_el$134.style.setProperty("border-radius", "6px");
								_el$134.style.setProperty("border-left", "3px solid var(--status-danger)");
								_el$134.style.setProperty("cursor", "pointer");
								_el$134.style.setProperty("transition", "background 0.1s");
								_el$135.style.setProperty("display", "flex");
								_el$135.style.setProperty("justify-content", "space-between");
								_el$135.style.setProperty("align-items", "center");
								_el$137.style.setProperty("color", "var(--header-primary)");
								_el$137.style.setProperty("font-weight", "600");
								(0, import_web$16.insert)(_el$137, name);
								_el$138.style.setProperty("color", "var(--text-muted)");
								_el$138.style.setProperty("font-size", "12px");
								_el$138.style.setProperty("margin-left", "6px");
								(0, import_web$16.insert)(_el$138, () => entry.userId, _el$142, _co$26);
								_el$143.style.setProperty("color", "var(--text-muted)");
								_el$143.style.setProperty("font-size", "12px");
								(0, import_web$16.insert)(_el$143, () => formatTime(entry.timestamp));
								_el$144.style.setProperty("color", "var(--text-muted)");
								_el$144.style.setProperty("font-size", "13px");
								_el$144.style.setProperty("margin-top", "2px");
								(0, import_web$16.insert)(_el$144, guild, _el$147, _co$27);
								(0, import_web$12.runHydrationEvents)();
								return _el$134;
							})();
						}
					})
				];
			}
		}), _el$84, _co$14);
		return _el$48;
	})();
}
(0, import_web$6.delegateEvents)(["click", "input"]);

//#endregion
//#region plugins/ServerSentinel/index.jsx
var import_web = __toESM(require_web(), 1);
var import_web$1 = __toESM(require_web(), 1);
var import_web$2 = __toESM(require_web(), 1);
var import_web$3 = __toESM(require_web(), 1);
var import_web$4 = __toESM(require_web(), 1);
const _tmpl$ = /*#__PURE__*/ (0, import_web.template)(`<div><div><img><div><div></div><div></div></div></div><div><div><span>Server</span><span></span></div><div><span>User ID</span><span></span></div></div></div>`, 25);
const { flux: { dispatcher, stores }, plugin: { store }, ui: { showToast }, settings: { registerSection } } = shelter;
const MAX_HISTORY = 400;
const seenThisSession = new Map();
let unregMain = null;
let toastStyleEl = null;
let reloadModalEl = null;
function showReloadModal() {
	if (reloadModalEl) return;
	reloadModalEl = (0, import_web$4.createComponent)(ReloadModal, { onClose: () => removeReloadModal() });
	document.body.appendChild(reloadModalEl);
}
function removeReloadModal() {
	reloadModalEl?.remove();
	reloadModalEl = null;
}
function bootstrapStore() {
	if (store.watchedGuilds == null) store.watchedGuilds = [];
	if (store.leaveHistory == null) store.leaveHistory = [];
	if (store.enabled == null) store.enabled = true;
	if (store.shownReloadHint == null) store.shownReloadHint = false;
}
function injectToastStyle() {
	toastStyleEl = document.createElement("style");
	toastStyleEl.id = "sentinel-toast-style";
	toastStyleEl.textContent = `
    [class*="_toast_"][class*="_info_"] {
      padding: 0 !important;
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
    }
    [class*="_toast_"][class*="_info_"] > div > span[class*="_text_"] {
      padding: 0 !important;
    }
  `;
	document.head.appendChild(toastStyleEl);
}
function removeToastStyle() {
	toastStyleEl?.remove();
	toastStyleEl = null;
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
function getUserFromStore(userId) {
	try {
		return stores.UserStore?.getUser(userId) ?? null;
	} catch {
		return null;
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
function extractCacheMembers(guildId) {
	const raw = getRawMembers(guildId);
	const result = {};
	for (const member of Object.values(raw)) {
		const u = extractUser(member);
		if (!u) continue;
		result[u.id] = toSnapEntry(u);
		markSeen(guildId, u.id);
	}
	return result;
}
function getAvatarUrl(userId, avatarHash) {
	if (avatarHash) {
		const ext = avatarHash.startsWith("a_") ? "gif" : "webp";
		return `https://cdn.discordapp.com/avatars/${userId}/${avatarHash}.${ext}?size=64`;
	}
	const index = Number(BigInt(userId) % 6n);
	return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}
function makeToastContent(entry) {
	const name = entry.globalName || entry.username || "Unknown";
	const handle = entry.username && entry.username !== "unknown" ? entry.username : null;
	const avatarUrl = getAvatarUrl(entry.userId, entry.avatar ?? null);
	return (() => {
		const _el$ = (0, import_web$1.getNextElement)(_tmpl$), _el$2 = _el$.firstChild, _el$3 = _el$2.firstChild, _el$4 = _el$3.nextSibling, _el$5 = _el$4.firstChild, _el$6 = _el$5.nextSibling, _el$7 = _el$2.nextSibling, _el$8 = _el$7.firstChild, _el$9 = _el$8.firstChild, _el$0 = _el$9.nextSibling, _el$1 = _el$8.nextSibling, _el$10 = _el$1.firstChild, _el$11 = _el$10.nextSibling;
		_el$.style.setProperty("background", "#111214");
		_el$.style.setProperty("border", "1px solid #2e2f33");
		_el$.style.setProperty("border-radius", "10px");
		_el$.style.setProperty("overflow", "hidden");
		_el$.style.setProperty("width", "260px");
		_el$2.style.setProperty("padding", "13px 15px");
		_el$2.style.setProperty("display", "flex");
		_el$2.style.setProperty("align-items", "center");
		_el$2.style.setProperty("gap", "11px");
		_el$2.style.setProperty("border-bottom", "1px solid #1e1f22");
		(0, import_web$3.setAttribute)(_el$3, "src", avatarUrl);
		_el$3.style.setProperty("width", "40px");
		_el$3.style.setProperty("height", "40px");
		_el$3.style.setProperty("border-radius", "50%");
		_el$3.style.setProperty("object-fit", "cover");
		_el$3.style.setProperty("display", "block");
		_el$3.style.setProperty("flex-shrink", "0");
		_el$4.style.setProperty("min-width", "0");
		_el$5.style.setProperty("font-size", "14px");
		_el$5.style.setProperty("font-weight", "600");
		_el$5.style.setProperty("color", "#dbdee1");
		_el$5.style.setProperty("white-space", "nowrap");
		_el$5.style.setProperty("overflow", "hidden");
		_el$5.style.setProperty("text-overflow", "ellipsis");
		(0, import_web$2.insert)(_el$5, name);
		_el$6.style.setProperty("font-size", "12px");
		_el$6.style.setProperty("color", "#6d6f78");
		(0, import_web$2.insert)(_el$6, handle ? `@${handle}` : "");
		_el$7.style.setProperty("padding", "9px 15px");
		_el$7.style.setProperty("display", "flex");
		_el$7.style.setProperty("flex-direction", "column");
		_el$7.style.setProperty("gap", "6px");
		_el$8.style.setProperty("display", "flex");
		_el$8.style.setProperty("justify-content", "space-between");
		_el$8.style.setProperty("align-items", "center");
		_el$9.style.setProperty("font-size", "10px");
		_el$9.style.setProperty("color", "#4e5058");
		_el$9.style.setProperty("text-transform", "uppercase");
		_el$9.style.setProperty("letter-spacing", ".5px");
		_el$0.style.setProperty("font-size", "12px");
		_el$0.style.setProperty("color", "#b5bac1");
		(0, import_web$2.insert)(_el$0, () => entry.guildName);
		_el$1.style.setProperty("display", "flex");
		_el$1.style.setProperty("justify-content", "space-between");
		_el$1.style.setProperty("align-items", "center");
		_el$10.style.setProperty("font-size", "10px");
		_el$10.style.setProperty("color", "#4e5058");
		_el$10.style.setProperty("text-transform", "uppercase");
		_el$10.style.setProperty("letter-spacing", ".5px");
		_el$11.style.setProperty("font-size", "10px");
		_el$11.style.setProperty("color", "#4e5058");
		_el$11.style.setProperty("font-family", "monospace");
		(0, import_web$2.insert)(_el$11, () => entry.userId);
		return _el$;
	})();
}
function recordLeave(entry) {
	store.leaveHistory = [entry, ...store.leaveHistory].slice(0, MAX_HISTORY);
	if (!store.enabled) return;
	const close = showToast({
		content: makeToastContent(entry),
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
			const fromStore = getUserFromStore(u.id);
			snap[u.id] = {
				...toSnapEntry(u),
				avatar: fromStore?.avatar ?? null
			};
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
		const snapEntry = snap[user.id] ?? null;
		if (snapEntry) {
			delete snap[user.id];
			saveSnap(guildId, snap);
		}
		if (!store.enabled) return;
		const fromStore = getUserFromStore(user.id);
		const username = fromStore?.username ?? user.username ?? snapEntry?.username ?? "unknown";
		const globalName = fromStore?.globalName ?? fromStore?.global_name ?? user.global_name ?? user.globalName ?? snapEntry?.globalName ?? null;
		const discriminator = fromStore?.discriminator ?? user.discriminator ?? snapEntry?.discriminator ?? "0";
		const avatar = fromStore?.avatar ?? user.avatar ?? snapEntry?.avatar ?? null;
		recordLeave({
			guildId,
			guildName: getGuildName(guildId),
			userId: user.id,
			username,
			globalName,
			discriminator,
			avatar,
			timestamp: Date.now()
		});
	});
}
function onMemberAdd({ guildId, member }) {
	if (!store.watchedGuilds.includes(guildId)) return;
	const u = extractUser(member);
	if (!u) return;
	markSeen(guildId, u.id);
	const fromStore = getUserFromStore(u.id);
	getSnap(guildId).then((snap) => {
		snap[u.id] = {
			...toSnapEntry(u),
			avatar: fromStore?.avatar ?? null
		};
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
				const fromStore = getUserFromStore(u.id);
				snap[u.id] = {
					...toSnapEntry(u),
					avatar: fromStore?.avatar ?? null
				};
				changed = true;
			}
		}
		if (changed) saveSnap(guildId, snap);
	});
}
function onConnectionOpen() {
	for (const guildId of store.watchedGuilds) {
		getSnap(guildId).then((snap) => {
			for (const uid of Object.keys(snap)) markSeen(guildId, uid);
		});
		for (const m of Object.values(getRawMembers(guildId))) {
			const u = extractUser(m);
			if (u) markSeen(guildId, u.id);
		}
	}
}
function onLoad() {
	bootstrapStore();
	seenThisSession.clear();
	injectToastStyle();
	if (!store.shownReloadHint) {
		store.shownReloadHint = true;
		showReloadModal();
	}
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
	removeToastStyle();
	removeReloadModal();
	dispatcher.unsubscribe("CONNECTION_OPEN", onConnectionOpen);
	dispatcher.unsubscribe("GUILD_MEMBER_REMOVE", onMemberRemove);
	dispatcher.unsubscribe("GUILD_MEMBER_ADD", onMemberAdd);
	dispatcher.unsubscribe("GUILD_MEMBER_LIST_UPDATE", onMemberListUpdate);
	dispatcher.unsubscribe("GUILD_MEMBERS_CHUNK", onGuildMembersChunk);
	unregMain?.();
}

//#endregion
exports.extractCacheMembers = extractCacheMembers
exports.getRawMembers = getRawMembers
exports.getTotalMemberCount = getTotalMemberCount
exports.onLoad = onLoad
exports.onUnload = onUnload
return exports;
})({});