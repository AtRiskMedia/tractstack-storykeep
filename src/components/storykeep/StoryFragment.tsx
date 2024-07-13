import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTractStackId,
  storyFragmentMenuId,
  storyFragmentPaneIds,
  storyFragmentSocialImagePath,
  storyFragmentTailwindBgColour,
} from "../../store/storykeep";

export const StoryFragment = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use the useStore hook to subscribe to the stores
  const $storyFragmentTitle = useStore(storyFragmentTitle);
  const $storyFragmentSlug = useStore(storyFragmentSlug);
  const $storyFragmentTractStackId = useStore(storyFragmentTractStackId);
  const $storyFragmentMenuId = useStore(storyFragmentMenuId);
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds);
  const $storyFragmentSocialImagePath = useStore(storyFragmentSocialImagePath);
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour
  );

  // Extract the current values for this specific id
  const title = $storyFragmentTitle[id]?.current;
  const slug = $storyFragmentSlug[id]?.current;
  const tractStackId = $storyFragmentTractStackId[id]?.current;
  const menuId = $storyFragmentMenuId[id]?.current;
  const paneIds = $storyFragmentPaneIds[id]?.current;
  const socialImagePath = $storyFragmentSocialImagePath[id]?.current;
  const tailwindBgColour = $storyFragmentTailwindBgColour[id]?.current;

  // If we're on the server or the data isn't loaded yet, show a loading state
  if (!isClient || !title) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Story Fragment: {id}</h1>
      <p>Title: {title}</p>
      <p>Slug: {slug}</p>
      <p>Tract Stack ID: {tractStackId}</p>
      <p>Menu ID: {menuId}</p>
      <p>Pane IDs: {paneIds?.join(", ")}</p>
      <p>Social Image Path: {socialImagePath}</p>
      <p>Tailwind Background Colour: {tailwindBgColour}</p>
      <button
        onClick={() =>
          storyFragmentTitle.setKey(id, { current: "New Title", history: [] })
        }
      >
        Update Title
      </button>
    </div>
  );
};
