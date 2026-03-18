# ServerSentinel 👁️

A [shelter](https://shelter.uwu.network/) plugin that watches your Discord servers and notifies you whenever someone leaves — even if you were offline when it happened.

---

## What it does

- **Live detection** — someone gets kicked, banned, or rage-quits while you're online? You get a toast notification instantly. Click it to dismiss.
- **Offline detection** — came back after a few days and someone vanished? ServerSentinel compares a local snapshot of who was in the server against who's there now and tells you who's gone.
- **Leave Log** — a dedicated section in Discord's settings sidebar with a full history of every departure, including the user's ID, server name, timestamp, and whether it happened while you were offline.
- **Zero API calls** — everything is read from Discord's own internal Flux stores and gateway events. No HTTP requests, no selfbot risk, no rate limits.

---

## Usage

1. Open **User Settings → ServerSentinel**
2. Paste a **Server ID** and click **Add** (or press Enter)
   - To copy a Server ID: right-click a server icon → *Copy Server ID* (requires Developer Mode in `Settings → Advanced`)
3. That's it. Leave notifications will appear as toasts and be logged in **User Settings → Leave Log**

---

## How the offline detection works

> **Large server note:** Discord lazy-loads members — it only sends the full list on connect for servers with fewer than ~150 members. For bigger servers the snapshot grows gradually as you browse channels, making offline detection more accurate over time.

---

*Made by ItsAlexIK*