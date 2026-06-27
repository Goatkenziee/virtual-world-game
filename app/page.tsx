"use client";

import { Component, type ReactNode } from "react";
import dynamic from "next/dynamic";

// Dynamically import the game canvas (it uses "use client" and canvas APIs)
const GameCanvas = dynamic(() => import("@/components/game/GameCanvas").then((m) => ({ default: m.default })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#7c3aed] border-t-transparent" />
        <p className="text-sm text-[#a0a0b0]">Loading game world...</p>
      </div>
    </div>
  ),
});

// ─── Error Boundary ──────────────────────────────────────────────────
interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class GameErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#0a0a0f] p-6">
          <div className="max-w-md rounded-2xl border border-[#2a2a3a] bg-[#12121a] p-8 text-center shadow-2xl">
            <div className="mb-4 text-5xl">⚠️</div>
            <h2 className="mb-2 text-xl font-bold text-[#f8f8f8]">
              Something went wrong
            </h2>
            <p className="mb-4 text-sm text-[#a0a0b0]">
              The game encountered an error and couldn&apos;t load.
            </p>
            <pre className="mb-6 max-h-24 overflow-auto rounded-lg bg-[#1a1a24] p-3 text-left text-xs text-[#f87171]">
              {this.state.error?.message ?? "Unknown error"}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="rounded-lg bg-[#7c3aed] px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#6d28d9]"
            >
              Reload Game
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Page ────────────────────────────────────────────────────────────
export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-[#0a0a0f]">
      <GameErrorBoundary>
        <GameCanvas />
      </GameErrorBoundary>
    </main>
  );
}
