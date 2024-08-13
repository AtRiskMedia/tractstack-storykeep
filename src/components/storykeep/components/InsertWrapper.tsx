import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  unsavedChangesStore,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import {
  insertElementIntoMarkdown,
  updateHistory,
  allowTagInsert,
} from "../../../utils/compositor/markdownUtils";
import {
  toolAddModeTitles,
  toolAddModeInsertDefault,
} from "../../../constants";
import { cloneDeep } from "../../../utils/helpers";
import type { ReactNode } from "react";
import type { MarkdownLookup, ToolAddMode } from "../../../types";

interface Props {
  fragmentId: string;
  paneId: string;
  outerIdx: number;
  idx: number | null;
  queueUpdate: (id: string, updateFn: () => void) => void;
  toolAddMode: ToolAddMode;
  children: ReactNode;
  markdownLookup: MarkdownLookup;
}

const InsertWrapper = ({
  fragmentId,
  paneId,
  outerIdx,
  idx,
  queueUpdate,
  toolAddMode,
  children,
  markdownLookup,
}: Props) => {
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [fragmentId],
  });
  const $unsavedChanges = useStore(unsavedChangesStore, { keys: [paneId] });
  const contentId = `${outerIdx}${typeof idx === "number" ? `-${idx}` : ""}-${fragmentId}`;
  const allowTag = allowTagInsert(toolAddMode, outerIdx, idx, markdownLookup);

  const handleInsert = (position: "before" | "after") => {
    queueUpdate(contentId, () => {
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const currentField = cloneDeep($paneFragmentMarkdown[fragmentId]);
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      const newContent = toolAddModeInsertDefault[toolAddMode];
      const parentTag = markdownLookup.nthTag[outerIdx];
      const newAsideContainer = toolAddMode === `aside` && parentTag !== `ol`;
      // wrap inside ol if new text container
      const thisNewContent = newAsideContainer
        ? `1. ${newContent}`
        : newContent;
      const thisIdx = newAsideContainer ? null : idx;
      const newValue = insertElementIntoMarkdown(
        currentField.current,
        thisNewContent,
        toolAddMode,
        outerIdx,
        thisIdx,
        position,
        markdownLookup
      );
      paneFragmentMarkdown.setKey(fragmentId, {
        ...currentField,
        current: newValue,
        history: newHistory,
      });
      // safely assumes this is new/unsaved
      unsavedChangesStore.setKey(paneId, {
        ...$unsavedChanges[paneId],
        paneFragmentMarkdown: true,
      });
    });
  };

  return (
    <div className="relative group">
      {children}
      <div className="absolute inset-x-0 top-0 h-1/2 z-10 cursor-pointer group/top mix-blend-exclusion">
        {allowTag.before && (
          <div
            onClick={() => handleInsert("before")}
            title={`Insert new ${toolAddModeTitles[toolAddMode]} above`}
            className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-b hover:from-mylightgrey/25 hover:via-mylightgrey/25 hover:to-transparent
                     mix-blend-exclusion
                     before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1
                     before:border-t-4 before:border-dotted before:border-mylightgrey/25 hover:before:border-mylightgrey"
          />
        )}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 cursor-pointer group/bottom mix-blend-exclusion">
        {allowTag.after && (
          <div
            onClick={() => handleInsert("after")}
            title={`Insert new ${toolAddModeTitles[toolAddMode]} below`}
            className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-t hover:from-mylightgrey/25 hover:via-mylightgrey/25 hover:to-transparent
                     mix-blend-exclusion
                     after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1
                     after:border-b-4 after:border-dotted after:border-mylightgrey/25 hover:after:border-mylightgrey"
          />
        )}
      </div>
    </div>
  );
};

export default InsertWrapper;
