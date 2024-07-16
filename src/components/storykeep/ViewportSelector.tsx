import React, { useEffect, useState } from "react";
import {
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  ArrowsPointingOutIcon,
} from "@heroicons/react/24/outline";
import { debounce } from "../../utils/helpers";

interface ViewportSelectorProps {
  viewport: "auto" | "mobile" | "tablet" | "desktop";
  setViewport: (viewport: "auto" | "mobile" | "tablet" | "desktop") => void;
}

const ViewportSelector: React.FC<ViewportSelectorProps> = ({
  viewport,
  setViewport,
}) => {
  const [width, setWidth] = useState(0);
  const classNames = (...classes: string[]) =>
    classes.filter(Boolean).join(" ");
  const viewportButtons = [
    {
      key: "auto",
      Icon: ArrowsPointingOutIcon,
      title: "Auto or responsive view",
    },
    {
      key: "mobile",
      Icon: DevicePhoneMobileIcon,
      title: "Mobile or small screens",
    },
    {
      key: "tablet",
      Icon: DeviceTabletIcon,
      title: "Tablet or medium screens",
    },
    {
      key: "desktop",
      Icon: ComputerDesktopIcon,
      title: "Desktop or large screens",
    },
  ] as const;

  useEffect(() => {
    const handleResize = debounce(() => {
      const mainContent = document.getElementById(
        "main-content"
      ) as HTMLElement;
      setWidth(mainContent.offsetWidth);
    }, 100);

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div>
      <div className="flex items-center">
        <span className="mr-2 text-sm text-mydarkgrey">Designing for:</span>
        <span className="font-bold text-xl text-myblue pr-4">
          {viewport !== `auto`
            ? viewport
            : width < 800
              ? `mobile`
              : width <= 1367
                ? `tablet`
                : `desktop`}
        </span>
        <span className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          {viewportButtons.map(({ key, Icon, title }, index) => (
            <button
              key={key}
              type="button"
              title={title}
              className={classNames(
                "hover:bg-myorange hover:text-white",
                viewport === key
                  ? "bg-myblue text-white"
                  : "bg-mylightgrey/20 text-mydarkgrey ring-1 ring-inset ring-slate-200 focus:z-10",
                "relative inline-flex items-center px-3 py-2",
                index === 0 ? "rounded-l-md" : "",
                index === viewportButtons.length - 1 ? "rounded-r-md" : ""
              )}
              onClick={() => {
                setViewport(key);
              }}
            >
              <span className="sr-only">{key}</span>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </button>
          ))}
        </span>
      </div>
    </div>
  );
};

export default ViewportSelector;
