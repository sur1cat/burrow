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
        setActive((prevActive) => {
            const nextActive = !prevActive;

            setLocalCount((prevCount) =>
                nextActive ? prevCount + 1 : Math.max(prevCount - 1, 0)
            );

            return nextActive;
        });

        if (onClick) {
            onClick();
        }
    };

    const baseClasses = "reaction";
    const activeClasses = active
        ? "bg-green-500 text-white"
        : "";

    return (
        <button
            type="button"
            onClick={handleClick}
            aria-pressed={active}
            aria-label={ariaLabel}
            className={`${baseClasses} ${activeClasses}`}
        >
            <span>👍</span>
            <span>{localCount}</span>
        </button>
    );
}



//w/o styling
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
//     const baseClasses =
//         "inline-flex items-center gap-1 px-2 py-1 rounded-full border text-xs transition";
//     const activeClasses = active
//         ? "bg-blue-500 text-white border-blue-500"
//         : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50";
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
