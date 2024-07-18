//import { useStore } from "@nanostores/react";
import {
  useStoryKeepUtils,
  storeMap,
  validationFunctions,
} from "../../../utils/storykeep";
//import {
//  unsavedChangesStore,
//  uncleanDataStore,
//} from "../../../store/storykeep";

import StoryFragmentSocialImagePath from "../fields/StoryFragmentSocialImagePath";

export const StoryFragmentSettings = (props: { id: string }) => {
  const { id } = props;

  // helpers
  const { isEditing, updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(id, storeMap, validationFunctions);

  return (
    <>
      <p>StoryFragment: {id}</p>

      <StoryFragmentSocialImagePath
        id={id}
        isEditing={isEditing}
        handleEditingChange={handleEditingChange}
        updateStoreField={updateStoreField}
        handleUndo={handleUndo}
      />
    </>
  );
};
