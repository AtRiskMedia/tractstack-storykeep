import StoryFragmentTailwindBgColour from "../fields/StoryFragmentTailwindBgColour";
import { useStoryKeepUtils } from "../../../utils/storykeep";
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
    useStoryKeepUtils(id);

  return (
    <>
      <StoryFragmentTailwindBgColour
        id={id}
        updateStoreField={updateStoreField}
        handleUndo={handleUndo}
      />

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
