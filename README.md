# ✦ TIC · TAC · TOE — Online Multiplayer

Real-time 2-player Tic-Tac-Toe. Play from any device, anywhere.

---

## 🚀 Deploy FREE in 2 minutes (Glitch.com — Recommended)

1. Go to **https://glitch.com** → Sign up free (use Google)
2. Click **"New Project"** → **"Import from GitHub"**
   - OR click **"glitch-hello-node"** starter, then replace files manually
3. In the Glitch editor, create these 3 files by pasting the code:
   - `server.js`
   - `package.json`
   - `public/index.html`
4. Glitch auto-installs and runs it. Click **"Share"** → copy the live URL
5. Send the URL to your friend — that's it! 🎉

---

## 🖥️ Run Locally (same Wi-Fi)

```bash
# Install Node.js first from nodejs.org, then:
npm install
npm start

# Open http://localhost:3000 in browser
# Share your local IP (e.g. http://192.168.1.5:3000) with friend on same Wi-Fi
```

---

## 🌐 Other Free Hosting Options

| Platform | Steps |
|----------|-------|
| **Railway.app** | Connect GitHub repo → auto deploy |
| **Render.com** | New Web Service → paste repo URL |
| **Fly.io** | `flyctl launch` (needs CLI) |

---

## How to Play

1. Player 1 → **Create Room** → share the 5-letter code
2. Player 2 → **Join Room** → enter the code
3. Take turns clicking the board
4. Win 3 in a row (horizontal, vertical, diagonal)
5. Rematch as many times as you want! Scores are tracked.

---

## Features

- ⚡ Real-time moves via Socket.io WebSockets
- 🏠 Room system with unique 5-char codes
- 📱 Works on mobile & desktop
- 🏆 Score tracking across rematches
- 👾 Handles disconnects gracefully
- 🎨 Retro-futuristic neon UI
