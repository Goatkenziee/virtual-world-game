"use client";

import { Suspense, useState } from "react";
import GameCanvas from "@/components/game/GameCanvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Users, HelpCircle, X, Move, MessageCircle, Bot, Sparkles } from "lucide-react";

function GameErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Card className="p-8 text-center max-w-md">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Game Load Error</h2>
        <p className="text-gray-400 mb-4">
          Something went wrong loading the game. Try refreshing.
        </p>
        <Button onClick={onRetry} variant="default">
          Retry
        </Button>
      </Card>
    </div>
  );
}

export default function Home() {
  const [gameKey, setGameKey] = useState(0);
  const [showHelp, setShowHelp] = useState(false);

  return (
    <main className="relative min-h-screen bg-[#0a0a1a] overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#0a0a1a] via-[#0f0f2a] to-[#1a0a2e] pointer-events-none" />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-4 py-2 border-b border-white/10 bg-black/30 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h1 className="text-lg font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Virtual World
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowHelp(true)}
            className="text-gray-400 hover:text-white"
          >
            <HelpCircle className="w-4 h-4 mr-1" />
            Help
          </Button>
          <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/5 px-3 py-1.5 rounded-full">
            <Bot className="w-3.5 h-3.5" />
            <span>30 People</span>
          </div>
        </div>
      </header>

      {/* Game area */}
      <div className="relative z-10 flex flex-col lg:flex-row h-[calc(100vh-48px)]">
        {/* Left sidebar - Player info */}
        <aside className="lg:w-64 shrink-0 border-r border-white/5 bg-black/20 p-4 hidden lg:flex flex-col gap-4">
          <Card className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Users className="w-3.5 h-3.5" />
              Your Info
            </h3>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-lg font-bold">
                Y
              </div>
              <div>
                <p className="font-semibold text-sm">You</p>
                <p className="text-xs text-gray-500">Player</p>
              </div>
            </div>
            <div className="space-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Move className="w-3 h-3" />
                <span>Arrow keys to move</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3 h-3" />
                <span>Talk to People</span>
              </div>
            </div>
          </Card>

          <Card className="p-4 flex-1 overflow-auto">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Bot className="w-3.5 h-3.5" />
              People Nearby
            </h3>
            <div className="space-y-2 text-xs text-gray-400" id="nearby-bots-sidebar">
              <p className="italic">Walk around to meet people!</p>
            </div>
          </Card>
        </aside>

        {/* Game canvas */}
        <div className="flex-1 relative">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-full">
                <div className="animate-pulse text-purple-400">Loading game...</div>
              </div>
            }
          >
            <GameCanvas key={gameKey} />
          </Suspense>
        </div>
      </div>

      {/* Help overlay */}
      {showHelp && (
        <div
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowHelp(false)}
        >
          <Card
            className="max-w-md w-full p-6 animate-fade-in"
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">How to Play</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHelp(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Move className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Movement</p>
                  <p className="text-gray-400">
                    Use the arrow keys (↑ ↓ ← →) to move your character around
                    the world.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold mb-1">AI People</p>
                  <p className="text-gray-400">
                    The world is filled with 30 AI bots called "People." Each
                    has a unique personality, name, and chat bubbles. Walk up to
                    them to see what they say!
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-semibold mb-1">World</p>
                  <p className="text-gray-400">
                    Explore a colorful world with houses, trees, flowers, lamps,
                    benches, and signs. The camera follows you as you explore!
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </main>
  );
}
