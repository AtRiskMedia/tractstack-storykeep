import { useCallback, useState, useRef, useEffect, useMemo, memo } from "react";
import { useStore } from "@nanostores/react";
import ViewportSelector from "./components/ViewportSelector";
import ToolModeSelector from "./components/ToolModeSelector";
import ToolAddModeSelector from "./components/ToolAddModeSelector";
import StoryFragmentTitle from "./fields/StoryFragmentTitle";
import StoryFragmentSlug from "./fields/StoryFragmentSlug";
import {
  editModeStore,
  unsavedChangesStore,
  uncleanDataStore,
  storyFragmentInit,
  storyFragmentSlug,
  storyFragmentTitle,
  storyFragmentPaneIds,
  paneFragmentIds,
  viewportStore,
  viewportKeyStore,
  viewportSetStore,
  toolModeStore,
  toolAddModeStore,
} from "../../store/storykeep";
import { MIN_SCROLL_THRESHOLD, HYSTERESIS } from "../../constants";
import {
  useStoryKeepUtils,
  handleToggleOn,
  handleToggleOff,
} from "../../utils/storykeep";
import { cleanString, debounce } from "../../utils/helpers";
import type { StoreKey, ContentMap, ToolMode, ToolAddMode } from "../../types";

export const StoryFragmentHeader = memo(
  ({
    id,
    slug,
    contentMap,
  }: {
    id: string;
    slug: string;
    contentMap: ContentMap[];
  }) => {
    const usedSlugs = contentMap
      .filter(item => item.type === "StoryFragment" && item.slug !== slug)
      .map(item => item.slug);
    const { isEditing, updateStoreField, handleEditingChange, handleUndo } =
      useStoryKeepUtils(id, usedSlugs);
    const $storyFragmentTitle = useStore(storyFragmentTitle, { keys: [id] });
    const $editMode = useStore(editModeStore);
    const $viewportSet = useStore(viewportSetStore);
    const $viewport = useStore(viewportStore);
    const $viewportKey = useStore(viewportKeyStore);
    const viewport = $viewport.value;
    const viewportKey = $viewportKey.value;
    const { value: toolMode } = useStore(toolModeStore);
    const { value: toolAddMode } = useStore(toolAddModeStore);
    const toolAddModeRef = useRef<HTMLSelectElement>(null);
    let lastScrollTop = 0;
    const setViewport = (
      newViewport: "auto" | "mobile" | "tablet" | "desktop"
    ) => {
      const newViewportKey =
        newViewport !== `auto`
          ? newViewport
          : typeof window !== "undefined" && window.innerWidth >= 1368
            ? "desktop"
            : typeof window !== "undefined" && window.innerWidth >= 768
              ? "tablet"
              : "mobile";
      viewportSetStore.set(newViewport !== `auto`);
      viewportStore.set({ value: newViewport });
      viewportKeyStore.set({ value: newViewportKey });
    };

    const setToolMode = (newToolMode: ToolMode) => {
      editModeStore.set(null);
      handleToggleOff();
      toolModeStore.set({ value: newToolMode });
    };

    const setToolAddMode = (newToolAddMode: ToolAddMode) => {
      toolAddModeStore.set({ value: newToolAddMode });
    };

    useEffect(() => {
      if (toolMode === "insert" && toolAddModeRef.current) {
        toolAddModeRef.current.focus();
      }
    }, [toolMode]);

    const $unsavedChanges = useStore(unsavedChangesStore);
    const $storyFragmentPaneIds = useStore(storyFragmentPaneIds, {
      keys: [id],
    });
    const $paneFragmentIds = useStore(paneFragmentIds, { keys: [id] });

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    useEffect(() => {
      const storyFragmentChanges = Object.values(
        $unsavedChanges[id] || {}
      ).some(Boolean);
      const paneChanges = $storyFragmentPaneIds[id]?.current.some(paneId =>
        Object.values($unsavedChanges[paneId] || {}).some(Boolean)
      );
      const paneFragmentChanges = $storyFragmentPaneIds[id]?.current.some(
        paneId => {
          const fragmentIds = $paneFragmentIds[paneId]?.current || [];
          return fragmentIds.some(fragmentId =>
            Object.values($unsavedChanges[fragmentId] || {}).some(Boolean)
          );
        }
      );
      setHasUnsavedChanges(
        storyFragmentChanges || paneChanges || paneFragmentChanges
      );
    }, [$unsavedChanges, id, $storyFragmentPaneIds, $paneFragmentIds]);

    const $uncleanData = useStore(uncleanDataStore, { keys: [id] });
    const $storyFragmentInit = useStore(storyFragmentInit, { keys: [id] });
    const $storyFragmentSlug = useStore(storyFragmentSlug, { keys: [id] });
    const [isClient, setIsClient] = useState(false);
    const [hideElements, setHideElements] = useState(false);
    const headerRef = useRef<HTMLDivElement>(null);

    const handleEditModeToggle = () => {
      if (
        $editMode?.mode === `settings` &&
        $editMode?.type === `storyfragment` &&
        $editMode?.id === id
      ) {
        editModeStore.set(null);
        handleToggleOff();
      } else {
        editModeStore.set({
          id,
          mode: `settings`,
          type: `storyfragment`,
        });
        handleToggleOn(`settings`);
      }
    };

    const handleInterceptEdit = (storeKey: StoreKey, editing: boolean) => {
      if (
        storeKey === `storyFragmentTitle` &&
        $storyFragmentSlug[id].current === ``
      ) {
        const clean = cleanString($storyFragmentTitle[id].current).substring(
          0,
          50
        );
        const newVal = !usedSlugs.includes(clean) ? clean : ``;
        uncleanDataStore.setKey(id, {
          ...(uncleanDataStore.get()[id] || {}),
          [`storyFragmentSlug`]: newVal.length === 0,
        });
        storyFragmentSlug.setKey(id, {
          current: newVal,
          original: newVal,
          history: [],
        });
      }
      return handleEditingChange(storeKey, editing);
    };

    useEffect(() => {
      if ($storyFragmentInit[id]?.init) {
        setIsClient(true);
      }
    }, [id, $storyFragmentInit]);

    const handleScroll = useCallback(() => {
      if (headerRef.current) {
        const scrollPosition =
          window.scrollY || document.documentElement.scrollTop;
        const scrollingDown = scrollPosition > lastScrollTop;

        setHideElements(prevHideElements => {
          if (scrollingDown) {
            // When scrolling down, hide elements if we've scrolled past the threshold
            return scrollPosition > MIN_SCROLL_THRESHOLD;
          } else {
            // When scrolling up, show elements if we've scrolled up past (threshold - hysteresis)
            return (
              prevHideElements &&
              scrollPosition > MIN_SCROLL_THRESHOLD - HYSTERESIS
            );
          }
        });
        lastScrollTop = scrollPosition;
      }
    }, []);

    const debouncedHandleScroll = useMemo(
      () => debounce(handleScroll, 30),
      [handleScroll]
    );

    useEffect(() => {
      window.addEventListener("scroll", debouncedHandleScroll);
      // Call handleScroll immediately to set initial state
      handleScroll();
      return () => {
        window.removeEventListener("scroll", debouncedHandleScroll);
      };
    }, [debouncedHandleScroll, handleScroll]);

    useEffect(() => {
      const storyFragmentChanges = Object.values(
        $unsavedChanges[id] || {}
      ).some(Boolean);
      const paneChanges = $storyFragmentPaneIds[id]?.current.some(paneId =>
        Object.values($unsavedChanges[paneId] || {}).some(Boolean)
      );
      const paneFragmentChanges = $storyFragmentPaneIds[id]?.current.some(
        paneId => {
          const fragmentIds = $paneFragmentIds[paneId]?.current || [];
          return fragmentIds.some(fragmentId =>
            Object.values($unsavedChanges[fragmentId] || {}).some(Boolean)
          );
        }
      );
      const newHasUnsavedChanges =
        storyFragmentChanges || paneChanges || paneFragmentChanges;
      setHasUnsavedChanges(newHasUnsavedChanges);
    }, [$unsavedChanges, id, $storyFragmentPaneIds, $paneFragmentIds]);

    if (!isClient) return <div>Loading...</div>;

    return (
      <div className="w-full shadow-md" ref={headerRef}>
        <div className="w-full my-2">
          <div
            className={`flex flex-wrap items-center gap-y-2 gap-x-2.5 justify-around`}
          >
            <div
              className={`flex flex-wrap items-center gap-y-2 gap-x-2.5 justify-around`}
            >
              <ToolModeSelector
                toolMode={toolMode}
                setToolMode={setToolMode}
                hideElements={hideElements}
              />
              {toolMode === `insert` ? (
                <div className="ml-4">
                  <ToolAddModeSelector
                    ref={toolAddModeRef}
                    toolAddMode={toolAddMode}
                    setToolAddMode={setToolAddMode}
                  />
                </div>
              ) : null}
            </div>
            <ViewportSelector
              viewport={viewport}
              viewportKey={viewportKey}
              auto={!$viewportSet}
              setViewport={setViewport}
              hideElements={hideElements}
            />

            <div className="inline">
              <button
                type="button"
                className="my-1 rounded bg-myblue px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
                onClick={handleEditModeToggle}
              >
                Settings
              </button>

              {hasUnsavedChanges ? (
                <a
                  data-astro-reload
                  href={`/${$storyFragmentSlug[id]?.original}/edit`}
                  className="inline-block my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
                >
                  Cancel
                </a>
              ) : (
                <a
                  href={`/${$storyFragmentSlug[id]?.original}`}
                  className="inline-block my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
                >
                  Close
                </a>
              )}

              {hasUnsavedChanges ? (
                <button
                  type="button"
                  className="my-1 rounded bg-myorange px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack ml-2 disabled:hidden"
                  disabled={Object.values($uncleanData[id] || {}).some(Boolean)}
                >
                  Save
                </button>
              ) : null}
            </div>
          </div>
          <div style={{ display: hideElements ? "none" : "block" }}>
            <StoryFragmentTitle
              id={id}
              isEditing={isEditing}
              handleEditingChange={handleInterceptEdit}
              updateStoreField={updateStoreField}
              handleUndo={handleUndo}
            />
            <StoryFragmentSlug
              id={id}
              isEditing={isEditing}
              handleEditingChange={handleEditingChange}
              updateStoreField={updateStoreField}
              handleUndo={handleUndo}
            />
          </div>
        </div>
      </div>
    );
  }
);
