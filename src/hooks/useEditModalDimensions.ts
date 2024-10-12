import { useState, useEffect, useCallback } from "react";
import { SMALL_SCREEN_WIDTH } from "../constants";

interface Dimensions {
  height: string;
  width: string;
  position: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  isFullWidthMobileShort: boolean;
}

export const useEditModalDimensions = (
  isEditModeActive: boolean
): Dimensions => {
  const [mode, setMode] = useState(0);
  const [dimensions, setDimensions] = useState<Dimensions>({
    height: "auto",
    width: "100%",
    position: { bottom: "0", right: "0" },
    isFullWidthMobileShort: false,
  });

  const updateDimensions = useCallback(() => {
    const { innerWidth } = window;
    const header = document.getElementById("main-header");
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    let newDimensions: Dimensions;
    if (innerWidth < SMALL_SCREEN_WIDTH) {
      setMode(1);
      newDimensions = {
        height: "auto",
        width: "100%",
        position: { bottom: "0", left: "0", right: "0" },
        isFullWidthMobileShort: true,
      };
    } else if (innerWidth < 1368) {
      setMode(2);
      newDimensions = {
        height: "auto",
        width: `${Math.min(innerWidth * 0.8, 500)}px`,
        position: { bottom: "0px", right: "8px" },
        isFullWidthMobileShort: false,
      };
    } else {
      setMode(3);
      newDimensions = {
        height: "auto",
        width: "33%",
        position: { top: `${headerBottom}px`, right: "0" },
        isFullWidthMobileShort: false,
      };
    }
    setDimensions(newDimensions);
  }, [isEditModeActive]);

  useEffect(() => {
    updateDimensions();
    const handleResize = () => {
      if (
        innerWidth >= SMALL_SCREEN_WIDTH
        //(innerWidth < SMALL_SCREEN_WIDTH && mode !== 1) ||
        //(innerWidth < 1368 && mode !== 2) ||
        //(innerWidth >= 1368 && mode !== 3)
      )
        updateDimensions();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [mode, updateDimensions]);

  return dimensions;
};
