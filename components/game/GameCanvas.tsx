"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────
interface Bot {
  id: string;
  name: string;
  x: number;
  y: number;
  dir: number;
  frame: number;
  moveTimer: number;
  color: string;
  hatColor: string;
  emoji: string;
  speed: number;
  personality: string;
  chatText: string;
  chatTimer: number;
  targetX: number;
  targetY: number;
}

interface Player {
  x: number;
  y: number;
  dir: number;
  frame: number;
}

interface WorldItem {
  type: "tree" | "house" | "bush" | "flower" | "lamp" | "bench" | "sign";
  x: number;
  y: number;
  color?: string;
}

interface ChatBubble {
  x: number;
  y: number;
  text: string;
  timer: number;
  color: string;
}

// ─── Constants ───────────────────────────────────────────────────────
const TILE = 32;
const COLS = 50;
const ROWS = 40;
const WORLD_W = COLS * TILE;
const WORLD_H = ROWS * TILE;
const PLAYER_SPEED = 2.5;
const CAM_SMOOTH = 0.08;

const BOT_NAMES = [
  "Alice", "Bob", "Charlie", "Daisy", "Eli", "Fiona", "George", "Hannah",
  "Ivy", "Jack", "Kai", "Luna", "Milo", "Nina", "Oscar", "Piper",
  "Quinn", "Riley", "Sam", "Tara", "Uma", "Vince", "Wren", "Xia",
  "Yuki", "Zara", "Aria", "Ben", "Cora", "Dash",
];

const BOT_COLORS = [
  "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7",
  "#DDA0DD", "#98D8C8", "#F7DC6F", "#BB8FCE", "#85C1E9",
  "#F1948A", "#82E0AA", "#F8C471", "#AED6F1", "#D2B4DE",
];

const HAT_COLORS = [
  "#E74C3C", "#3498DB", "#2ECC71", "#F39C12", "#9B59B6",
  "#1ABC9C", "#E67E22", "#34495E", "#16A085", "#C0392B",
];

const BOT_EMOJIS = ["😊", "😎", "🤗", "😄", "🤩", "😇", "🥳", "😺", "🦊", "🐼", "🐨", "🦄"];
const PERSONALITIES = [
  "Friendly", "Shy", "Cheerful", "Curious", "Lazy", "Energetic",
  "Sleepy", "Chatty", "Cool", "Nerdy", "Artistic", "Sporty",
];

const CHAT_MESSAGES = [
  "Hi there! 👋", "Nice day, isn't it?", "Hello!", "How are you?",
  "Love this place!", "Wanna explore together?", "Hey hey!",
  "I like your style!", "What's up?", "This world is amazing!",
  "Let's be friends!", "Having fun?", "You're cool!",
  "Do you like games?", "I'm new here too!",
  "Check out that house!", "Wanna race?", "Follow me!",
  "Have you seen the garden?", "Let's hang out!",
  "You're fast!", "I love flowers 🌸", "The trees are so pretty!",
  "I found a nice spot!", "Come say hi!",
];

