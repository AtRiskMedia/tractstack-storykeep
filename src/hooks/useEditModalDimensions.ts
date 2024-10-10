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
  isFullWidthMobileShort: boolean;
}

const SHORT_SCREEN_THRESHOLD = 900;
const SMALL_SCREEN_WIDTH = 600;

export const useEditModalDimensions = (
  isEditModeActive: boolean
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    height: "auto",
    width: "100%",
    position: { bottom: "0", right: "0" },
    isVisible: false,
    isFullScreen: false,
    isFullWidthMobileShort: false,
  });

  const updateDimensions = useCallback(() => {
    const { innerWidth, innerHeight } = window;
    const header = document.getElementById("main-header");
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const isShortScreen = innerHeight <= SHORT_SCREEN_THRESHOLD;
    let newDimensions: Dimensions;

    if (innerWidth < SMALL_SCREEN_WIDTH || isShortScreen) {
      newDimensions = {
        height: "auto",
        width: "100%",
        position: { bottom: "0", left: "0", right: "0" },
        isVisible: isEditModeActive,
        isFullScreen: false,
        isFullWidthMobileShort: true,
      };
    } else if (innerWidth < 1368) {
      newDimensions = {
        height: "auto",
        width: `${Math.min(innerWidth * 0.8, 500)}px`,
        position: { bottom: "0px", right: "8px" },
        isVisible: isEditModeActive,
        isFullScreen: false,
        isFullWidthMobileShort: false,
      };
    } else {
      newDimensions = {
        height: "auto",
        width: "33%",
        position: { top: `${headerBottom}px`, right: "0" },
        isVisible: isEditModeActive,
        isFullScreen: false,
        isFullWidthMobileShort: false,
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
