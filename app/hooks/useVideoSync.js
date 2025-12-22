"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/**
 * Hook to manage video synchronization.
 * Expects `videoIds[0]` to be the Master.
 */
export function useVideoSync(videoRefs, videoIds) {
    const [syncStatus, setSyncStatus] = useState({}); // { id: 'synced' | 'tuning' | 'desynced' }
    const syncIntervalRef = useRef(null);
    const isCorrectingRef = useRef({});
    const isPlaybackRateTuningRef = useRef({});

    const SYNC_THRESHOLD = 0.05;
    const HARD_SYNC_THRESHOLD = 0.5;

    const getMasterVideo = useCallback(() => {
        if (!videoIds || videoIds.length === 0) return null;
        return videoRefs.current[videoIds[0]];
    }, [videoIds, videoRefs]);

    const performSyncCheck = useCallback(() => {
        const master = getMasterVideo();
        if (!master || master.paused) return;

        const masterTime = master.currentTime;

        videoIds.forEach((id, index) => {
            if (index === 0) return; // Skip master

            const follower = videoRefs.current[id];
            if (!follower) return;

            // If follower has ended, ignore sync (let it stay ended)
            if (follower.ended) return;

            const diff = follower.currentTime - masterTime;
            const absDiff = Math.abs(diff);

            let newStatus = "synced";
            if (absDiff > 0.3) newStatus = "desynced";
            else if (absDiff > SYNC_THRESHOLD) newStatus = "tuning";

            setSyncStatus(prev => {
                if (prev[id] !== newStatus) return { ...prev, [id]: newStatus };
                return prev;
            });

            if (absDiff < SYNC_THRESHOLD) {
                if (isPlaybackRateTuningRef.current[id]) {
                    follower.playbackRate = master.playbackRate;
                    isPlaybackRateTuningRef.current[id] = false;
                }
            }
            else if (absDiff > HARD_SYNC_THRESHOLD) {
                if (!isCorrectingRef.current[id] && follower.readyState >= 3) {
                    console.log(`[Sync] Hard Seeking ${id} (drift: ${diff.toFixed(3)}s)`);
                    follower.currentTime = masterTime;
                    isCorrectingRef.current[id] = true;
                    setTimeout(() => { isCorrectingRef.current[id] = false; }, 500);
                }
            }
            else {
                const targetRate = master.playbackRate;
                let tuneFactor = 1.0;
                if (diff > 0) tuneFactor = 0.95;
                else tuneFactor = 1.05;

                const newRate = targetRate * tuneFactor;
                if (Math.abs(follower.playbackRate - newRate) > 0.01) {
                    follower.playbackRate = newRate;
                    isPlaybackRateTuningRef.current[id] = true;
                }
            }
        });

        syncIntervalRef.current = requestAnimationFrame(performSyncCheck);
    }, [videoIds, videoRefs, getMasterVideo]);

    useEffect(() => {
        const master = getMasterVideo();

        const startLoop = () => {
            // Ensure followers play if master plays (unless they are ended)
            videoIds.slice(1).forEach(id => {
                const v = videoRefs.current[id];
                if (v && v.paused && !v.ended) {
                    v.play().catch(e => console.log("Auto-play follow error", e));
                }
                if (v) v.playbackRate = master?.playbackRate || 1;
            });

            if (syncIntervalRef.current) cancelAnimationFrame(syncIntervalRef.current);
            syncIntervalRef.current = requestAnimationFrame(performSyncCheck);
        };

        const stopLoop = () => {
            if (syncIntervalRef.current) cancelAnimationFrame(syncIntervalRef.current);
            // Don't force pause followers? The prompt implies "rest will play" if master ends?
            // BUT: If master PAUSES (user action), we MUST pause followers.
            // If master ENDS, we pause followers?
            // "if *any* videos duration ends... rest will play".
            // Since we set Master = Longest Video, the master will technically be the LAST to end.
            // So if Master ends, EVERYONE implicitly should have ended (or be shorter).
            // So logic holds: If Master ends, stop everything.

            videoIds.slice(1).forEach(id => {
                const v = videoRefs.current[id];
                if (v) {
                    // Only pause if master is paused/ended explicitly?
                    // Standard sync behavior: Master pause -> Follower pause.
                    v.pause();
                    v.playbackRate = master?.playbackRate || 1;
                }
            });
        };

        if (master) {
            master.addEventListener("play", startLoop);
            master.addEventListener("pause", stopLoop);
            master.addEventListener("ended", stopLoop);
            master.addEventListener("ratechange", () => {
                videoIds.slice(1).forEach(id => {
                    if (videoRefs.current[id]) videoRefs.current[id].playbackRate = master.playbackRate;
                });
            });

            if (!master.paused) startLoop();
        }

        return () => {
            if (master) {
                master.removeEventListener("play", startLoop);
                master.removeEventListener("pause", stopLoop);
                master.removeEventListener("ended", stopLoop);
            }
            if (syncIntervalRef.current) cancelAnimationFrame(syncIntervalRef.current);
        };
    }, [performSyncCheck, getMasterVideo, videoIds, videoRefs]);

    const play = useCallback(() => {
        const master = getMasterVideo();
        if (master) master.play().catch(e => console.error("Master Play Error", e));
    }, [getMasterVideo]);

    const pause = useCallback(() => {
        const master = getMasterVideo();
        if (master) master.pause();
    }, [getMasterVideo]);

    const seek = useCallback((time) => {
        const master = getMasterVideo();
        if (master) master.currentTime = time;
        videoIds.forEach((id, index) => {
            if (index === 0) return; // handled master
            const v = videoRefs.current[id];
            if (v) {
                // If seeking past this video's duration, it just clamps to end.
                v.currentTime = time;
                // If it was ended, and we seek back, we might need to play?
                // Master play event will handle re-triggering play.
            }
        });
    }, [videoIds, videoRefs, getMasterVideo]);

    const setPlaybackRate = useCallback((rate) => {
        videoIds.forEach(id => {
            if (videoRefs.current[id]) videoRefs.current[id].playbackRate = rate;
        });
    }, [videoIds, videoRefs]);

    return { syncStatus, play, pause, seek, setPlaybackRate };
}
