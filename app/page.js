"use client";

import { useState } from "react";
import { SyncProvider } from "./context/SyncContext";
import UrlInputPanel from "./components/UrlInputPanel";
import VideoGrid from "./components/VideoGrid";
import ControlBar from "./components/ControlBar";

export default function Home() {
  const [videoUrls, setVideoUrls] = useState(null);

  return (
    <SyncProvider>
      <main className="min-h-screen bg-background text-foreground selection:bg-accent/30 selection:text-white flex flex-col font-sans overflow-x-hidden">
        {/* Sticky Header */}
        <header className="fixed top-0 inset-x-0 h-16 bg-background/80 backdrop-blur-md border-b border-white/5 z-40 flex items-center px-6 lg:px-12 justify-between">
          <div className="flex items-center gap-3 select-none">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-purple-600 shadow-lg shadow-accent/20 flex items-center justify-center">
              <svg width="16" height="16" fill="white" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
            </div>
            <div className="leading-none">
              <h1 className="font-bold text-lg tracking-wide text-white">Parallel Play</h1>
            </div>
          </div>

          {videoUrls && (
            <button
              onClick={() => setVideoUrls(null)}
              className="text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/5"
            >
              Exit Session
            </button>
          )}
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-center items-center pt-24 pb-32 px-4 transition-all duration-700 animate-in fade-in slide-in-from-bottom-4">
          {!videoUrls ? (
            <UrlInputPanel onLoad={setVideoUrls} />
          ) : (
            <>
              <VideoGrid urls={videoUrls} />
              <ControlBar />
            </>
          )}
        </div>
      </main>
    </SyncProvider>
  );
}
