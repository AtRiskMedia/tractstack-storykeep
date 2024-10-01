import { useState, useEffect, useMemo, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { navigate } from "astro:transitions/client";
import {
  storyFragmentInit,
  storyFragmentTitle,
  storyFragmentPaneIds,
  storyFragmentTailwindBgColour,
  paneMarkdownFragmentId,
  lastInteractedPaneStore,
  lastInteractedTypeStore,
  visiblePanesStore,
  viewportStore,
  viewportKeyStore,
  viewportSetStore,
  toolModeStore,
  toolAddModeStore,
  editModeStore,
  showAnalytics,
  storedAnalytics,
  creationStateStore,
} from "../../store/storykeep";
import AnalyticsWrapper from "./nivo/AnalyticsWrapper";
import { handleToggleOff, useStoryKeepUtils } from "../../utils/storykeep";
import PaneWrapper from "./PaneWrapper";
import DesignNewPane from "./components/DesignNewPane";
import { classNames, handleEditorResize, debounce } from "../../utils/helpers";
import type { ViewportKey } from "../../types";

export const StoryFragment = (props: {
  id: string | null;
  slug: string;
  isContext: boolean;
}) => {
  const { id, slug, isContext } = props;
  const [isClient, setIsClient] = useState(false);
  const $creationState = useStore(creationStateStore);
  const thisId = id ?? $creationState.id ?? `error`;
  const { handleUndo } = useStoryKeepUtils(thisId, []);
  const $showAnalytics = useStore(showAnalytics);
  const $storedAnalytics = useStore(storedAnalytics);
  const $storyFragmentInit = useStore(storyFragmentInit, { keys: [thisId] });
  const $storyFragmentTitle = useStore(storyFragmentTitle, { keys: [thisId] });
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds, {
    keys: [thisId],
  });
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour,
    { keys: [thisId] }
  );
  const paneIds = $storyFragmentPaneIds[thisId]?.current;
  const [thisPaneIds, setThisPaneIds] = useState<string[] | null>(null);
  const [shouldScroll, setShouldScroll] = useState<number | null>(null);
  const tailwindBgColour = $storyFragmentTailwindBgColour[thisId]?.current;
  const $lastInteractedPane = useStore(lastInteractedPaneStore);
  const $lastInteractedType = useStore(lastInteractedTypeStore);
  const $visiblePanes = useStore(visiblePanesStore);
  const $viewport = useStore(viewportStore);
  const $viewportKey = useStore(viewportKeyStore);
  const viewportKey = $viewportKey.value;
  const $viewportSet = useStore(viewportSetStore);
  const $editMode = useStore(editModeStore);
  const $toolMode = useStore(toolModeStore);
  const toolMode = $toolMode.value || ``;
  const $toolAddMode = useStore(toolAddModeStore);
  const toolAddMode = $toolAddMode.value || ``;

  const cancelInsert = useCallback(() => {
    setShouldScroll(null);
    setThisPaneIds(paneIds);
  }, [paneIds]);

  const doInsert = useCallback((newPaneIds: string[], newPaneId: string) => {
    setThisPaneIds(newPaneIds);
    setTimeout(() => {
      const newPaneElement = document.getElementById(`pane-inner-${newPaneId}`);
      if (newPaneElement) {
        newPaneElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }, 100);
  }, []);

  const insertPane = useCallback(
    (paneId: string, position: `above` | `below`) => {
      const index = paneIds.indexOf(paneId);
      if (index >= 0) {
        const newPaneIds = [...paneIds];
        const insertIndex = position === "above" ? index : index + 1;
        newPaneIds.splice(insertIndex, 0, "insert");
        setThisPaneIds(newPaneIds);
        setShouldScroll(insertIndex);
      }
    },
    [paneIds]
  );

  const isDesigningNew = useMemo(
    () =>
      thisPaneIds && paneIds ? thisPaneIds.length !== paneIds.length : false,
    [thisPaneIds, paneIds]
  );

  const resetInsertMode = useCallback(() => {
    if (isDesigningNew) {
      setShouldScroll(null);
      setThisPaneIds(paneIds);
    }
  }, [isDesigningNew, paneIds]);

  useEffect(() => {
    setThisPaneIds(paneIds);
  }, [paneIds]);

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
  }, [$viewportSet]);

  useEffect(() => {
    if (toolMode !== "insert") {
      resetInsertMode();
    }
  }, [toolMode]);

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
      if (event.key === "+") {
        event.preventDefault();
        toolModeStore.set({ value: `insert` });
        toolAddModeStore.set({ value: "p" });
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
                handleUndo("paneFragmentMarkdown", fragmentId);
                setTimeout(() => editModeStore.set(null), 10);
              }
            }
          } else if (interactedType === "bgpane") {
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
    if (
      $storyFragmentInit[thisId]?.init ||
      (slug === `create` && $creationState.isInitialized)
    ) {
      setIsClient(true);
    } else if (slug === `create`) navigate(`/storykeep`);
  }, [slug, thisId, $storyFragmentInit, $creationState.isInitialized]);

  useEffect(() => {
    // ensure correct viewport based on window width
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

  const memoizedPanes = useMemo(
    () =>
      thisPaneIds?.map((paneId: string, idx: number) => (
        <div key={paneId}>
          {paneId === `insert` ? (
            <div className="bg-myblack" id={`design-new-pane-${idx}`}>
              <DesignNewPane
                id={thisId}
                index={idx}
                cancelInsert={cancelInsert}
                doInsert={doInsert}
                tailwindBgColour={
                  tailwindBgColour ? tailwindBgColour : `bg-white`
                }
                viewportKey={viewportKey}
                paneIds={paneIds}
                slug={slug}
                isContext={isContext}
              />
            </div>
          ) : isDesigningNew && paneId !== `insert` ? (
            <div className="relative">
              <div className="absolute inset-0 bg-black/85 z-[8999]"></div>
              <PaneWrapper
                id={paneId}
                slug={slug}
                isContext={isContext}
                viewportKey={viewportKey}
                insertPane={insertPane}
                toolMode={toolMode}
                toolAddMode={toolAddMode}
                isDesigningNew={isDesigningNew}
              />
            </div>
          ) : (
            <PaneWrapper
              id={paneId}
              slug={slug}
              isContext={isContext}
              viewportKey={viewportKey}
              insertPane={insertPane}
              toolMode={toolMode}
              toolAddMode={toolAddMode}
              isDesigningNew={isDesigningNew}
            />
          )}
        </div>
      )),
    [
      thisPaneIds,
      thisId,
      cancelInsert,
      doInsert,
      tailwindBgColour,
      viewportKey,
      paneIds,
      isDesigningNew,
      insertPane,
      toolMode,
      toolAddMode,
    ]
  );

  if (!isClient || !thisPaneIds) return <div>Loading...</div>;

  return (
    <>
      {$showAnalytics && $storedAnalytics[thisId] && (
        <AnalyticsWrapper
          data={$storedAnalytics[thisId]}
          title={$storyFragmentTitle[thisId].current}
          isPane={false}
        />
      )}
      {$editMode?.mode === `settings` && (
        <div
          title="Close panel"
          onClick={() => {
            editModeStore.set(null);
            handleToggleOff();
          }}
          className="fixed inset-0 z-[8999] pointer-events-auto cursor-pointer"
        ></div>
      )}
      {$editMode?.mode === `insert` && (
        <div className="fixed inset-0 bg-black/95 z-[8999]"></div>
      )}
      <div
        id="storykeep-preview"
        className={classNames(
          tailwindBgColour ? `bg-${tailwindBgColour}` : `bg-white`,
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
        {memoizedPanes}
      </div>
    </>
  );
};