// ─── World Generation ────────────────────────────────────────────────
function generateWorld(): WorldItem[] {
  const items: WorldItem[] = [];
  for (let x = 0; x < COLS; x++) {
    if (Math.random() < 0.3) items.push({ type: "tree", x: x * TILE + TILE / 2, y: TILE / 2 });
    if (Math.random() < 0.3) items.push({ type: "tree", x: x * TILE + TILE / 2, y: (ROWS - 1) * TILE + TILE / 2 });
  }
  for (let y = 0; y < ROWS; y++) {
    if (Math.random() < 0.3) items.push({ type: "tree", x: TILE / 2, y: y * TILE + TILE / 2 });
    if (Math.random() < 0.3) items.push({ type: "tree", x: (COLS - 1) * TILE + TILE / 2, y: y * TILE + TILE / 2 });
  }
  for (let i = 0; i < 30; i++) {
    items.push({ type: "tree", x: Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2, y: Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2 });
  }
  const housePositions = [
    { x: 8, y: 6 }, { x: 38, y: 6 }, { x: 8, y: 30 }, { x: 38, y: 30 },
    { x: 16, y: 18 }, { x: 32, y: 18 }, { x: 24, y: 8 }, { x: 24, y: 28 },
  ];
  const houseColors = ["#E8A87C", "#F8B195", "#C06C84", "#6C5B7B", "#355C7D", "#F67280", "#A8E6CF", "#FFD3B6"];
  housePositions.forEach((pos, i) => {
    items.push({ type: "house", x: pos.x * TILE + TILE / 2, y: pos.y * TILE + TILE / 2, color: houseColors[i % houseColors.length] });
  });
  for (let i = 0; i < 40; i++) {
    items.push({ type: "bush", x: Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2, y: Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2 });
  }
  for (let i = 0; i < 50; i++) {
    items.push({ type: "flower", x: Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2, y: Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2 });
  }
  for (let x = 4; x < COLS - 4; x += 6) {
    items.push({ type: "lamp", x: x * TILE + TILE / 2, y: 20 * TILE + TILE / 2 });
  }
  for (let y = 4; y < ROWS - 4; y += 6) {
    items.push({ type: "lamp", x: 25 * TILE + TILE / 2, y: y * TILE + TILE / 2 });
  }
  const benchSpots = [
    { x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 26 }, { x: 36, y: 26 },
    { x: 20, y: 20 }, { x: 30, y: 20 },
  ];
  benchSpots.forEach((pos) => {
    items.push({ type: "bench", x: pos.x * TILE + TILE / 2, y: pos.y * TILE + TILE / 2 });
  });
  const signSpots = [
    { x: 4, y: 4 }, { x: 44, y: 4 }, { x: 4, y: 34 }, { x: 44, y: 34 }, { x: 25, y: 2 },
  ];
  signSpots.forEach((pos) => {
    items.push({ type: "sign", x: pos.x * TILE + TILE / 2, y: pos.y * TILE + TILE / 2 });
  });
  return items;
}

function buildCollisionMap(items: WorldItem[]): boolean[][] {
  const map: boolean[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
  for (const item of items) {
    if (item.type === "tree" || item.type === "house") {
      const col = Math.floor(item.x / TILE);
      const row = Math.floor(item.y / TILE);
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        map[row][col] = true;
        if (item.type === "tree") {
          if (row + 1 < ROWS) map[row + 1][col] = true;
          if (col + 1 < COLS) map[row][col + 1] = true;
          if (row + 1 < ROWS && col + 1 < COLS) map[row + 1][col + 1] = true;
        }
        if (item.type === "house") {
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) map[nr][nc] = true;
            }
          }
        }
      }
    }
  }
  return map;
}

// ─── Bot AI ───────────────────────────────────────────────────────────
function createBots(): Bot[] {
  return BOT_NAMES.map((name, i) => ({
    id: `bot-${i}`,
    name,
    x: Math.floor(Math.random() * (COLS - 10) + 5) * TILE + TILE / 2,
    y: Math.floor(Math.random() * (ROWS - 10) + 5) * TILE + TILE / 2,
    dir: Math.floor(Math.random() * 4),
    frame: 0,
    moveTimer: Math.random() * 200,
    color: BOT_COLORS[i % BOT_COLORS.length],
    hatColor: HAT_COLORS[i % HAT_COLORS.length],
    emoji: BOT_EMOJIS[i % BOT_EMOJIS.length],
    speed: 0.8 + Math.random() * 0.6,
    personality: PERSONALITIES[i % PERSONALITIES.length],
    chatText: "",
    chatTimer: 0,
    targetX: 0,
    targetY: 0,
  }));
}

