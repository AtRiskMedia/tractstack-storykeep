import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { ulid } from "ulid";
import {
  editModeStore,
  paneInit,
  storyFragmentInit,
  activeEditModalStore,
} from "../../store/storykeep";
import { StoryFragmentSettings } from "./settings/storyfragment";
import { CodeHookSettings } from "./settings/codehook";
import { PaneSettings } from "./settings/pane";
import { PaneInsert } from "./settings/paneInsert";
import { PaneAstStyles } from "./settings/styles";
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
  const $activeEditModal = useStore(activeEditModalStore);

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
    const handleResize = () => {
      if (window.innerWidth >= 1368) {
        activeEditModalStore.set("desktop");
      } else {
        activeEditModalStore.set("mobile");
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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

  if (!isClient || $activeEditModal !== type) return null;

  return (
    <div className="relative">
      <div className="absolute top-0 right-0">
        <button
          className="bg-white rounded-md hover:bg-myorange"
          title={$editMode?.mode === `insert` ? `Cancel Insert` : `Close panel`}
          onClick={() => toggleOffEditModal()}
        >
          <XMarkIcon className="w-4 h-4 text-black hover:text-white" />
        </button>
      </div>
      <div>
        {$editMode?.type === `storyfragment` &&
        $editMode?.mode === `settings` ? (
          <StoryFragmentSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` && $editMode?.mode === `codehook` ? (
          <CodeHookSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` &&
          $editMode?.mode === `insert` &&
          typeof $editMode?.payload !== `undefined` ? (
          <PaneInsert
            storyFragmentId={$editMode.id}
            paneId={ulid()}
            payload={$editMode.payload}
            toggleOff={toggleOffEditModal}
            doInsert={$editMode?.payload?.doInsert}
            contentMap={contentMap}
          />
        ) : $editMode?.type === `pane` && $editMode?.mode === `settings` ? (
          <PaneSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` &&
          $editMode?.mode === `styles` &&
          typeof $editMode.targetId !== `undefined` ? (
          <PaneAstStyles
            key={contentId}
            id={id}
            targetId={$editMode.targetId}
            type={type}
          />
        ) : null}
      </div>
    </div>
  );
};
