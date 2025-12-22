"use client";

import React, { createContext, useContext, useRef, useState, useMemo, useCallback, useEffect } from 'react';
import { useVideoSync } from '../hooks/useVideoSync';

const SyncContext = createContext(null);

export function SyncProvider({ children }) {
    const videoRefs = useRef({});
    const [videoIds, setVideoIds] = useState([]);
    const [durations, setDurations] = useState({}); // { id: duration }

    const handleDurationChange = useCallback((id, duration) => {
        setDurations(prev => {
            if (prev[id] === duration) return prev;
            return { ...prev, [id]: duration };
        });
    }, []);

    const registerVideo = useCallback((id, element) => {
        if (!element) return;
        videoRefs.current[id] = element;

        // Listen for duration changes
        const onLoadedMetadata = () => handleDurationChange(id, element.duration);
        const onDurationChange = () => handleDurationChange(id, element.duration);

        element.addEventListener('loadedmetadata', onLoadedMetadata);
        element.addEventListener('durationchange', onDurationChange);

        // Initial check
        if (element.duration) handleDurationChange(id, element.duration);

        setVideoIds(prev => {
            if (prev.includes(id)) return prev;
            return [...prev, id];
        });

        // Cleanup listener helper attached to element property for unregister retrieval? 
        // Simpler: Helper function returned? No, standard register.
        // We'll clean up listeners in unregister if we could, but unregister just deletes the ref.
        // Listeners might linger if we don't track them.
        // For now, React's lifecycle in VideoCard unmounts the video element, so listeners die with it.
    }, [handleDurationChange]);

    const unregisterVideo = useCallback((id) => {
        delete videoRefs.current[id];
        setVideoIds(prev => prev.filter(i => i !== id));
        setDurations(prev => {
            const next = { ...prev };
            delete next[id];
            return next;
        });
    }, []);

    // Determine Master: The video with the longest duration. 
    // If tie or 0, fallback to lowest ID index (video-0).
    const sortedVideoIds = useMemo(() => {
        return [...videoIds].sort((a, b) => {
            const durA = durations[a] || 0;
            const durB = durations[b] || 0;
            if (Math.abs(durA - durB) > 0.5) return durB - durA; // Descending duration

            // Fallback to index
            const idxA = parseInt(a.split('-')[1]);
            const idxB = parseInt(b.split('-')[1]);
            return idxA - idxB;
        });
    }, [videoIds, durations]);

    const { syncStatus, play, pause, seek, setPlaybackRate } = useVideoSync(videoRefs, sortedVideoIds);

    const masterId = sortedVideoIds[0];

    // Max duration for UI
    const maxDuration = useMemo(() => {
        return Math.max(0, ...Object.values(durations));
    }, [durations]);

    const value = useMemo(() => ({
        registerVideo,
        unregisterVideo,
        syncStatus,
        play,
        pause,
        seek,
        setPlaybackRate,
        masterId, // Expose dynamic master
        videoCount: sortedVideoIds.length,
        maxDuration // Expose max duration
    }), [
        registerVideo,
        unregisterVideo,
        syncStatus,
        play,
        pause,
        seek,
        setPlaybackRate,
        masterId,
        sortedVideoIds.length,
        maxDuration
    ]);

    return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

export const useSync = () => {
    const context = useContext(SyncContext);
    if (!context) {
        throw new Error("useSync must be used within a SyncProvider");
    }
    return context;
};