function updateBots(bots: Bot[], collisionMap: boolean[][], dt: number): Bot[] {
  return bots.map((bot) => {
    let { x, y, moveTimer, dir, frame, chatTimer, chatText, targetX, targetY, speed } = bot;

    // Chat bubble timer
    if (chatTimer > 0) {
      chatTimer -= dt;
      if (chatTimer <= 0) {
        chatText = "";
        chatTimer = 0;
      }
    }

    // Movement AI
    moveTimer -= dt;
    if (moveTimer <= 0) {
      // Pick a new random target
      targetX = Math.floor(Math.random() * (COLS - 10) + 5) * TILE + TILE / 2;
      targetY = Math.floor(Math.random() * (ROWS - 10) + 5) * TILE + TILE / 2;
      moveTimer = 100 + Math.random() * 200;

      // Maybe say something
      if (Math.random() < 0.15) {
        chatText = CHAT_MESSAGES[Math.floor(Math.random() * CHAT_MESSAGES.length)];
        chatTimer = 60 + Math.random() * 60;
      }
    }

    // Move toward target
    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy);

    if (dist > 8) {
      const mx = (dx / dist) * speed;
      const my = (dy / dist) * speed;

      // Try X movement
      const newX = x + mx;
      const col = Math.floor(newX / TILE);
      const row = Math.floor(y / TILE);
      if (col >= 0 && col < COLS && row >= 0 && row < ROWS && !collisionMap[row][col]) {
        x = newX;
      }

      // Try Y movement
      const newY = y + my;
      const col2 = Math.floor(x / TILE);
      const row2 = Math.floor(newY / TILE);
      if (col2 >= 0 && col2 < COLS && row2 >= 0 && row2 < ROWS && !collisionMap[row2][col2]) {
        y = newY;
      }

      // Update direction
      if (Math.abs(dx) > Math.abs(dy)) {
        dir = dx > 0 ? 1 : 3;
      } else {
        dir = dy > 0 ? 2 : 0;
      }

      frame = (frame + 0.05) % 4;
    }

    // Keep in bounds
    x = Math.max(TILE, Math.min(WORLD_W - TILE, x));
    y = Math.max(TILE, Math.min(WORLD_H - TILE, y));

    return { ...bot, x, y, dir, frame, moveTimer, chatTimer, chatText, targetX, targetY };
  });
}

