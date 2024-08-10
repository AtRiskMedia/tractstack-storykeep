import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  unsavedChangesStore,
} from "../../../store/storykeep";
import {
  insertElementIntoMarkdown,
  updateHistory,
} from "../../../utils/compositor/markdownUtils";
import { toolAddModeTitles } from "../../../constants";
import { cloneDeep } from "../../../utils/helpers";
import type { ReactNode } from "react";
import type { MarkdownLookup, ToolAddMode } from "../../../types";

interface Props {
  fragmentId: string;
  paneId: string;
  outerIdx: number;
  idx: number | null;
  toolAddMode: ToolAddMode;
  children: ReactNode;
  markdownLookup: MarkdownLookup;
}

const InsertWrapper = ({
  fragmentId,
  paneId,
  outerIdx,
  idx,
  toolAddMode,
  children,
  markdownLookup,
}: Props) => {
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const $unsavedChanges = useStore(unsavedChangesStore);

  const handleInsert = (position: "before" | "after") => {
    const currentField = cloneDeep($paneFragmentMarkdown[fragmentId]);
    const now = Date.now();
    const newHistory = updateHistory(currentField, now);
    const newContent = `${toolAddModeTitles[toolAddMode]} content`;
    const insertIdx = position === "after" ? outerIdx + 1 : outerIdx;
    const newValue = insertElementIntoMarkdown(
      currentField.current,
      newContent,
      insertIdx,
      idx,
      markdownLookup
    );
    paneFragmentMarkdown.setKey(fragmentId, {
      ...currentField,
      current: newValue,
      history: newHistory,
    });
    unsavedChangesStore.setKey(paneId, {
      ...$unsavedChanges[paneId],
      paneFragmentMarkdown: true,
    });
  };

  return (
    <div className="relative group">
      {children}
      <div className="absolute inset-x-0 top-0 h-1/2 z-10 cursor-pointer group/top">
        <div
          onClick={() => handleInsert("before")}
          title={`Insert new ${toolAddModeTitles[toolAddMode]} above`}
          className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-b hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 cursor-pointer group/bottom">
        <div
          onClick={() => handleInsert("after")}
          title={`Insert new ${toolAddModeTitles[toolAddMode]} below`}
          className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-t hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion"
        />
      </div>
    </div>
  );
};

export default InsertWrapper;
