import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentInit,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
} from "../../store/storykeep";
import { PaneWrapper } from "./PaneWrapper";
import { classNames } from "../../utils/helpers";

export const StoryFragment = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds);
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour
  );
  const paneIds = $storyFragmentPaneIds[id]?.current;
  const tailwindBgColour = $storyFragmentTailwindBgColour[id]?.current;

  useEffect(() => {
    if ($storyFragmentInit[id]?.init) setIsClient(true);
  }, [id, $storyFragmentInit]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div
      className={classNames(
        tailwindBgColour ? tailwindBgColour : ``,
        `overflow-hidden`
      )}
    >
      {paneIds.map((paneId: string) => (
        <PaneWrapper key={paneId} id={paneId} />
      ))}
    </div>
  );
};
