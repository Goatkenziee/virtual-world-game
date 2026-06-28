# Virtual World Game — BRAIN.md

## What this app does
A 2D virtual world game built with Next.js + HTML Canvas. You control a character with arrow keys (↑ ↓ ← →) and explore a colorful 50x40 tile world filled with 30 AI-controlled "People" (bot characters). Each bot has a unique name, color, and personality — they roam around, and when you walk near them they say hello! The world has houses, trees, flowers, lamps, benches, paths, and signs. Similar to the game "Play Together."

## Tech stack
- **Framework:** Next.js 14.2.5 (App Router)
- **Language:** TypeScript
- **Rendering:** HTML5 Canvas (custom game loop at 60fps)
- **Styling:** Tailwind CSS v3 + custom dark theme
- **UI Components:** Custom Button, Card components with lucide-react icons
- **State:** React useState/useRef + canvas imperative rendering

## Architecture
```
app/
  layout.tsx       — Root layout with metadata, fonts, viewport
  page.tsx         — Main page: top bar, sidebar, help overlay, game canvas
  globals.css      — Tailwind directives + custom animations
components/
  game/
    GameCanvas.tsx — Full game engine: world, player, AI bots, rendering loop
  ui/
    button.tsx     — Reusable button (default/ghost/outline variants)
    card.tsx       — Reusable card component
lib/
  utils.ts         — cn() utility (clsx + tailwind-merge)
pages/
  _app.tsx         — Next.js pages router app wrapper
  _document.tsx    — Next.js document wrapper (fixes build error)
```

## GameCanvas.tsx internals
- **World size:** 50 columns × 40 rows (each tile = 32px)
- **Tile types:** Grass (0), Path (1), House Wall (2), House Roof (3), Tree (4), Flowers (5), Fence (6), Water (7), Bridge (8), Lamp (9), Bench (10), Sign (11)
- **Player:** Drawn as a colored circle with eyes, moves with arrow keys at 2px/frame
- **AI Bots (People):** 30 bots with randomized names, colors, positions. Each bot wanders randomly, changes direction every 2-5 seconds. When player is within 80px of a bot, it stops and displays a speech bubble with a greeting.
- **Camera:** Follows the player, centered on screen, clamped to world bounds
- **Collision:** Simple tile-based — walls, trees, water, fences are blocked
- **Rendering:** `requestAnimationFrame` loop, draws world tiles → entities → UI overlay

## Current state — DONE
- [x] Full game engine with 50x40 tile world
- [x] Player movement with arrow keys
- [x] 30 AI bot "People" with names, colors, roaming AI
- [x] Speech bubbles when near bots
- [x] Camera follow system
- [x] Collision with walls, trees, water, fences
- [x] UI: top bar, sidebar, help overlay, mobile-friendly layout
- [x] Production build compiles successfully (fixed with pages/_document.tsx)
- [x] GitHub repo: https://github.com/Goatkenziee/virtual-world-game
- [ ] Vercel deploy — needs Vercel token reconnection

## Known issues
- Vercel integration token expired. Needs reconnection at Settings → Integrations → Vercel → Reconnect, then re-run deploy.

## Future ideas
- Multiplayer support (WebSocket/WebRTC)
- Chat system between players
- More world zones / biomes
- Click-to-interact with bots (dialogue trees)
- Inventory / items
- Sound effects and music
