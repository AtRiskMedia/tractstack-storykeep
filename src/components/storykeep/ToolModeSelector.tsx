import React from "react";
import {
  PencilSquareIcon,
  PaintBrushIcon,
  Cog8ToothIcon,
} from "@heroicons/react/24/outline";

interface ToolModeSelectorProps {
  toolMode: "text" | "styles" | "settings";
  setToolMode: (toolMode: "text" | "styles" | "settings") => void;
}

const ToolModeSelector: React.FC<ToolModeSelectorProps> = ({
  toolMode,
  setToolMode,
}) => {
  const classNames = (...classes: string[]) =>
    classes.filter(Boolean).join(" ");

  const toolModeButtons = [
    {
      key: "text" as const,
      Icon: PencilSquareIcon,
      title: "Edit text content",
    },
    {
      key: "styles" as const,
      Icon: PaintBrushIcon,
      title: "Edit styles",
    },
    {
      key: "settings" as const,
      Icon: Cog8ToothIcon,
      title: "Edit settings",
    },
  ];

  return (
    <div>
      <div className="flex items-center">
        <span className="mr-2 text-sm text-mydarkgrey">Current tool:</span>
        <span className="font-bold text-xl text-myblue pr-4">{toolMode}</span>
        <span className="isolate inline-flex -space-x-px rounded-md shadow-sm">
          {toolModeButtons.map(({ key, Icon, title }, index) => (
            <button
              key={key}
              type="button"
              title={title}
              className={classNames(
                "hover:bg-myorange hover:text-white",
                toolMode === key
                  ? "bg-myblue text-white"
                  : "bg-mylightgrey/20 text-mydarkgrey ring-1 ring-inset ring-slate-200 focus:z-10",
                "relative inline-flex items-center px-3 py-2",
                index === 0 ? "rounded-l-md" : "",
                index === toolModeButtons.length - 1 ? "rounded-r-md" : ""
              )}
              onClick={() => {
                setToolMode(key);
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

export default ToolModeSelector;
