import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  editModeStore,
  paneInit,
  storyFragmentInit,
} from "../../store/storykeep";

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
        Mode: {$editMode?.mode} {$editMode?.id}
      </div>
    </div>
  );
};
