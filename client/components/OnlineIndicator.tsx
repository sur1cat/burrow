"use client";

interface OnlineIndicatorProps {
    isOnline: boolean;
    lastSeen?: string | null;
    showText?: boolean;
}

function formatLastSeen(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return date.toLocaleDateString();
}

export default function OnlineIndicator({
    isOnline,
    lastSeen,
    showText = true,
}: OnlineIndicatorProps) {
    return (
        <span className="online-indicator">
            <span className={`online-dot ${isOnline ? "online" : "offline"}`} />
            {showText && (
                <span>
                    {isOnline
                        ? "Online"
                        : lastSeen
                          ? `Last seen ${formatLastSeen(lastSeen)}`
                          : "Offline"}
                </span>
            )}
        </span>
    );
}
