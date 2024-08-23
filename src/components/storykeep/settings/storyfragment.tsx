import StoryFragmentTailwindBgColour from "../fields/StoryFragmentTailwindBgColour";
import { useStoryKeepUtils } from "../../../utils/storykeep";

import StoryFragmentSocialImagePath from "../fields/StoryFragmentSocialImagePath";
import StoryFragmentMenu from "../fields/StoryFragmentMenu";

export const StoryFragmentSettings = (props: { id: string }) => {
  const { id } = props;

  // helpers
  const { isEditing, updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(id);

  return (
    <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner mr-6">
      <div className="p-6">
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
          payload={[]}
          // this needs to pull from nanostore
        />

        <StoryFragmentSocialImagePath
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
