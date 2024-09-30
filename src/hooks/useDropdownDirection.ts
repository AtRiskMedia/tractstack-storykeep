import { useState, useEffect } from "react";

interface DropdownDirection {
  openAbove: boolean;
  maxHeight: number;
}

export function useDropdownDirection(
  triggerRef: React.RefObject<HTMLElement>
): DropdownDirection {
  const [openAbove, setOpenAbove] = useState(false);
  const [maxHeight, setMaxHeight] = useState(300); // Default max height

  useEffect(() => {
    function updateDirection() {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const newOpenAbove = spaceBelow < 300 && spaceAbove > spaceBelow;
        setOpenAbove(newOpenAbove);
        setMaxHeight(
          newOpenAbove
            ? Math.min(spaceAbove - 10, 300)
            : Math.min(spaceBelow - 10, 300)
        );
      }
    }

    updateDirection();
    window.addEventListener("resize", updateDirection);
    window.addEventListener("scroll", updateDirection);

    return () => {
      window.removeEventListener("resize", updateDirection);
      window.removeEventListener("scroll", updateDirection);
    };
  }, [triggerRef]);

  return { openAbove, maxHeight };
}