// ─── Rendering ────────────────────────────────────────────────────────
function drawCharacter(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  dir: number,
  frame: number,
  color: string,
  hatColor: string,
  emoji: string,
  name: string,
  isPlayer: boolean
) {
  ctx.save();
  ctx.translate(x, y);

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.2)";
  ctx.beginPath();
  ctx.ellipse(0, 16, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Body
  ctx.fillStyle = color;
  const bobY = isPlayer ? Math.sin(frame * Math.PI * 0.5) * 1.5 : Math.sin(frame * Math.PI * 0.5) * 1;
  ctx.beginPath();
  ctx.roundRect(-9, -12 + bobY, 18, 20, 5);
  ctx.fill();

  // Head
  ctx.fillStyle = "#FFDBAC";
  ctx.beginPath();
  ctx.arc(0, -16 + bobY, 10, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = "#333";
  const eyeOffX = dir === 3 ? -3 : dir === 1 ? 3 : 0;
  ctx.beginPath();
  ctx.arc(-4 + (eyeOffX ? eyeOffX * 0.3 : 0), -17 + bobY, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(4 + (eyeOffX ? eyeOffX * 0.3 : 0), -17 + bobY, 2, 0, Math.PI * 2);
  ctx.fill();

  // Eye shine
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(-3 + (eyeOffX ? eyeOffX * 0.3 : 0), -18 + bobY, 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(5 + (eyeOffX ? eyeOffX * 0.3 : 0), -18 + bobY, 1, 0, Math.PI * 2);
  ctx.fill();

  // Mouth (smile)
  ctx.strokeStyle = "#C0392B";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(0, -13 + bobY, 4, 0.1, Math.PI - 0.1);
  ctx.stroke();

  // Hat
  ctx.fillStyle = hatColor;
  ctx.fillRect(-10, -28 + bobY, 20, 6);
  ctx.beginPath();
  ctx.arc(0, -28 + bobY, 8, Math.PI, 0);
  ctx.fill();

  // Hat pom-pom
  ctx.fillStyle = "#FFD700";
  ctx.beginPath();
  ctx.arc(0, -32 + bobY, 3, 0, Math.PI * 2);
  ctx.fill();

  // Emoji badge
  ctx.font = "11px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(emoji, 0, -36 + bobY);

  // Name tag
  ctx.font = "bold 10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillStyle = isPlayer ? "#7C3AED" : "rgba(255,255,255,0.9)";
  ctx.fillText(name, 0, 28);

  ctx.restore();
}

function drawChatBubble(ctx: CanvasRenderingContext2D, bubble: ChatBubble) {
  const { x, y, text, color } = bubble;
  ctx.save();
  ctx.font = "11px sans-serif";
  const metrics = ctx.measureText(text);
  const pad = 8;
  const bw = metrics.width + pad * 2;
  const bh = 22;

  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.roundRect(x - bw / 2, y - 30 - bh, bw, bh, 8);
  ctx.fill();

  // Tail
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  ctx.moveTo(x - 5, y - 30);
  ctx.lineTo(x, y - 22);
  ctx.lineTo(x + 5, y - 30);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.textAlign = "center";
  ctx.font = "11px sans-serif";
  ctx.fillText(text, x, y - 30 - bh / 2 + 7);
  ctx.restore();
}

// ─── React Component ─────────────────────────────────────────────────
export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const playerRef = useRef<Player>({ x: 25 * TILE, y: 20 * TILE, dir: 0, frame: 0 });
  const botsRef = useRef<Bot[]>(createBots());
  const itemsRef = useRef<WorldItem[]>(generateWorld());
  const collisionRef = useRef<boolean[][]>(buildCollisionMap(itemsRef.current));
  const keysRef = useRef<Set<string>>(new Set());
  const cameraRef = useRef({ x: 0, y: 0 });
  const bubblesRef = useRef<ChatBubble[]>([]);
  const fpsRef = useRef(0);
  const lastTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const fpsTimerRef = useRef(0);
  const [showHelp, setShowHelp] = useState(true);
  const [nearbyBots, setNearbyBots] = useState<Bot[]>([]);
  const [playerCount, setPlayerCount] = useState(1);
  const [fps, setFps] = useState(0);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    keysRef.current.add(e.key);
    if (e.key === "h" || e.key === "H") setShowHelp((v) => !v);
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const gameLoop = (time: number) => {
      // FPS calculation
      if (lastTimeRef.current > 0) {
        const delta = time - lastTimeRef.current;
        fpsTimerRef.current += delta;
        frameCountRef.current++;
        if (fpsTimerRef.current >= 1000) {
          fpsRef.current = frameCountRef.current;
          setFps(frameCountRef.current);
          frameCountRef.current = 0;
          fpsTimerRef.current = 0;
        }
      }
      lastTimeRef.current = time;

      const dt = 1;
      const player = playerRef.current;
      const bots = botsRef.current;
      const items = itemsRef.current;
      const collisionMap = collisionRef.current;

      // Player movement
      let dx = 0;
      let dy = 0;
      if (keysRef.current.has("ArrowUp")) dy = -PLAYER_SPEED;
      if (keysRef.current.has("ArrowDown")) dy = PLAYER_SPEED;
      if (keysRef.current.has("ArrowLeft")) dx = -PLAYER_SPEED;
      if (keysRef.current.has("ArrowRight")) dx = PLAYER_SPEED;

      if (dx !== 0 || dy !== 0) {
        // Normalize diagonal
        if (dx !== 0 && dy !== 0) {
          dx *= 0.707;
          dy *= 0.707;
        }

        // Try X movement
        const newX = player.x + dx;
        const col = Math.floor(newX / TILE);
        const row = Math.floor(player.y / TILE);
        if (col >= 0 && col < COLS && row >= 0 && row < ROWS && !collisionMap[row][col]) {
          player.x = newX;
        }

        // Try Y movement
        const newY = player.y + dy;
        const col2 = Math.floor(player.x / TILE);
        const row2 = Math.floor(newY / TILE);
        if (col2 >= 0 && col2 < COLS && row2 >= 0 && row2 < ROWS && !collisionMap[row2][col2]) {
          player.y = newY;
        }

        // Update direction
        if (Math.abs(dx) > Math.abs(dy)) {
          player.dir = dx > 0 ? 1 : 3;
        } else {
          player.dir = dy > 0 ? 2 : 0;
        }

        player.frame += 0.15;
      }

      // Keep player in bounds
      player.x = Math.max(TILE, Math.min(WORLD_W - TILE, player.x));
      player.y = Math.max(TILE, Math.min(WORLD_H - TILE, player.y));

      // Update bots
      botsRef.current = updateBots(bots, collisionMap, dt);

      // Camera
      const targetCamX = player.x - canvas.width / 2;
      const targetCamY = player.y - canvas.height / 2;
      cameraRef.current.x += (targetCamX - cameraRef.current.x) * CAM_SMOOTH;
      cameraRef.current.y += (targetCamY - cameraRef.current.y) * CAM_SMOOTH;

      // Collect chat bubbles
      const newBubbles: ChatBubble[] = [];
      for (const bot of botsRef.current) {
        if (bot.chatText) {
          newBubbles.push({
            x: bot.x,
            y: bot.y,
            text: bot.chatText,
            timer: bot.chatTimer,
            color: bot.color,
          });
        }
      }
      bubblesRef.current = newBubbles;

      // ─── Draw ───
      const W = canvas.width;
      const H = canvas.height;
      const cam = cameraRef.current;

      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(-cam.x, -cam.y);

      // Grass background
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const shade = (row + col) % 2 === 0 ? "#2d5a27" : "#336633";
          ctx.fillStyle = shade;
          ctx.fillRect(col * TILE, row * TILE, TILE, TILE);
        }
      }

      // Paths (dirt roads)
      ctx.fillStyle = "#8B7355";
      // Horizontal paths
      for (let row = 10; row <= 30; row += 10) {
        ctx.fillRect(0, row * TILE, WORLD_W, TILE);
      }
      // Vertical paths
      for (let col = 10; col <= 40; col += 10) {
        ctx.fillRect(col * TILE, 0, TILE, WORLD_H);
      }

      // Path highlights
      ctx.fillStyle = "#9B8365";
      for (let row = 10; row <= 30; row += 10) {
        ctx.fillRect(0, row * TILE + 2, WORLD_W, 2);
      }
      for (let col = 10; col <= 40; col += 10) {
        ctx.fillRect(col * TILE + 2, 0, 2, WORLD_H);
      }

      // World items
      for (const item of items) {
        const { x, y, type, color } = item;
        switch (type) {
          case "tree": {
            // Trunk
            ctx.fillStyle = "#5D4037";
            ctx.fillRect(x - 3, y - 4, 6, 18);
            // Canopy
            ctx.fillStyle = "#2E7D32";
            ctx.beginPath();
            ctx.arc(x, y - 8, 14, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#388E3C";
            ctx.beginPath();
            ctx.arc(x - 4, y - 10, 9, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(x + 5, y - 9, 8, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case "house": {
            // Walls
            ctx.fillStyle = color || "#E8A87C";
            ctx.fillRect(x - 28, y - 20, 56, 40);
            // Roof
            ctx.fillStyle = "#C0392B";
            ctx.beginPath();
            ctx.moveTo(x - 32, y - 20);
            ctx.lineTo(x, y - 36);
            ctx.lineTo(x + 32, y - 20);
            ctx.closePath();
            ctx.fill();
            // Door
            ctx.fillStyle = "#5D4037";
            ctx.fillRect(x - 6, y - 2, 12, 22);
            // Window
            ctx.fillStyle = "#FFF9C4";
            ctx.fillRect(x - 20, y - 14, 12, 10);
            ctx.fillRect(x + 8, y - 14, 12, 10);
            // Window frames
            ctx.strokeStyle = "#5D4037";
            ctx.lineWidth = 1;
            ctx.strokeRect(x - 20, y - 14, 12, 10);
            ctx.strokeRect(x + 8, y - 14, 12, 10);
            break;
          }
          case "bush": {
            ctx.fillStyle = "#388E3C";
            ctx.beginPath();
            ctx.arc(x, y, 10, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#43A047";
            ctx.beginPath();
            ctx.arc(x - 5, y - 2, 7, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case "flower": {
            const colors = ["#FF6B6B", "#FFD93D", "#6BCB77", "#4D96FF", "#FF8C00"];
            ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            for (let i = 0; i < 5; i++) {
              const angle = (i / 5) * Math.PI * 2;
              ctx.beginPath();
              ctx.arc(x + Math.cos(angle) * 4, y + Math.sin(angle) * 4, 3, 0, Math.PI * 2);
              ctx.fill();
            }
            ctx.fillStyle = "#FFD700";
            ctx.beginPath();
            ctx.arc(x, y, 2.5, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case "lamp": {
            ctx.fillStyle = "#616161";
            ctx.fillRect(x - 2, y - 20, 4, 30);
            ctx.fillStyle = "#FFF9C4";
            ctx.beginPath();
            ctx.arc(x, y - 22, 6, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "rgba(255,249,196,0.15)";
            ctx.beginPath();
            ctx.arc(x, y - 18, 20, 0, Math.PI * 2);
            ctx.fill();
            break;
          }
          case "bench": {
            ctx.fillStyle = "#8D6E63";
            ctx.fillRect(x - 20, y - 6, 40, 8);
            ctx.fillRect(x - 18, y + 2, 4, 12);
            ctx.fillRect(x + 14, y + 2, 4, 12);
            ctx.fillStyle = "#A1887F";
            ctx.fillRect(x - 20, y - 8, 40, 3);
            break;
          }
          case "sign": {
            ctx.fillStyle = "#6D4C41";
            ctx.fillRect(x - 2, y - 4, 4, 24);
            ctx.fillStyle = "#5D4037";
            ctx.fillRect(x - 18, y - 22, 36, 20);
            ctx.fillStyle = "#FFF8E1";
            ctx.font = "bold 10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText("📍", x, y - 10);
            break;
          }
        }
      }

      // Draw chat bubbles
      for (const bubble of bubblesRef.current) {
        drawChatBubble(ctx, bubble);
      }

      // Draw bots
      for (const bot of botsRef.current) {
        drawCharacter(ctx, bot.x, bot.y, bot.dir, bot.frame, bot.color, bot.hatColor, bot.emoji, bot.name, false);
      }

      // Draw player
      drawCharacter(ctx, player.x, player.y, player.dir, player.frame, "#7C3AED", "#F59E0B", "😎", "You", true);

      ctx.restore();

      // UI overlay
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillRect(8, 8, 160, 70);
      ctx.fillStyle = "white";
      ctx.font = "bold 14px sans-serif";
      ctx.fillText(`🌍 People World`, 16, 30);
      ctx.font = "12px sans-serif";
      ctx.fillStyle = "#a0a0b0";
      ctx.fillText(`Players: ${playerCount}  ·  Bots: ${bots.length}  ·  ${fps} FPS`, 16, 50);
      ctx.fillStyle = "#7C3AED";
      ctx.fillRect(16, 56, 140, 3);

      // Nearby bots list
      const nearby = bots
        .filter((b) => Math.hypot(b.x - player.x, b.y - player.y) < TILE * 6)
        .slice(0, 5);
      setNearbyBots(nearby);

      animFrameRef.current = requestAnimationFrame(gameLoop);
    };

    animFrameRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas
        ref={canvasRef}
        className="block"
        style={{ width: "100vw", height: "100vh" }}
      />

      {/* Help overlay */}
      {showHelp && (
        <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
          <div className="pointer-events-auto rounded-xl border border-[#2a2a3a] bg-[#12121a]/90 px-5 py-3 text-center shadow-2xl backdrop-blur-sm">
            <p className="text-sm text-[#a0a0b0]">
              <span className="font-bold text-white">Arrow Keys</span> to move ·{" "}
              <span className="font-bold text-white">H</span> to hide help ·{" "}
              <span className="font-bold text-white">30 AI Bots</span> live here!
            </p>
          </div>
        </div>
      )}

      {/* Nearby bots panel */}
      {nearbyBots.length > 0 && (
        <div className="absolute right-3 top-3 space-y-1.5">
          {nearbyBots.map((bot) => (
            <div
              key={bot.id}
              className="flex items-center gap-2 rounded-lg border border-[#2a2a3a] bg-[#12121a]/80 px-3 py-1.5 backdrop-blur-sm"
            >
              <span className="text-lg">{bot.emoji}</span>
              <div>
                <p className="text-xs font-medium text-white">{bot.name}</p>
                <p className="text-[10px] text-[#a0a0b0]">{bot.personality}</p>
              </div>
              {bot.chatText && (
                <span className="ml-1 max-w-[120px] truncate text-[10px] text-[#7C3AED]">
                  &ldquo;{bot.chatText}&rdquo;
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
