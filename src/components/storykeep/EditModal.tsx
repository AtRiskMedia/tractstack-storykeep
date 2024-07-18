import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  editModeStore,
  paneInit,
  storyFragmentInit,
} from "../../store/storykeep";
import { StoryFragmentSettings } from "./settings/storyfragment";
import { CodeHookSettings } from "./settings/codehook";

export const EditModal = () => {
  const [isClient, setIsClient] = useState(false);
  const $editMode = useStore(editModeStore);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $paneInit = useStore(paneInit);

  useEffect(() => {
    if (
      ($editMode?.type === `storyfragment` &&
        $storyFragmentInit[$editMode.id].init) ||
      ($editMode?.type === `pane` && $paneInit[$editMode.id].init)
    )
      setIsClient(true);
  }, [$storyFragmentInit, $paneInit, $editMode]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="m-2">
      <div className="border border-myblue border-2 p-6 border-dotted">
        {$editMode?.type === `storyfragment` &&
        $editMode?.mode === `settings` ? (
          <StoryFragmentSettings id={$editMode.id} />
        ) : $editMode?.type === `pane` && $editMode?.mode === `codehook` ? (
          <CodeHookSettings id={$editMode.id} />
        ) : null}
      </div>
    </div>
  );
};
