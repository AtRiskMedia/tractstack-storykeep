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
  viewportKeyStore,
  viewportSetStore,
  toolModeStore,
  toolAddModeStore,
  editModeStore,
} from "../../store/storykeep";
import PaneWrapper from "./PaneWrapper";
import DesignNewPane from "./components/DesignNewPane";
import {
  classNames,
  handleEditorResize,
  isDeepEqual,
  debounce,
} from "../../utils/helpers";
import type { ViewportKey } from "../../types";

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
  const [thisPaneIds, setThisPaneIds] = useState<string[]>(paneIds);
  const [shouldScroll, setShouldScroll] = useState<number | null>(null);
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
  const $viewportKey = useStore(viewportKeyStore);
  const viewportKey = $viewportKey.value;
  const $viewportSet = useStore(viewportSetStore);
  const $editMode = useStore(editModeStore);

  const cancelInsert = () => {
    setShouldScroll(null);
    setThisPaneIds(paneIds);
  };
  const insertPane = (paneId: string, position: `above` | `below`) => {
    const index = paneIds.indexOf(paneId);
    if (index >= 0) {
      const newPaneIds = [...paneIds];
      const insertIndex = position === "above" ? index : index + 1;
      newPaneIds.splice(insertIndex, 0, "insert");
      setThisPaneIds(newPaneIds);
      setShouldScroll(insertIndex);
    }
  };

  useEffect(() => {
    if (typeof shouldScroll === `number`) {
      const timer = setTimeout(() => {
        const element = document.getElementById(
          `design-new-pane-${shouldScroll}`
        );
        if (element) {
          const elementRect = element.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.scrollY;
          const middleOfElement =
            absoluteElementTop -
            window.innerHeight / 2 +
            elementRect.height / 2;
          window.scrollTo({
            top: middleOfElement,
            behavior: "smooth",
          });
        }
        setShouldScroll(null);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [shouldScroll]);

  useEffect(() => {
    const handleResize = debounce(() => {
      if (!$viewportSet) {
        const previewElement = document.getElementById("storykeep-preview");
        const scrollBarOffset =
          window.innerWidth - document.documentElement.clientWidth;
        const previewWidth = previewElement?.clientWidth || 0;
        const adjustedWidth =
          previewWidth +
          scrollBarOffset *
            (window.innerWidth > previewWidth + scrollBarOffset ? 0 : 1);
        let newViewportKey: ViewportKey;
        if (adjustedWidth <= 800) {
          newViewportKey = `mobile`;
        } else if (adjustedWidth <= 1367) {
          newViewportKey = `tablet`;
        } else {
          newViewportKey = `desktop`;
        }
        viewportKeyStore.set({ value: newViewportKey });
      }
    }, 100);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

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
    // set initial viewportKey based on width of screen (assumes Viewport=auto)
    const scrollBarOffset =
      window.innerWidth - document.documentElement.clientWidth;
    const previewWidth = window.innerWidth;
    const adjustedWidth =
      previewWidth +
      scrollBarOffset *
        (window.innerWidth > previewWidth + scrollBarOffset ? 0 : 1);
    let newViewportKey: ViewportKey;
    if (adjustedWidth <= 800) {
      newViewportKey = `mobile`;
    } else if (adjustedWidth <= 1367) {
      newViewportKey = `tablet`;
    } else {
      newViewportKey = `desktop`;
    }
    viewportKeyStore.set({ value: newViewportKey });

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
    <>
      {$editMode?.mode === `settings` && (
        <div className="fixed inset-0 bg-black/85 z-[8999]"></div>
      )}
      <div
        id="storykeep-preview"
        className={classNames(
          tailwindBgColour ? tailwindBgColour : `bg-white`,
          `overflow-hidden`,
          $viewport.value === `mobile`
            ? `min-w-[500px] max-w-[780px]`
            : $viewport.value === `tablet`
              ? `min-w-[1024px] max-w-[1367px]`
              : $viewport.value === `desktop`
                ? `min-w-[1368px] max-w-[1920px]`
                : ``
        )}
      >
        {thisPaneIds.map((paneId: string, idx: number) => (
          <div key={paneId}>
            {paneId === `insert` ? (
              <div id={`design-new-pane-${idx}`}>
                <DesignNewPane
                  id={id}
                  index={idx}
                  cancelInsert={cancelInsert}
                  tailwindBgColour={
                    tailwindBgColour ? tailwindBgColour : `bg-white`
                  }
                  viewportKey={viewportKey}
                />
              </div>
            ) : (
              <PaneWrapper
                id={paneId}
                viewportKey={viewportKey}
                insertPane={insertPane}
                toolMode={toolMode}
                toolAddMode={toolAddMode}
                isDesigningNew={thisPaneIds.length !== paneIds.length}
              />
            )}
          </div>
        ))}
      </div>
    </>
  );
};
