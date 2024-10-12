import { useState, useEffect , useMemo } from "react";
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
): Dimensions => {
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [headerBottom, setHeaderBottom] = useState(0);

  useEffect(() => {
    const header = document.getElementById("main-header");
    setHeaderBottom(header?.getBoundingClientRect().bottom || 0);

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setHeaderBottom(header?.getBoundingClientRect().bottom || 0);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const dimensions = useMemo<Dimensions>(() => {
    if (windowWidth < SMALL_SCREEN_WIDTH) {
      return {
        height: "auto",
        width: "100%",
        position: { bottom: "0", left: "0", right: "0" },
        isFullWidthMobileShort: true,
      };
    } else if (windowWidth < 1368) {
      return {
        height: "auto",
        width: `${Math.min(windowWidth * 0.8, 500)}px`,
        position: { bottom: "0px", right: "8px" },
        isFullWidthMobileShort: false,
      };
    } else {
      return {
        height: "auto",
        width: "33%",
        position: { top: `${headerBottom}px`, right: "0" },
        isFullWidthMobileShort: false,
      };
    }
  }, [windowWidth, headerBottom]);

  return dimensions;
};
