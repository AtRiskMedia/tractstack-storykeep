import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentInit,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
  viewportStore,
} from "../../store/storykeep";
import PaneWrapper from "./PaneWrapper";
import { classNames, handleEditorResize } from "../../utils/helpers";

export const StoryFragment = (props: { id: string }) => {
  const { id } = props;
  const $viewport = useStore(viewportStore);
  const viewportKey =
    $viewport?.value && $viewport.value !== `auto` ? $viewport.value : null;
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

  useEffect(() => {
    const outerDiv = document.getElementById(`storykeep`);
    if (outerDiv) {
      outerDiv.classList.remove(
        `min-w-[500px]`,
        `max-w-[780px]`,
        `min-w-[1024px]`,
        `max-w-[1367px]`,
        `min-w-[1368px]`,
        `max-w-[1920px]`
      );
      switch (viewportKey) {
        case "mobile":
          outerDiv.classList.add(`min-w-[500px]`, `max-w-[780px]`);
          break;
        case "tablet":
          outerDiv.classList.add(`min-w-[1024px]`, `max-w-[1367px]`);
          break;
        case "desktop":
          outerDiv.classList.add(`min-w-[1368px]`, `max-w-[1920px]`);
          break;
      }
    }
  }, [viewportKey]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="bg-mydarkgrey/20">
      <div
        id="storykeep-preview"
        className={classNames(
          tailwindBgColour ? tailwindBgColour : `bg-white`,
          `overflow-hidden`,
          viewportKey === `mobile`
            ? `min-w-[500px] max-w-[800px]`
            : viewportKey === `tablet`
              ? `min-w-[1024px] max-w-[1367px]`
              : viewportKey === `desktop`
                ? `min-w-[1368px] max-w-[1920px]`
                : ``
        )}
      >
        {paneIds.map((paneId: string) => (
          <PaneWrapper key={paneId} id={paneId} />
        ))}
      </div>
    </div>
  );
};
