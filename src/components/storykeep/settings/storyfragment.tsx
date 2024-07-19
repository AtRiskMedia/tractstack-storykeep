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
import type { DatumPayload } from "../../../types";

import StoryFragmentSocialImagePath from "../fields/StoryFragmentSocialImagePath";
import StoryFragmentMenu from "../fields/StoryFragmentMenu";

export const StoryFragmentSettings = (props: {
  id: string;
  payload: DatumPayload;
}) => {
  const { id, payload } = props;

  // helpers
  const { isEditing, updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(id, storeMap, validationFunctions);

  return (
    <>
      <StoryFragmentMenu
        id={id}
        isEditing={isEditing}
        handleEditingChange={handleEditingChange}
        updateStoreField={updateStoreField}
        handleUndo={handleUndo}
        payload={payload.menus}
      />

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
