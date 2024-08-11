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
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const $unsavedChanges = useStore(unsavedChangesStore);
  const contentId = `${outerIdx}${typeof idx === "number" ? `-${idx}` : ""}-${fragmentId}`;
  const allowTag = allowTagInsert(toolAddMode, outerIdx, idx, markdownLookup);
  // need fn for allowTag
  //console.log(`INSERT CHECK`,allowTag);

  const handleInsert = (position: "before" | "after") => {
    queueUpdate(contentId, () => {
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const currentField = cloneDeep($paneFragmentMarkdown[fragmentId]);
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      const newContent = toolAddModeInsertDefault[toolAddMode];
      console.log(
        `this currently assumes you're inserting block level, e.g. p, h1`,
        position
      );
      console.log(`will need to insert based on toolAddMode:${toolAddMode}`);
      const newValue = insertElementIntoMarkdown(
        currentField.current,
        newContent,
        outerIdx,
        idx,
        position,
        markdownLookup
      );
      console.log(`after edit`, newValue);
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
      <div className="absolute inset-x-0 top-0 h-1/2 z-10 cursor-pointer group/top">
        {allowTag.before && (
          <div
            onClick={() => handleInsert("before")}
            title={`Insert new ${toolAddModeTitles[toolAddMode]} above`}
            className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-b hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion"
          />
        )}
      </div>
      {allowTag.after && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 cursor-pointer group/bottom">
          <div
            onClick={() => handleInsert("after")}
            title={`Insert new ${toolAddModeTitles[toolAddMode]} below`}
            className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-t hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion"
          />
        </div>
      )}
    </div>
  );
};

export default InsertWrapper;
