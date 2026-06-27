"use client";

import { useEffect, useRef, useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────
interface Bot {
  id: string;
  name: string;
  x: number;
  y: number;
  dir: number; // 0=down, 1=up, 2=left, 3=right
  frame: number;
  moveTimer: number;
  color: string;
  hatColor: string;
  emoji: string;
  speed: number;
  personality: string;
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

  // Border trees
  for (let x = 0; x < COLS; x++) {
    if (Math.random() < 0.3) items.push({ type: "tree", x: x * TILE + TILE / 2, y: TILE / 2 });
    if (Math.random() < 0.3) items.push({ type: "tree", x: x * TILE + TILE / 2, y: (ROWS - 1) * TILE + TILE / 2 });
  }
  for (let y = 0; y < ROWS; y++) {
    if (Math.random() < 0.3) items.push({ type: "tree", x: TILE / 2, y: y * TILE + TILE / 2 });
    if (Math.random() < 0.3) items.push({ type: "tree", x: (COLS - 1) * TILE + TILE / 2, y: y * TILE + TILE / 2 });
  }

  // Inner trees
  for (let i = 0; i < 30; i++) {
    items.push({
      type: "tree",
      x: Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2,
      y: Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2,
    });
  }

  // Houses
  const housePositions = [
    { x: 8, y: 6 }, { x: 38, y: 6 }, { x: 8, y: 30 }, { x: 38, y: 30 },
    { x: 16, y: 18 }, { x: 32, y: 18 }, { x: 24, y: 8 }, { x: 24, y: 28 },
  ];
  const houseColors = ["#E8A87C", "#F8B195", "#C06C84", "#6C5B7B", "#355C7D", "#F67280", "#A8E6CF", "#FFD3B6"];
  housePositions.forEach((pos, i) => {
    items.push({
      type: "house",
      x: pos.x * TILE + TILE / 2,
      y: pos.y * TILE + TILE / 2,
      color: houseColors[i % houseColors.length],
    });
  });

  // Bushes
  for (let i = 0; i < 40; i++) {
    items.push({
      type: "bush",
      x: Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2,
      y: Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2,
    });
  }

  // Flowers
  for (let i = 0; i < 50; i++) {
    items.push({
      type: "flower",
      x: Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2,
      y: Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2,
    });
  }

  // Lamps along main paths
  for (let x = 4; x < COLS - 4; x += 6) {
    items.push({ type: "lamp", x: x * TILE + TILE / 2, y: 20 * TILE + TILE / 2 });
  }
  for (let y = 4; y < ROWS - 4; y += 6) {
    items.push({ type: "lamp", x: 25 * TILE + TILE / 2, y: y * TILE + TILE / 2 });
  }

  // Benches
  const benchSpots = [
    { x: 12, y: 12 }, { x: 36, y: 12 }, { x: 12, y: 26 }, { x: 36, y: 26 },
    { x: 20, y: 20 }, { x: 30, y: 20 },
  ];
  benchSpots.forEach((pos) => {
    items.push({ type: "bench", x: pos.x * TILE + TILE / 2, y: pos.y * TILE + TILE / 2 });
  });

  // Signs
  const signSpots = [
    { x: 4, y: 4 }, { x: 44, y: 4 }, { x: 4, y: 34 }, { x: 44, y: 34 },
    { x: 25, y: 2 },
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

function createBots(count: number, collisionMap: boolean[][]): Bot[] {
  const bots: Bot[] = [];
  const shuffledNames = [...BOT_NAMES].sort(() => Math.random() - 0.5);
  const shuffledColors = [...BOT_COLORS].sort(() => Math.random() - 0.5);
  const shuffledHats = [...HAT_COLORS].sort(() => Math.random() - 0.5);
  const shuffledEmojis = [...BOT_EMOJIS].sort(() => Math.random() - 0.5);
  const shuffledPersonalities = [...PERSONALITIES].sort(() => Math.random() - 0.5);

  for (let i = 0; i < count; i++) {
    let x: number, y: number;
    let attempts = 0;
    do {
      x = Math.floor(Math.random() * (COLS - 4) + 2) * TILE + TILE / 2;
      y = Math.floor(Math.random() * (ROWS - 4) + 2) * TILE + TILE / 2;
      attempts++;
    } while (
      attempts < 50 &&
      collisionMap[Math.floor(y / TILE)]?.[Math.floor(x / TILE)]
    );

    bots.push({
      id: `bot-${i}`,
      name: shuffledNames[i % shuffledNames.length],
      x,
      y,
      dir: Math.floor(Math.random() * 4),
      frame: 0,
      moveTimer: Math.random() * 2000,
      color: shuffledColors[i % shuffledColors.length],
      hatColor: shuffledHats[i % shuffledHats.length],
      emoji: shuffledEmojis[i % shuffledEmojis.length],
      speed: 0.8 + Math.random() * 0.8,
      personality: shuffledPersonalities[i % shuffledPersonalities.length],
    });
  }
  return bots;
}

function collides(x: number, y: number, map: boolean[][]): boolean {
  const col = Math.floor(x / TILE);
  const row = Math.floor(y / TILE);
  if (x < TILE || x >= WORLD_W - TILE || y < TILE || y >= WORLD_H - TILE) return true;
  if (row < 0 || row >= ROWS || col < 0 || col >= COLS) return true;
  return map[row][col];
}
