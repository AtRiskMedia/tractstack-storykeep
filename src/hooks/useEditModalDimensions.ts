import { useState, useEffect, useCallback } from "react";

interface Dimensions {
  height: string;
  width: string;
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  isVisible: boolean;
  isFullScreen: boolean;
}

const SHORT_SCREEN_THRESHOLD = 600; // Adjust this value as needed

export const useEditModalDimensions = (
  isEditModeActive: boolean
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    height: "auto",
    width: "100%",
    position: { bottom: "0", right: "0" },
    isVisible: false,
    isFullScreen: false,
  });

  const updateDimensions = useCallback(() => {
    const { innerWidth, innerHeight } = window;
    const header = document.getElementById("main-header");
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const isShortScreen = innerHeight <= SHORT_SCREEN_THRESHOLD;
    let newDimensions: Dimensions;

    if (innerWidth < 640 || isShortScreen) {
      // Full screen for very small screens or short screens
      newDimensions = {
        height: `calc(100vh - ${headerBottom}px)`,
        width: "100%",
        position: { top: `${headerBottom}px`, right: "0", left: "0" },
        isVisible: isEditModeActive,
        isFullScreen: true,
      };
    } else if (innerWidth < 1368) {
      // Bottom right corner for medium screens
      newDimensions = {
        height: "auto",
        width: `${Math.min(innerWidth * 0.8, 500)}px`,
        position: { bottom: "0px", right: "8px" },
        isVisible: isEditModeActive,
        isFullScreen: false,
      };
    } else {
      // Right side for larger screens
      newDimensions = {
        height: "auto",
        width: "33%",
        position: { top: `${headerBottom}px`, right: "0" },
        isVisible: isEditModeActive,
        isFullScreen: false,
      };
    }
    setDimensions(newDimensions);
  }, [isEditModeActive]);

  useEffect(() => {
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    window.addEventListener("scroll", updateDimensions);

    return () => {
      window.removeEventListener("resize", updateDimensions);
      window.removeEventListener("scroll", updateDimensions);
    };
  }, [updateDimensions]);

  return dimensions;
};
