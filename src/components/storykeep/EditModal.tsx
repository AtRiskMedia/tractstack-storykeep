import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { XMarkIcon } from "@heroicons/react/24/outline";

import {
  editModeStore,
  paneInit,
  storyFragmentInit,
  activeEditModalStore,
} from "../../store/storykeep";
import { StoryFragmentSettings } from "./settings/storyfragment";
import { CodeHookSettings } from "./settings/codehook";
import { PaneSettings } from "./settings/pane";
import { PaneAstStyles } from "./settings/styles";
import { handleToggleOff } from "../../utils/storykeep";

interface EditModalProps {
  type: "desktop" | "mobile";
}

export const EditModal = ({ type }: EditModalProps) => {
  const [isClient, setIsClient] = useState(false);
  const $editMode = useStore(editModeStore);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $paneInit = useStore(paneInit);
  const $activeEditModal = useStore(activeEditModalStore);

  useEffect(() => {
    if (
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
    editModeStore.set(null);
    handleToggleOff();
  };

  if (!isClient || $activeEditModal !== type) return null;

  return (
    <div className="relative">
      <div className="absolute right-4 top-4">
        <button title="Close panel" onClick={() => toggleOffEditModal()}>
          <XMarkIcon className="w-4 h-4 text-black/50 hover:text-black" />
        </button>
      </div>
      <div className="p-6">
        {$editMode?.type === `storyfragment` &&
        $editMode?.mode === `settings` ? (
          <StoryFragmentSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` && $editMode?.mode === `codehook` ? (
          <CodeHookSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` && $editMode?.mode === `settings` ? (
          <PaneSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` &&
          $editMode?.mode === `styles` &&
          typeof $editMode.targetId !== `undefined` ? (
          <PaneAstStyles id={$editMode.id} targetId={$editMode.targetId} />
        ) : null}
      </div>
    </div>
  );
};
