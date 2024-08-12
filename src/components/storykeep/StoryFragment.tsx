import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentInit,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  lastInteractedPaneStore,
  lastInteractedTypeStore,
  visiblePanesStore,
  unsavedChangesStore,
  viewportStore,
  viewportAutoStore,
  toolModeStore,
  toolAddModeStore,
} from "../../store/storykeep";
import PaneWrapper from "./PaneWrapper";
import {
  classNames,
  handleEditorResize,
  isDeepEqual,
  debounce,
} from "../../utils/helpers";

export const StoryFragment = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $storyFragmentInit = useStore(storyFragmentInit, { keys: [id] });
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds, { keys: [id] });
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour,
    { keys: [id] }
  );
  const paneIds = $storyFragmentPaneIds[id]?.current;
  const tailwindBgColour = $storyFragmentTailwindBgColour[id]?.current;
  const $lastInteractedPane = useStore(lastInteractedPaneStore);
  const $lastInteractedType = useStore(lastInteractedTypeStore);
  const $visiblePanes = useStore(visiblePanesStore);
  const $unsavedChanges = useStore(unsavedChangesStore, { keys: [id] });
  const $toolMode = useStore(toolModeStore);
  const toolMode = $toolMode.value || ``;
  const $toolAddMode = useStore(toolAddModeStore);
  const toolAddMode = $toolAddMode.value || ``;
  const $viewport = useStore(viewportStore);
  const [viewportKey, setViewportKey] = useState(
    $viewport?.value && $viewport.value !== "auto"
      ? $viewport.value
      : typeof window !== "undefined" && window.innerWidth >= 1368
        ? "desktop"
        : typeof window !== "undefined" && window.innerWidth >= 768
          ? "tablet"
          : "mobile"
  );

  useEffect(() => {
    const handleResize = debounce(() => {
      const newViewportKey =
        $viewport?.value && $viewport.value !== "auto"
          ? $viewport.value
          : typeof window !== "undefined" && window.innerWidth >= 1368
            ? "desktop"
            : typeof window !== "undefined" && window.innerWidth >= 768
              ? "tablet"
              : "mobile";
      setViewportKey(newViewportKey);
      viewportAutoStore.set({ value: newViewportKey });
    }, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [$viewport]);

  useEffect(() => {
    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      if ((event as any).handledByComponent) {
        return;
      }

      if (event.key === `Escape`) {
        event.preventDefault();
        toolModeStore.set({ value: `text` });
      }
      if (event.ctrlKey && event.key === "z") {
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
  }, [$lastInteractedPane, $lastInteractedType, $visiblePanes]);

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
      switch ($viewport.value) {
        case "mobile":
          outerDiv.classList.add(`min-w-[500px]`, `max-w-[780px]`);
          break;
        case "tablet":
          outerDiv.classList.add(`min-w-[1024px]`, `max-w-[1367px]`);
          break;
        case "desktop":
          outerDiv.classList.add(`min-w-[1368px]`, `max-w-[1920px]`);
          break;
        case "auto":
          break;
      }
    }
  }, [$viewport]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div
      id="storykeep-preview"
      className={classNames(
        tailwindBgColour ? tailwindBgColour : `bg-white`,
        `overflow-hidden`,
        $viewport.value === `mobile`
          ? `min-w-[500px] max-w-[800px]`
          : $viewport.value === `tablet`
            ? `min-w-[1024px] max-w-[1367px]`
            : $viewport.value === `desktop`
              ? `min-w-[1368px] max-w-[1920px]`
              : ``
      )}
    >
      {paneIds.map((paneId: string) => (
        <PaneWrapper
          key={paneId}
          id={paneId}
          viewportKey={viewportKey}
          toolMode={toolMode}
          toolAddMode={toolAddMode}
        />
      ))}
    </div>
  );
};
