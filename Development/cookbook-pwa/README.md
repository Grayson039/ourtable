# My Cookbook PWA

Your personal AI-powered recipe cookbook — save TikTok recipes from screenshots, plan meals, and build grocery lists.

---

## 🚀 Deploy to Netlify (5 minutes)

### Option A — Drag & Drop (easiest, no account needed)
1. Go to **https://app.netlify.com/drop**
2. Drag the entire `cookbook-pwa` folder onto the page
3. Wait ~10 seconds — you'll get a live URL like `https://amazing-dish-abc123.netlify.app`
4. Done! Share the link or add it to your home screen.

### Option B — Free account (keeps your URL stable)
1. Sign up free at **https://netlify.com**
2. New site → Deploy manually → drag the folder
3. Optional: rename your site to something like `my-cookbook-will` for a cleaner URL

---

## 📱 Add to iPhone Home Screen

1. Open your Netlify URL in **Safari** (must be Safari, not Chrome)
2. Tap the **Share button** (box with arrow pointing up)
3. Scroll down and tap **"Add to Home Screen"**
4. Name it "Cookbook" and tap **Add**

It will appear as a full-screen app with its own icon — no browser bar, just like a native app.

---

## 🔑 Setting Up Your API Key

The app needs an Anthropic API key to read screenshots with AI.

1. Go to **https://console.anthropic.com/keys**
2. Create a new key (free tier works — ~$5 of credit is plenty for hundreds of recipes)
3. Open the app → the "Add" tab has a field at the bottom — paste your key and tap Save
4. Your key is stored **only on your device** — never sent anywhere except Anthropic's API

---

## 📲 Phase 2 — Automation (coming next)

Once deployed, we'll build:
- **iPhone Shortcut** — share a screenshot from TikTok directly to the app
- **Make.com pipeline** — auto-processes the image and saves to your cookbook
- **Supabase database** — syncs recipes across your phone and your wife's phone

---

## 📁 File Structure

```
cookbook-pwa/
├── index.html      ← App shell & HTML structure
├── style.css       ← All styling (mobile-first, dark-safe)
├── app.js          ← All app logic (recipes, grocery, planner)
├── sw.js           ← Service worker (offline support)
├── manifest.json   ← PWA metadata (icon, name, display mode)
└── icons/
    ├── icon-192.png
    └── icon-512.png
```

---

## 🛠️ Local Development

Just open `index.html` in a browser. No build step, no dependencies.

For service worker testing, run a local server:
```bash
npx serve .
# or
python3 -m http.server 8080
```

---

## Features

- 📸 **Screenshot import** — drop a TikTok screenshot, AI extracts the full recipe
- 📖 **Cookbook** — searchable recipe grid with photos
- 📅 **Meal planner** — plan breakfast/lunch/dinner/snacks for the whole week
- 🛒 **Grocery list** — auto-categorized by store section, check off as you shop
- ✅ **Works offline** — service worker caches the app shell
- 💾 **Persistent storage** — everything saved in localStorage
