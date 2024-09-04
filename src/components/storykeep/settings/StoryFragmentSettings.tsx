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
    <div className="rounded-lg px-1.5 py-1.5 mr-12 bg-white shadow-inner">
      <div className="space-y-4">
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
