import {
  DevicePhoneMobileIcon,
  DeviceTabletIcon,
  ComputerDesktopIcon,
  ViewfinderCircleIcon,
} from "@heroicons/react/24/outline";
import type { ViewportKey } from "../../../types";

interface ViewportSelectorProps {
  viewport: ViewportKey;
  setViewport: (viewport: "auto" | "mobile" | "tablet" | "desktop") => void;
  hideElements?: boolean;
}

const ViewportSelector = ({
  viewport,
  setViewport,
  hideElements,
}: ViewportSelectorProps) => {
  const classNames = (...classes: string[]) =>
    classes.filter(Boolean).join(" ");
  const viewportButtons = [
    {
      key: "auto",
      Icon: ViewfinderCircleIcon,
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

  return (
    <div>
      <div className="flex items-center">
        <span
          className={`mr-2 text-sm text-mydarkgrey ${hideElements ? `hidden md:block` : ``}`}
        >
          Designing for:
        </span>
        <span
          className={`font-bold text-xl text-myblue pr-4 ${hideElements ? `hidden md:block` : ``}`}
        >
          {viewport !== `auto`
            ? viewport
            : window.innerWidth < 800
              ? `mobile`
              : window.innerWidth <= 1367
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
                "hover:bg-myorange/50 hover:text-black",
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
