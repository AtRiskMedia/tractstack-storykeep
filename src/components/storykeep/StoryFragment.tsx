import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentInit,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
} from "../../store/storykeep";
import { PaneWrapper } from "./PaneWrapper";
import { classNames, handleEditorResize } from "../../utils/helpers";
import { useStoryKeepUtils } from "../../utils/storykeep";

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
  const { viewport } = useStoryKeepUtils(id);

  useEffect(() => {
    if ($storyFragmentInit[id]?.init) setIsClient(true);
  }, [id, $storyFragmentInit]);

  useEffect(() => {
    // Slight delay to ensure styles are applied
    const timerId = setTimeout(() => {
      const cleanup = handleEditorResize();
      return () => {
        if (cleanup) cleanup();
        clearTimeout(timerId);
      };
    }, 100);
  }, []);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="bg-mydarkgrey/20">
      <div
        id="storykeep-preview"
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
