import { memo } from "react";
import { useStore } from "@nanostores/react";
import { paneFragmentMarkdown } from "../../../store/storykeep";
import { toolAddModeTitles, toolAddModes } from "../../../constants";
import type { ToolAddMode } from "../../../types";
import type { ReactNode } from "react";

interface InsertWrapperProps {
  children: React.ReactNode;
  onInsertClick: (position: "top" | "bottom") => void;
  toolAddMode: ToolAddMode;
}

interface Props {
  toolAddMode: string;
  fragmentId: string;
  outerIdx: number;
  idx: number | null;
  children: ReactNode;
}

const InsertWrapper = memo(
  ({ toolAddMode, fragmentId, outerIdx, idx, children }: Props) => {
    const thisTag =
      toolAddModeTitles[toolAddMode as keyof typeof toolAddModeTitles] ||
      "element";
    const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
    const onClick = (mode: boolean) => {
      console.log(fragmentId, outerIdx, idx);
      console.log($paneFragmentMarkdown[fragmentId].current.markdown.body);
      console.log(
        `MUST VALIDATE -- can ${thisTag || `Tag`} be added here?`,
        mode ? `below` : `above`
      );
    };

    return (
      <div className="relative group">
        {children}
        <div className="absolute inset-x-0 top-0 h-1/2 z-10 cursor-pointer group/top">
          <div
            onClick={() => onClick(false)}
            title={`Insert new ${thisTag} above this one`}
            className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-b hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion
                     before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5
                     before:bg-mylightgrey hover:before:bg-mylightgrey"
          />
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 cursor-pointer group/bottom">
          <div
            onClick={() => onClick(true)}
            title={`Insert new ${thisTag} below this one`}
            className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-t hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion
                     after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
                     after:bg-mylightgrey hover:after:bg-mylightgrey"
          />
        </div>
      </div>
    );
  }
);

export default InsertWrapper;
