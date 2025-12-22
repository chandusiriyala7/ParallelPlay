"use client";

import { useEffect, useRef, useState } from "react";
import { useSync } from "../context/SyncContext";

export default function VideoCard({ url, id, index }) {
    const videoRef = useRef(null);
    const { registerVideo, unregisterVideo, syncStatus, masterId } = useSync();
    const [isHovered, setIsHovered] = useState(false);
    const [muted, setMuted] = useState(index !== 0);
    const [aspectRatio, setAspectRatio] = useState(16 / 9);

    useEffect(() => {
        if (videoRef.current) {
            registerVideo(id, videoRef.current);
        }
        return () => unregisterVideo(id);
    }, [id, registerVideo, unregisterVideo]);

    const handleMetadata = (e) => {
        const { videoWidth, videoHeight } = e.target;
        if (videoWidth && videoHeight) {
            setAspectRatio(videoWidth / videoHeight);
        }
    };

    const status = syncStatus[id] || "synced";

    const statusColors = {
        synced: "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]",
        tuning: "bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]",
        desynced: "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
    };

    const isMaster = id === masterId;

    return (
        <div
            className="group relative w-full h-auto max-h-[70vh] bg-black rounded-xl overflow-hidden shadow-2xl ring-1 ring-gray-800 hover:ring-gray-700 transition-all mx-auto"
            style={{ aspectRatio: aspectRatio }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <video
                ref={videoRef}
                id={id} // Add ID for Global ControlBar access
                src={url}
                className="w-full h-full object-contain"
                playsInline
                muted={muted}
                onLoadedMetadata={handleMetadata}
            />

            {/* Overlay Info */}
            <div className={`absolute top-4 left-4 flex items-center gap-3 transition-opacity duration-300 ${isHovered || status !== "synced" ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}>
                <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/10">
                    <span className="text-white text-xs font-mono font-bold tracking-wider">
                        Video {index + 1}
                    </span>
                    {isMaster && (
                        <span className="text-[10px] bg-accent/20 text-accent px-1.5 py-0.5 rounded border border-accent/30">
                            MASTER
                        </span>
                    )}
                </div>

                {!isMaster && (
                    <div className="bg-black/60 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/10" title={`Status: ${status}`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${statusColors[status]}`} />
                    </div>
                )}
            </div>

            {/* Mute Toggle */}
            <button
                onClick={() => setMuted(!muted)}
                className={`absolute bottom-4 right-4 p-2 bg-black/60 backdrop-blur-md rounded-full text-white/80 hover:text-white hover:bg-black/80 transition-all border border-white/10 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"}`}
            >
                {muted ? (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" /></svg>
                ) : (
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                )}
            </button>
        </div>
    );
}
