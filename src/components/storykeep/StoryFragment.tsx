import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentInit,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
} from "../../store/storykeep";
import { PaneWrapper } from "./PaneWrapper";
import { classNames } from "../../utils/helpers";
import {
  storeMap,
  useStoryKeepUtils,
  validationFunctions,
} from "../../utils/storykeep";

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

  // helpers
  const { viewport } = useStoryKeepUtils(id, storeMap, validationFunctions);

  useEffect(() => {
    if ($storyFragmentInit[id]?.init) setIsClient(true);
  }, [id, $storyFragmentInit]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="bg-mydarkgrey/20">
      <div
        className={classNames(
          tailwindBgColour ? tailwindBgColour : `bg-white`,
          `overflow-hidden`,
          viewport === `mobile`
            ? `max-w-[800px]`
            : viewport === `tablet`
              ? `max-w-[1367px]`
              : `max-w-[1920px]`
        )}
      >
        {paneIds.map((paneId: string) => (
          <PaneWrapper key={paneId} id={paneId} />
        ))}
      </div>
    </div>
  );
};
