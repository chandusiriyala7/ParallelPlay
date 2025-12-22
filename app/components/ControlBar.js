"use client";

import { useState, useEffect, useRef } from "react";
import { useSync } from "../context/SyncContext";

export default function ControlBar() {
    const { play, pause, seek, setPlaybackRate, syncStatus, videoCount, masterId, maxDuration } = useSync();
    const [playing, setPlaying] = useState(false);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // Scrubber State
    const [currentTime, setCurrentTime] = useState(0);
    // Removed local duration state, relying on maxDuration from Context
    const [isDragging, setIsDragging] = useState(false);

    const lastSeekTimeRef = useRef(0);

    const formatTime = (time) => {
        if (!time || isNaN(time)) return "00:00";
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    // Poll Master Video for Time Update
    useEffect(() => {
        if (!masterId) return;

        const masterVideo = document.getElementById(masterId);
        if (!masterVideo) return;

        const updateTime = () => {
            if (!isDragging) {
                setCurrentTime(masterVideo.currentTime);
            }
            setPlaying(!masterVideo.paused);
        };

        const onTimeUpdate = () => {
            if (!isDragging) setCurrentTime(masterVideo.currentTime);
        };

        const onPlay = () => setPlaying(true);
        const onPause = () => setPlaying(false);

        masterVideo.addEventListener("timeupdate", onTimeUpdate);
        masterVideo.addEventListener("play", onPlay);
        masterVideo.addEventListener("pause", onPause);

        // Initial check
        updateTime();

        return () => {
            masterVideo.removeEventListener("timeupdate", onTimeUpdate);
            masterVideo.removeEventListener("play", onPlay);
            masterVideo.removeEventListener("pause", onPause);
        };
    }, [masterId, isDragging]); // Removed duration dependency

    const handlePlayPause = () => {
        if (playing) {
            pause();
            setPlaying(false);
        } else {
            play();
            setPlaying(true);
        }
    };

    // Scrubber Logic
    const handleScrub = (e) => {
        const time = parseFloat(e.target.value);
        setCurrentTime(time);

        const now = Date.now();
        if (now - lastSeekTimeRef.current > 50) {
            seek(time);
            lastSeekTimeRef.current = now;
        }
    };

    const handleScrubEnd = () => {
        setIsDragging(false);
        seek(currentTime);
    };

    const handleSeek = (seconds) => {
        const masterVideo = document.getElementById(masterId || "video-0");
        if (masterVideo) {
            const newTime = masterVideo.currentTime + seconds;
            seek(newTime);
        }
    };

    const handleSpeed = (rate) => {
        setPlaybackSpeed(rate);
        setPlaybackRate(rate);
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    };

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-col gap-3 bg-panel/95 backdrop-blur-xl border border-white/10 p-3 md:p-4 rounded-2xl shadow-2xl z-50 w-[95vw] md:w-auto min-w-[320px] max-w-2xl transition-all md:hover:scale-[1.02]">

            {/* Scrubber Row */}
            <div className="flex items-center gap-3 w-full px-1">
                <span className="text-[10px] md:text-xs font-mono text-gray-400 min-w-[40px] text-right">{formatTime(currentTime)}</span>

                <input
                    type="range"
                    min={0}
                    max={maxDuration || 100} // Use maxDuration from context
                    step="0.1"
                    value={currentTime}
                    onChange={handleScrub}
                    onMouseDown={() => setIsDragging(true)}
                    onMouseUp={handleScrubEnd}
                    onTouchStart={() => setIsDragging(true)}
                    onTouchEnd={handleScrubEnd}
                    className="flex-1 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent hover:h-1.5 transition-all"
                />

                <span className="text-[10px] md:text-xs font-mono text-gray-400 min-w-[40px]">{formatTime(maxDuration)}</span>
            </div>

            {/* Controls Row */}
            <div className="flex justify-center items-center gap-4 md:gap-6">
                {/* Seek Back */}
                <button onClick={() => handleSeek(-5)} className="control-btn group p-2 hover:bg-white/10 rounded-full transition-colors" title="-5s">
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><text x="12" y="18" fontSize="6" textAnchor="middle" fill="currentColor">-5s</text></svg>
                </button>

                {/* Play/Pause */}
                <button
                    onClick={handlePlayPause}
                    className="w-10 h-10 md:w-12 md:h-12 bg-accent text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all transform active:scale-95"
                >
                    {playing ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" /></svg>
                    ) : (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                    )}
                </button>

                {/* Seek Forward */}
                <button onClick={() => handleSeek(5)} className="control-btn group p-2 hover:bg-white/10 rounded-full transition-colors" title="+5s">
                    <svg className="w-5 h-5 md:w-6 md:h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /></svg>
                </button>

                <div className="w-px h-6 bg-gray-700 mx-1 md:mx-2" />

                {/* Speed */}
                <div className="relative group">
                    <button className="text-xs md:text-sm font-bold text-gray-300 hover:text-white bg-gray-800/50 px-2 py-1.5 md:px-3 rounded-lg border border-gray-700 transition-colors">
                        {playbackSpeed}x
                    </button>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-20 bg-gray-900 border border-gray-700 rounded-lg overflow-hidden shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto flex flex-col">
                        {[0.5, 1, 1.5, 2].map(rate => (
                            <button
                                key={rate}
                                onClick={() => handleSpeed(rate)}
                                className={`px-3 py-2 text-xs md:text-sm text-center hover:bg-gray-800 ${playbackSpeed === rate ? 'text-accent' : 'text-gray-400'}`}
                            >
                                {rate}x
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fullscreen */}
                <button onClick={toggleFullscreen} className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                    {isFullscreen ? (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" /></svg>
                    ) : (
                        <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 4l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                    )}
                </button>
            </div>
        </div>
    );
}
