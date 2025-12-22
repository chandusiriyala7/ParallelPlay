"use client";

import VideoCard from "./VideoCard";

export default function VideoGrid({ urls }) {
    const count = urls.length;

    // Dynamic Grid Class
    let gridClass = "md:grid-cols-1";
    if (count === 2) gridClass = "md:grid-cols-2";
    else if (count === 3) gridClass = "md:grid-cols-3";
    else if (count >= 4) gridClass = "md:grid-cols-2";

    return (
        <div className={`grid ${gridClass} gap-6 w-full max-w-[95vw] mx-auto transition-all duration-500`}>
            {urls.map((url, index) => (
                <div key={index} className="flex flex-col">
                    <VideoCard
                        url={url}
                        index={index}
                        id={`video-${index}`} // Predictable ID for Sync engine
                    />
                </div>
            ))}
        </div>
    );
}
