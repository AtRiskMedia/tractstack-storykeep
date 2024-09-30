import { useState, useEffect, useCallback } from "react";

interface DropdownDirection {
  openAbove: boolean;
  maxHeight: number;
}

export function useDropdownDirection(
  triggerRef: React.RefObject<HTMLElement>
): DropdownDirection {
  const [openAbove, setOpenAbove] = useState(false);
  const [maxHeight, setMaxHeight] = useState(300); // Default max height
  const [isInitialized, setIsInitialized] = useState(false);

  const updateDirection = useCallback(() => {
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
      setIsInitialized(true);
    }
  }, [triggerRef]);

  useEffect(() => {
    updateDirection();
    window.addEventListener("resize", updateDirection);
    return () => {
      window.removeEventListener("resize", updateDirection);
    };
  }, [updateDirection]);

  useEffect(() => {
    if (!isInitialized) {
      const timeoutId = setTimeout(updateDirection, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [isInitialized, updateDirection]);

  return { openAbove, maxHeight };
}
