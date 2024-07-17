import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { editModeStore, storyFragmentInit } from "../../store/storykeep";

export const EditModal = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $editMode = useStore(editModeStore);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const currentEditMode = $editMode[id] || ``;

  useEffect(() => {
    if ($storyFragmentInit[id]?.init && currentEditMode) {
      setIsClient(true);
    }
  }, [id, $storyFragmentInit, currentEditMode]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="m-2">
      <div className="border border-myblue border-2 p-6 border-dotted">
        Mode: {currentEditMode} {id}
      </div>
    </div>
  );
};
