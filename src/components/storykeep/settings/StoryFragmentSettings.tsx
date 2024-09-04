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
    <div className="rounded-lg px-1.5 py-1.5 mr-12 shadow-inner bg-white">
      <div className="px-1.5 py-1.5 mr-12">
        <div className="flex flex-row space-x-16 my-4">
          <StoryFragmentTailwindBgColour
            id={id}
            updateStoreField={updateStoreField}
            handleUndo={handleUndo}
          />
          <div className="flex flex-col space-y-4">
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
      </div>
    </div>
  );
};
