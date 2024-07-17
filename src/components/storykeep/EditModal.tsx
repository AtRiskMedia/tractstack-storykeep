import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { editModeStore, storyFragmentInit } from "../../store/storykeep";
import StoryFragmentTailwindBgColour from "./fields/StoryFragmentTailwindBgColour";
import {
  storeMap,
  validationFunctions,
  useStoryKeepUtils,
  handleToggleOff,
} from "../../utils/storykeep";

export const EditModal = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $editMode = useStore(editModeStore);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const currentEditMode = $editMode[id] || ``;

  // helpers
  const { isEditing, updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(id, storeMap, validationFunctions);

  useEffect(() => {
    if ($storyFragmentInit[id]?.init && currentEditMode) {
      setIsClient(true);
    }
  }, [id, $storyFragmentInit, currentEditMode]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="m-2">
      <div className="border border-myblue border-2 p-6 border-dotted">
        <div>
          Mode: {currentEditMode} {id}
        </div>
        <StoryFragmentTailwindBgColour
          id={id}
          isEditing={isEditing}
          handleEditingChange={handleEditingChange}
          updateStoreField={updateStoreField}
          handleUndo={handleUndo}
        />
      </div>
    </div>
  );
};
