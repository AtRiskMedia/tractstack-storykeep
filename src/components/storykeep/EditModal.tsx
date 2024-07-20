import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  editModeStore,
  paneInit,
  storyFragmentInit,
  activeEditModalStore,
} from "../../store/storykeep";
import { StoryFragmentSettings } from "./settings/storyfragment";
import { CodeHookSettings } from "./settings/codehook";
import { PaneSettings } from "./settings/pane";
import { handleToggleOff } from "../../utils/storykeep";
import type { DatumPayload } from "../../types";

interface EditModalProps {
  type: "desktop" | "mobile";
  payload: DatumPayload;
}

export const EditModal = ({ type, payload }: EditModalProps) => {
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
    <div className="m-2">
      <div className="border border-myblue border-2 p-6 border-dotted">
        {$editMode?.type === `storyfragment` &&
        $editMode?.mode === `settings` ? (
          <StoryFragmentSettings id={$editMode.id} payload={payload} />
        ) : $editMode?.type === `pane` && $editMode?.mode === `codehook` ? (
          <CodeHookSettings id={$editMode.id} payload={payload} />
        ) : null}
        {$editMode?.type === `pane` && $editMode?.mode === `settings` ? (
          <PaneSettings id={$editMode.id} payload={payload} />
        ) : null}
      </div>
    </div>
  );
};
