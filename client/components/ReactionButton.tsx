"use client";

import { useState } from "react";

export interface ReactionButtonProps {
    count: number;
    ariaLabel: string;
    initialActive?: boolean;
    onClick?: () => void;
}

export default function ReactionButton({
                                           count,
                                           ariaLabel,
                                           initialActive = false,
                                           onClick,
                                       }: ReactionButtonProps) {
    const [active, setActive] = useState(initialActive);
    const [localCount, setLocalCount] = useState(count);

    const handleClick = () => {
        setActive((prev) => {
            const next = !prev;
            setLocalCount((c) => (next ? c + 1 : Math.max(c - 1, 0)));
            return next;
        });

        onClick?.();
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





//m
// "use client";
//
// import { useState } from "react";
//
// export interface ReactionButtonProps {
//     count: number;
//     ariaLabel: string;
//     initialActive?: boolean;
//     onClick?: () => void;
// }
//
// export default function ReactionButton({
//                                            count,
//                                            ariaLabel,
//                                            initialActive = false,
//                                            onClick,
//                                        }: ReactionButtonProps) {
//     const [active, setActive] = useState(initialActive);
//     const [localCount, setLocalCount] = useState(count);
//
//     const handleClick = () => {
//         setActive((prevActive) => {
//             const nextActive = !prevActive;
//
//             setLocalCount((prevCount) =>
//                 nextActive ? prevCount + 1 : Math.max(prevCount - 1, 0)
//             );
//
//             return nextActive;
//         });
//
//         if (onClick) {
//             onClick();
//         }
//     };
//
//     const baseClasses = "reaction";
//     const activeClasses = active
//         ? "bg-green-500 text-white"
//         : "";
//
//     return (
//         <button
//             type="button"
//             onClick={handleClick}
//             aria-pressed={active}
//             aria-label={ariaLabel}
//             className={`${baseClasses} ${activeClasses}`}
//         >
//             <span>👍</span>
//             <span>{localCount}</span>
//         </button>
//     );
// }
//
