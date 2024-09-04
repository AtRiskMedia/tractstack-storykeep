import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ulid } from "ulid";
import {
  editModeStore,
  paneInit,
  storyFragmentInit,
} from "../../store/storykeep";
import { StoryFragmentSettings } from "./settings/StoryFragmentSettings";
import { PaneSettings } from "./settings/PaneSettings";
import { PaneBreakSettings } from "./settings/PaneBreakSettings";
import { PaneInsert } from "./settings/PaneInsert";
import { PaneAstStyles } from "./settings/PaneAstStyles";
import { handleToggleOff } from "../../utils/storykeep";
import type { ContentMap } from "../../types";

interface EditModalProps {
  id: string;
  type: "desktop" | "mobile";
  contentMap: ContentMap[];
}

export const EditModal = ({ type, contentMap, id }: EditModalProps) => {
  const [isClient, setIsClient] = useState(false);
  const $editMode = useStore(editModeStore);
  const contentId = `${$editMode?.targetId?.tag}-${$editMode?.targetId?.outerIdx}${typeof $editMode?.targetId?.idx === "number" ? `-${$editMode.targetId.idx}` : ""}-${$editMode?.id}`;
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $paneInit = useStore(paneInit);

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
    handleToggleOff();
  };

  if (!isClient) return null;

  return (
    <div className="relative bg-mywhite shadow-md rounded-lg">
      <div className="absolute inset-x-0 top-0 z-[9001]">
        <div className="flex justify-end">
          <button
            className="bg-myorange/20 text-black p-2 rounded-md hover:bg-black hover:text-white m-2"
            title={
              $editMode?.mode === `insert` ? `Cancel Insert` : `Close panel`
            }
            onClick={() => toggleOffEditModal()}
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="px-3.5 py-1.5">
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
            storyFragmentId={id}
            contentMap={contentMap}
          />
        ) : $editMode?.type === `pane` &&
          $editMode?.mode === `styles` &&
          typeof $editMode.targetId !== `undefined` ? (
          <PaneAstStyles
            key={contentId}
            id={id}
            targetId={$editMode.targetId}
            type={type}
          />
        ) : $editMode?.type === `pane` && $editMode?.mode === `break` ? (
          <PaneBreakSettings id={$editMode.id} type={type} />
        ) : null}
      </div>
    </div>
  );
};
