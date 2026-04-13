# shelter plugins

A collection of plugins for [shelter](https://shelter.uwu.network/).

---

## Plugins

### ServerSentinel 👁️

Watches your Discord servers and notifies you whenever someone leaves.

**Features**
- **Live detection** - instant toast notification when someone leaves while you're online. Click to dismiss.
- **Leave Log** - full history of every departure with username, user ID, server, and timestamp. Accessible from Discord's settings sidebar under **Settings**.
- **Zero API calls** - reads entirely from Discord's internal Flux stores and gateway events. No HTTP requests, no selfbot risk, no rate limits.

**Usage**
1. Open Discord settings.
2. Paste a **Server ID** and click **Add**
   - To copy a Server ID: right-click a server icon -> *Copy Server ID* (requires Developer Mode in `Settings -> Advanced`)
3. Leave notifications will appear as toasts and be logged in the **ServerSentinel -> Leave Log** tab

---

*Made by ItsAlexIK*