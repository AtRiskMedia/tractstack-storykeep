import { useCallback, useEffect, useRef } from "react";
import { useStore } from "@nanostores/react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
import {
  paneFragmentMarkdown,
  unsavedChangesStore,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
  editModeStore,
  toolModeStore, dragHandleStore, setDragHoverInfo, removeHoverNode,
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
import { isPosInsideRect } from "@utils/math.ts";

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

enum Location {
  NOWHERE = -1,
  BEFORE = 0,
  AFTER = 1
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

  const dragState = useStore(dragHandleStore);
  const beforeArea = useRef<HTMLDivElement>(null);
  const afterArea = useRef<HTMLDivElement>(null);
  const activeHoverArea = useRef<Location>(Location.NOWHERE);
  const self = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if(!dragState.dropState) {
      let hitAnyArea = false;
      if (beforeArea.current) {
        const rect = beforeArea.current.getBoundingClientRect();
        if (isPosInsideRect(rect, dragState.pos)) {
          console.log("inside beforeArea");
          hitAnyArea = true;
          activeHoverArea.current = Location.BEFORE;
          setDragHoverInfo(self.current as HTMLElement, { fragmentId, paneId, idx, outerIdx, location: "before" });
        }
      }
      if (afterArea.current) {
        const rect = afterArea.current.getBoundingClientRect();
        if (isPosInsideRect(rect, dragState.pos)) {
          console.log("inside afterArea");
          hitAnyArea = true;
          activeHoverArea.current = Location.AFTER;
          setDragHoverInfo(self.current as HTMLElement, { fragmentId, paneId, idx, outerIdx, location: "after" });
        }
      }

      if(!hitAnyArea) {
        activeHoverArea.current = Location.NOWHERE;
        removeHoverNode(self.current as HTMLElement);
      }
    } else {
      if(dragState.dropState.fragmentId === fragmentId
        && dragState.dropState.paneId === paneId
        && dragState.dropState.idx === idx
        && dragState.dropState.outerIdx === outerIdx) {
        console.log(`Drop active element: ${JSON.stringify(dragState.dropState)}`);
        handleInsert(dragState.dropState.location);
      }
    }
  }, [dragState])

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
          if (
            Object.keys(markdownLookup.nthTag).length <
            Object.keys(newMarkdownLookup.nthTag).length
          ) {
            newOuterIdx = outerIdx + 1;
            newIdx = 0;
          } else if (typeof idx === `number`) {
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
      <div className="relative min-h-[200px] w-full">
        <button
          className="pointer-events-auto relative z-103 h-full min-h-[200px] w-full bg-mygreen/20 hover:bg-mygreen/50"
          title={`Add ${toolAddModeTitles[toolAddMode]}`}
          onClick={() => handleInsert("before")}
        >
          <div
            className="absolute left-1/2 top-1/2 mx-6 -translate-x-1/2 -translate-y-1/2
             transform rounded-sm bg-mywhite p-2.5 font-action
             text-xl text-black shadow-md md:text-3xl"
          >
            Add {toolAddModeTitles[toolAddMode]}
          </div>
        </button>
      </div>
    );
  }

  const canDrawGhostBlock = (location: Location): boolean => {
    return activeHoverArea.current === location;
  };

  const drawGhostBlock = (location: Location) => {
    const getOffsetClass = (): string => {
      switch (location) {
        case Location.AFTER: return "top-[30px]";
        case Location.BEFORE: return "bottom-[30px]";
        default: return "";
      }
    }
    return (
      <div className={`absolute w-full bg-blue-200 h-20 ${getOffsetClass()}`}/>
    );
  }

  return (
    <div className="relative" ref={self}>
      {children}
      <div ref={beforeArea}
        className={classNames(
          "group absolute inset-x-0 top-0 h-1/2 z-100 group/top ",
          allowTag.before ? `cursor-pointer` : ``
        )}
      >
        {allowTag.before && (
          <>
            {canDrawGhostBlock(Location.BEFORE) && drawGhostBlock(Location.BEFORE)}
            <div
              className="absolute top-1/2 left-0 transform -translate-y-1/2
             text-black bg-yellow-300 p-1.5 rounded-sm shadow-md
             text-md font-action ml-6 group-hover:bg-black group-hover:text-white"
            >
              <ArrowUpIcon className="h-4 w-4" />
            </div>
            <div
              onClick={() => handleInsert("before")}
              title={`Insert new ${toolAddModeTitles[toolAddMode]} above`}
              className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-b hover:from-mylightgrey/25 hover:via-mylightgrey/25 hover:to-transparent
                     before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-1
                     before:border-t-4 before:border-dotted before:border-mylightgrey/25 hover:before:border-mylightgrey"
            />
          </>
        )}
      </div>
      <div ref={afterArea}
        className={classNames(
          "group absolute inset-x-0 bottom-0 h-1/2 z-100 group/bottom ",
          allowTag.after ? `cursor-pointer` : ``
        )}
      >
        {allowTag.after && (
          <>
            {canDrawGhostBlock(Location.AFTER) && drawGhostBlock(Location.AFTER)}
            <div
              className="absolute top-1/2 right-0 transform -translate-y-1/2
             text-black bg-yellow-300 p-1.5 rounded-sm shadow-md
             text-md font-action mr-6 group-hover:bg-black group-hover:text-white"
            >
              <ArrowDownIcon className="h-4 w-4" />
            </div>
            <div
              onClick={() => handleInsert("after")}
              title={`Insert new ${toolAddModeTitles[toolAddMode]} below`}
              className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-t hover:from-mylightgrey/25 hover:via-mylightgrey/25 hover:to-transparent
                     after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1
                     after:border-b-4 after:border-dotted after:border-mylightgrey/25 hover:after:border-mylightgrey"
            />
          </>
        )}
      </div>
    </div>
  );
};

export default InsertWrapper;
