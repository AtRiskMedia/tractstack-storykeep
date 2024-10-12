import { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ulid } from "ulid";
import {
  editModeStore,
  paneInit,
  storyFragmentInit,
  creationStateStore,
} from "../../store/storykeep";
import { StoryFragmentSettings } from "./settings/StoryFragmentSettings";
import { PaneSettings } from "./settings/PaneSettings";
import { PaneBreakSettings } from "./settings/PaneBreakSettings";
import { PaneInsert } from "./settings/PaneInsert";
import { PaneAstStyles } from "./settings/PaneAstStyles";
import { useEditModalDimensions } from "../../hooks/useEditModalDimensions";
import { classNames } from "../../utils/helpers";
import type { ContentMap, FileDatum } from "../../types";

interface EditModalProps {
  id: string;
  contentMap: ContentMap[];
  files: FileDatum[];
}

export const EditModal = ({ id, contentMap, files }: EditModalProps) => {
  const $creationState = useStore(creationStateStore);
  //const [shouldScroll, setShouldScroll] = useState(false);
  const thisId = id !== `create` ? id : ($creationState.id ?? `error`);
  const [isClient, setIsClient] = useState(false);
  const $editMode = useStore(editModeStore);
  const contentId = `${$editMode?.targetId?.tag}-${$editMode?.targetId?.outerIdx}${typeof $editMode?.targetId?.idx === "number" ? `-${$editMode.targetId.idx}` : ""}-${$editMode?.id}`;
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $paneInit = useStore(paneInit);
  const contentRef = useRef<HTMLDivElement>(null);
  const [type, setType] = useState<"desktop" | "mobile">(
    typeof window !== "undefined" && window.innerWidth >= 1368
      ? "desktop"
      : "mobile"
  );
  const {
    height,
    width,
    position,
    isVisible,
    isFullScreen,
    //isFullWidthMobileShort,
  } = useEditModalDimensions($editMode !== null);

  //const scrollToTarget = useCallback(() => {
  //  if ($editMode?.targetId) {
  //    const targetId = `${$editMode.targetId.paneId}-${$editMode.targetId.tag}-${$editMode.targetId.outerIdx}${$editMode.targetId.idx !== null ? `-${$editMode.targetId.idx}` : ""}`;

  //    const targetElement = document.getElementById(targetId);
  //    const modalElement = document.getElementById("edit-modal");

  //    if (targetElement && modalElement) {
  //      const modalRect = modalElement.getBoundingClientRect();
  //      const targetRect = targetElement.getBoundingClientRect();
  //      const viewportHeight = window.innerHeight;
  //      const currentScrollY = window.scrollY;
  //      const modalHeight = modalRect.height;
  //      const spaceAboveModal = viewportHeight - modalHeight;
  //      const targetDesiredTop = Math.max(
  //        spaceAboveModal / 2 - targetRect.height / 2,
  //        0
  //      );
  //      const newScrollY = currentScrollY + targetRect.top - targetDesiredTop;
  //      const finalScrollY = Math.max(0, newScrollY);
  //      window.scrollTo({
  //        top: finalScrollY,
  //        behavior: "smooth",
  //      });
  //    }
  //  }
  //}, [$editMode?.targetId]);

  //useEffect(() => {
  //  const header = document.getElementById("main-header");
  //  if (header) {
  //    if (isFullWidthMobileShort && isVisible) {
  //      header.classList.add("header-hidden");
  //    } else {
  //      header.classList.remove("header-hidden");
  //    }
  //    setTimeout(() => {
  //      if (isFullWidthMobileShort && isVisible) {
  //        header.classList.add("hidden");
  //        header.classList.remove("block");
  //      } else {
  //        header.classList.remove("hidden");
  //        header.classList.add("block");
  //      }
  //    }, 100);
  //  }
  //}, [isFullWidthMobileShort, isVisible]);

  //useEffect(() => {
  //  if (
  //    (shouldScroll || $editMode?.targetId) &&
  //    isVisible &&
  //    isFullWidthMobileShort
  //  ) {
  //    setTimeout(() => {
  //      scrollToTarget();
  //      setShouldScroll(false);
  //    }, 100);
  //  }
  //}, [shouldScroll, $editMode?.targetId, isVisible, scrollToTarget]);

  const triggerScroll = useCallback(() => {
    //if (isFullWidthMobileShort) setShouldScroll(true);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setType(window.innerWidth >= 1368 ? "desktop" : "mobile");
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (
      ($editMode?.type === `pane` && $editMode?.mode === `insert`) ||
      ($editMode?.type === `storyfragment` &&
        $storyFragmentInit[$editMode.id].init) ||
      ($editMode?.type === `pane` && $paneInit[$editMode.id].init)
    )
      setIsClient(true);
  }, [$storyFragmentInit, $paneInit, $editMode]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && $editMode !== null) {
        toggleOffEditModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [$editMode]);

  const toggleOffEditModal = () => {
    if (
      $editMode?.type === `pane` &&
      $editMode?.mode === `insert` &&
      typeof $editMode?.payload !== `undefined`
    ) {
      const cancelInsert = $editMode?.payload?.cancelInsert;
      if (cancelInsert) cancelInsert();
    }
    editModeStore.set(null);
  };

  if (!isClient || !isVisible) return null;

  return (
    <div className="relative">
      <div
        id="edit-modal"
        className={classNames(
          `fixed z-[9000]`,
          `backdrop-blur-sm bg-mydarkgrey/50`,
          `shadow-lg transition-all duration-300 ease-in-out`,
          type === `desktop` ? "rounded-bl-lg" : "rounded-t-lg"
        )}
        style={{
          height: isFullScreen ? "100%" : height,
          width,
          ...position,
          display: isVisible ? "block" : "none",
          maxHeight: "80vh",
        }}
      >
        {isFullScreen ? (
          <div className="sticky top-0 z-[9001] w-full bg-myorange p-2 flex justify-end">
            <button
              onClick={toggleOffEditModal}
              className="bg-myorange/80 hover:bg-myorange text-white rounded-full p-2 shadow-lg transition-all duration-300 ease-in-out"
              title={
                $editMode?.mode === `insert` ? `Cancel Insert` : `Close panel`
              }
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        ) : (
          <div className="relative">
            <button
              onClick={toggleOffEditModal}
              className={classNames(
                "absolute z-[9001] bg-myorange/80 hover:bg-myorange text-white rounded-full p-2 shadow-lg",
                "transition-all duration-300 ease-in-out",
                type === "desktop" ? "-left-12 top-2" : "-top-12 right-2"
              )}
              title={
                $editMode?.mode === `insert` ? `Cancel Insert` : `Close panel`
              }
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        )}
        <div
          ref={contentRef}
          className={classNames(
            isFullScreen
              ? "px-1.5 pt-1.5 pb-0"
              : type === `desktop`
                ? "pr-0 pl-1.5 pb-1.5"
                : "px-1.5 pt-1.5 pb-0",
            "h-full flex flex-col"
          )}
        >
          <div
            className={classNames(
              isFullScreen
                ? "rounded-t-lg"
                : type === `desktop`
                  ? "rounded-bl-lg py-1.5"
                  : "rounded-t-lg pt-1.5 pb-2.5",
              "bg-white px-3.5 relative flex-grow"
            )}
          >
            {$editMode?.type === `storyfragment` &&
            $editMode?.mode === `settings` ? (
              <StoryFragmentSettings id={$editMode.id} />
            ) : $editMode?.type === `pane` &&
              $editMode?.mode === `insert` &&
              typeof $editMode?.payload !== `undefined` ? (
              <PaneInsert
                storyFragmentId={$editMode.id}
                paneId={
                  $editMode.payload.selectedDesign.id ===
                  $editMode.payload.selectedDesign.slug
                    ? ulid()
                    : $editMode.payload.selectedDesign.id
                }
                payload={$editMode.payload}
                toggleOff={toggleOffEditModal}
                doInsert={$editMode?.payload?.doInsert}
                contentMap={contentMap}
                reuse={
                  $editMode.payload.selectedDesign.id !==
                  $editMode.payload.selectedDesign.slug
                }
              />
            ) : $editMode?.type === `pane` && $editMode?.mode === `settings` ? (
              <PaneSettings
                id={$editMode.id}
                storyFragmentId={thisId}
                contentMap={contentMap}
              />
            ) : $editMode?.type === `pane` &&
              $editMode?.mode === `styles` &&
              typeof $editMode.targetId !== `undefined` ? (
              <PaneAstStyles
                key={contentId}
                id={thisId}
                files={files}
                targetId={$editMode.targetId}
                triggerScroll={triggerScroll}
              />
            ) : $editMode?.type === `pane` && $editMode?.mode === `break` ? (
              <PaneBreakSettings id={$editMode.id} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
