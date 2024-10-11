import { useState, useEffect, useCallback } from "react";
import type { RefObject } from "react";

interface DropdownDirection {
  openAbove: boolean;
  maxHeight: number;
}

export function useDropdownDirection(
  triggerRef: RefObject<HTMLElement>
): DropdownDirection {
  const [state, setState] = useState<DropdownDirection>({
    openAbove: false,
    maxHeight: 300,
  });

  const updateDirection = useCallback(() => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const newOpenAbove = spaceBelow < 300 && spaceAbove > spaceBelow;
      const newMaxHeight = newOpenAbove
        ? Math.min(spaceAbove - 10, 300)
        : Math.min(spaceBelow - 10, 300);
      setState({ openAbove: newOpenAbove, maxHeight: newMaxHeight });
    }
  }, [triggerRef]);

  useEffect(() => {
    updateDirection();
    window.addEventListener("resize", updateDirection);
    const rafId = requestAnimationFrame(updateDirection);

    return () => {
      window.removeEventListener("resize", updateDirection);
      cancelAnimationFrame(rafId);
    };
  }, [updateDirection]);

  return state;
}
