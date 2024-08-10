import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentInit,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  viewportStore,
  toolModeStore,
  lastInteractedPaneStore,
  lastInteractedTypeStore,
  visiblePanesStore,
  unsavedChangesStore,
} from "../../store/storykeep";
import PaneWrapper from "./PaneWrapper";
import {
  classNames,
  handleEditorResize,
  isDeepEqual,
} from "../../utils/helpers";

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
  const $lastInteractedPane = useStore(lastInteractedPaneStore);
  const $lastInteractedType = useStore(lastInteractedTypeStore);
  const $visiblePanes = useStore(visiblePanesStore);
  const $toolMode = useStore(toolModeStore);
  const $unsavedChanges = useStore(unsavedChangesStore);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if ((event as any).handledByComponent) {
        return;
      }

      if (
        event.ctrlKey &&
        event.key ===
          "z" /* && ['eraser', 'insert'].includes($toolMode.value) */
      ) {
        event.preventDefault();

        const targetPaneId = $lastInteractedPane;
        const interactedType = $lastInteractedType;
        if (targetPaneId && $visiblePanes[targetPaneId]) {
          if (interactedType === "markdown") {
            if (targetPaneId) {
              const fragmentId =
                paneMarkdownFragmentId.get()[targetPaneId]?.current;
              if (fragmentId) {
                const currentField = paneFragmentMarkdown.get()[fragmentId];
                if (currentField && currentField.history.length > 0) {
                  // Perform undo operation
                  const [lastEntry, ...newHistory] = currentField.history;
                  paneFragmentMarkdown.setKey(fragmentId, {
                    ...currentField,
                    current: lastEntry.value,
                    history: newHistory,
                  });
                  const isUnsaved = !isDeepEqual(
                    lastEntry.value,
                    currentField.original
                  );
                  unsavedChangesStore.setKey(targetPaneId, {
                    ...$unsavedChanges[targetPaneId],
                    paneFragmentMarkdown: isUnsaved,
                  });
                }
              }
            }
          } else if (interactedType === "bgpane") {
            // Handle undo for bgpane
            console.log("Undo for bgpane not yet implemented");
          }
        }
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [$lastInteractedPane, $lastInteractedType, $visiblePanes, $toolMode]);

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
  );
};
