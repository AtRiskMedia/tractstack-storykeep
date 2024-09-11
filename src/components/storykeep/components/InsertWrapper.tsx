import { useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  unsavedChangesStore,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
  editModeStore,
  toolModeStore,
} from "../../../store/storykeep";
import {
  insertElementIntoMarkdown,
  updateHistory,
  allowTagInsert,
  getGlobalNth,
} from "../../../utils/compositor/markdownUtils";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import {
  toolAddModeTitles,
  toolAddModeInsertDefault,
} from "../../../constants";
import { cloneDeep, classNames } from "../../../utils/helpers";
import type { ReactNode } from "react";
import type { MarkdownLookup, ToolAddMode } from "../../../types";

interface InsertWrapperProps {
  fragmentId: string;
  paneId: string;
  outerIdx: number;
  idx: number | null;
  queueUpdate: (id: string, updateFn: () => void) => void;
  toolAddMode: ToolAddMode;
  children?: ReactNode;
  markdownLookup: MarkdownLookup;
  isEmpty: boolean;
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
  isEmpty,
}: InsertWrapperProps) => {
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [fragmentId],
  });
  const $unsavedChanges = useStore(unsavedChangesStore, { keys: [paneId] });
  const contentId = `${outerIdx}${typeof idx === "number" ? `-${idx}` : ""}-${fragmentId}`;
  const allowTag = isEmpty
    ? { before: true, after: true }
    : allowTagInsert(toolAddMode, outerIdx, idx, markdownLookup);

  const handleInsert = useCallback(
    (position: "before" | "after") => {
      queueUpdate(contentId, () => {
        lastInteractedTypeStore.set(`markdown`);
        lastInteractedPaneStore.set(paneId);
        const currentField = cloneDeep($paneFragmentMarkdown[fragmentId]);
        const now = Date.now();
        const newHistory = updateHistory(currentField, now);
        const newContent = toolAddModeInsertDefault[toolAddMode];
        const parentTag = isEmpty ? null : markdownLookup.nthTag[outerIdx];
        const newImgContainer = toolAddMode === `img` && parentTag !== `ul`;
        const newAsideContainer = toolAddMode === `aside` && parentTag !== `ol`;
        const thisNewContent = newImgContainer
          ? `* ${newContent}`
          : newAsideContainer
            ? `1. ${newContent}`
            : newContent;
        const thisIdx = newAsideContainer ? null : idx;
        const thisOuterIdx = isEmpty ? 0 : outerIdx;
        const thisPosition = isEmpty ? "before" : position;
        const newValue = insertElementIntoMarkdown(
          currentField.current,
          thisNewContent,
          toolAddMode,
          thisOuterIdx,
          thisIdx,
          thisPosition,
          markdownLookup
        );
        const newMarkdownLookup = generateMarkdownLookup(
          newValue.markdown.htmlAst
        );
        let newOuterIdx = thisOuterIdx;
        let newIdx = thisIdx || 0;
        if (position === "after" && !isEmpty) {
          if (idx === null) {
            newOuterIdx = outerIdx + 1;
          } else {
            newIdx = idx + 1;
          }
        }
        const newTag =
          toolAddMode === "img"
            ? `img`
            : [
                  `code`,
                  `img`,
                  `yt`,
                  `bunny`,
                  `belief`,
                  `toggle`,
                  `identify`,
                ].includes(toolAddMode)
              ? `code`
              : toolAddMode === `aside`
                ? `li`
                : toolAddMode;
        const newGlobalNth =
          getGlobalNth(newTag, newIdx, newOuterIdx, newMarkdownLookup) || 0;

        if (
          [
            `img`,
            `code`,
            `img`,
            `yt`,
            `bunny`,
            `belief`,
            `toggle`,
            `identify`,
          ].includes(toolAddMode)
        ) {
          editModeStore.set({
            id: paneId,
            mode: "styles",
            type: "pane",
            targetId: {
              paneId,
              outerIdx: newOuterIdx,
              idx: newIdx,
              globalNth: newGlobalNth,
              tag: newTag,
              mustConfig: true,
            },
          });
        }
        paneFragmentMarkdown.setKey(fragmentId, {
          ...currentField,
          current: newValue,
          history: newHistory,
        });
        unsavedChangesStore.setKey(paneId, {
          ...$unsavedChanges[paneId],
          paneFragmentMarkdown: true,
        });
        toolModeStore.set({ value: `text` });
      });
    },
    [
      fragmentId,
      paneId,
      outerIdx,
      idx,
      queueUpdate,
      toolAddMode,
      markdownLookup,
      isEmpty,
      $paneFragmentMarkdown,
      $unsavedChanges,
      contentId,
    ]
  );

  if (isEmpty) {
    return (
      <div className="min-h-[200px] w-full relative">
        <button
          className="relative z-103 w-full h-full bg-mygreen/20 hover:bg-mygreen/50 pointer-events-auto min-h-[200px]"
          title={`Add ${toolAddModeTitles[toolAddMode]}`}
          onClick={() => handleInsert("before")}
        >
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
             text-black bg-mywhite p-2.5 rounded-sm shadow-md
             text-xl md:text-3xl font-action mx-6"
          >
            Add {toolAddModeTitles[toolAddMode]}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative group">
      {children}
      <div
        className={classNames(
          "absolute inset-x-0 top-0 h-1/2 z-100 group/top mix-blend-exclusion",
          allowTag.before ? `cursor-pointer` : ``
        )}
      >
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
      <div
        className={classNames(
          "absolute inset-x-0 bottom-0 h-1/2 z-100 group/bottom mix-blend-exclusion",
          allowTag.after ? `cursor-pointer` : ``
        )}
      >
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
