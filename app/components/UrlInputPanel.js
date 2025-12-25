"use client";

import { useState } from "react";
import { Plus, X, Play, Upload } from "lucide-react";

export default function UrlInputPanel({ onLoad, initialUrls }) {
    const [urls, setUrls] = useState(initialUrls || [
        "",
        ""
    ]);
    const [error, setError] = useState(null);

    const addUrl = () => {
        if (urls.length >= 4) return;
        setUrls([...urls, ""]);
    };

    const removeUrl = (index) => {
        if (urls.length <= 1) return;
        const newUrls = urls.filter((_, i) => i !== index);
        setUrls(newUrls);
    };

    const updateUrl = (index, value) => {
        const newUrls = [...urls];
        newUrls[index] = value;
        setUrls(newUrls);
        setError(null);
    };

    const handleFileUpload = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const objectUrl = URL.createObjectURL(file);
            updateUrl(index, objectUrl);
        }
    };

    const handleLoad = () => {
        const valid = urls.every(url => url.trim().endsWith(".mp4") || url.trim().startsWith("blob:"));
        if (!valid) {
            setError("All URLs must be .mp4 links or local videos");
            return;
        }
        if (urls.some(url => !url.trim())) {
            setError("Please fill in all fields");
            return;
        }
        onLoad(urls);
    };

    const loadDemo = () => {
        const demoUrls = [
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            "http://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
        ];
        setUrls(demoUrls);
    };

    return (
        <div className="w-full max-w-2xl bg-panel rounded-2xl shadow-xl p-6 md:p-8 border border-gray-800 mx-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">Load Videos</h2>
                <button onClick={loadDemo} className="text-xs text-gray-500 hover:text-accent underline">
                    Load Demo
                </button>
            </div>

            <div className="space-y-4">
                {urls.map((url, index) => (
                    <div key={index} className="flex gap-2 relative">
                        <div className="flex-shrink-0">
                            <input
                                type="file"
                                accept="video/*"
                                onChange={(e) => handleFileUpload(index, e)}
                                className="hidden"
                                id={`file-upload-${index}`}
                            />
                            <label
                                htmlFor={`file-upload-${index}`}
                                className="h-full flex items-center justify-center p-3 text-gray-500 hover:text-accent hover:bg-gray-800 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-gray-700 bg-gray-900 border-gray-700"
                                title="Upload Local Video"
                            >
                                <Upload size={20} />
                            </label>
                        </div>
                        <input
                            type="text"
                            value={url}
                            onChange={(e) => updateUrl(index, e.target.value)}
                            placeholder={`Enter Video URL ${index + 1} (.mp4)`}
                            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white text-sm md:text-base focus:ring-2 focus:ring-accent focus:outline-none transition-all placeholder:text-gray-600"
                        />
                        {urls.length > 1 && (
                            <button
                                onClick={() => removeUrl(index)}
                                className="p-3 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M18 6 6 18" /><path d="m6 6 12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                ))}
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-900/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                    {error}
                </div>
            )}

            <div className="mt-8 flex flex-col md:flex-row gap-4">
                <button
                    onClick={addUrl}
                    className="flex-1 py-3 px-4 border border-dashed border-gray-700 text-gray-400 rounded-xl hover:border-accent hover:text-accent transition-all flex items-center justify-center gap-2"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="M12 5v14" />
                    </svg>
                    Add Another Video
                </button>

                <button
                    onClick={handleLoad}
                    className="flex-[2] py-3 px-6 bg-accent text-white font-bold rounded-xl shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                    Start Sync Playback
                </button>
            </div>
        </div>
    );
}
