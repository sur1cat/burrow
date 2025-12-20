"use client";

import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { TOGGLE_REACTION } from "@/graphql/mutations/posts";

export interface ReactionButtonProps {
    postId: string;
    count: number;
    ariaLabel: string;
    initialActive?: boolean;
}

export default function ReactionButton({
    postId,
    count,
    ariaLabel,
    initialActive = false,
}: ReactionButtonProps) {
    const [active, setActive] = useState(initialActive);
    const [localCount, setLocalCount] = useState(count);

    const [toggleReaction] = useMutation(TOGGLE_REACTION);

    const handleClick = async () => {
        const wasActive = active;

        setActive(!wasActive);
        setLocalCount((c) => (!wasActive ? c + 1 : Math.max(c - 1, 0)));

        try {
            await toggleReaction({
                variables: {
                    targetType: "post",
                    targetId: postId,
                    type: "like",
                },
            });
        } catch (error) {
            setActive(wasActive);
            setLocalCount((c) => (wasActive ? c + 1 : Math.max(c - 1, 0)));
            console.error("Failed to toggle reaction:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={active}
            aria-label={ariaLabel}
            className={`reaction ${active ? "bg-green-500 text-white" : ""}`}
        >
            <span>👍</span>
            <span>{localCount}</span>
        </button>
    );
}
