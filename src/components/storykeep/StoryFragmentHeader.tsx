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
  storyFragmentPaneIds,
  paneFragmentIds,
  // Add other stores here
  //
} from "../../store/storykeep";
import {
  useStoryKeepUtils,
  handleToggleOn,
  handleToggleOff,
} from "../../utils/storykeep";
import { debounce } from "../../utils/helpers";
//import { tursoClient } from "../../api/tursoClient";
//import {
//  UnauthorizedError,
//  TursoOperationError,
//  NetworkError,
//} from "../../types";

export const StoryFragmentHeader = memo(({ id }: { id: string }) => {
  // helpers
  const {
    isEditing,
    updateStoreField,
    handleEditingChange,
    viewport,
    setViewport,
    toolMode,
    setToolMode,
    toolAddMode,
    setToolAddMode,
    handleUndo,
  } = useStoryKeepUtils(id);

  // required stores
  const $editMode = useStore(editModeStore);
  const $unsavedChanges = useStore(unsavedChangesStore);
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds);
  const $paneFragmentIds = useStore(paneFragmentIds);
  const hasUnsavedChanges = useMemo(() => {
    const storyFragmentChanges = Object.values($unsavedChanges[id] || {}).some(
      Boolean
    );
    const paneChanges = $storyFragmentPaneIds[id]?.current.some(paneId =>
      Object.values($unsavedChanges[paneId] || {}).some(Boolean)
    );
    const paneFragmentChanges = $storyFragmentPaneIds[id]?.current.some(
      paneId =>
        $paneFragmentIds[paneId]?.current.some(fragmentId =>
          Object.values($unsavedChanges[fragmentId] || {}).some(Boolean)
        )
    );

    return storyFragmentChanges || paneChanges || paneFragmentChanges;
  }, [$unsavedChanges, id, $storyFragmentPaneIds, $paneFragmentIds]);
  const $uncleanData = useStore(uncleanDataStore);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $storyFragmentSlug = useStore(storyFragmentSlug);
  // Add other useStore hooks as needed
  //

  const [isClient, setIsClient] = useState(false);
  const [hideElements, setHideElements] = useState(false);
  const headerRef = useRef<HTMLDivElement>(null);

  //const [testResult, setTestResult] = useState<string | null>(null);
  //const [error, setError] = useState<string | null>(null);

  const handleEditModeToggle = () => {
    if ($editMode?.mode === `settings`) {
      editModeStore.set({
        id,
        mode: ``,
        type: `storyfragment`,
      });
      handleToggleOff(true);
    } else {
      editModeStore.set({
        id,
        mode: `settings`,
        type: `storyfragment`,
      });
      handleToggleOn(true);
    }
  };

  //useEffect(() => {
  //  async function runTest() {
  //    try {
  //      const result = await tursoClient.test();
  //      setTestResult(JSON.stringify(result));
  //      setError(null);
  //    } catch (error) {
  //      if (error instanceof UnauthorizedError) {
  //        setError("You need to log in");
  //      } else if (error instanceof TursoOperationError) {
  //        setError(`Operation failed: ${error.operation}`);
  //      } else if (error instanceof NetworkError) {
  //        setError("Network issue detected");
  //      } else if (error instanceof Error) {
  //        setError(`An unknown error occurred: ${error.message}`);
  //      } else {
  //        setError("An unknown error occurred");
  //      }
  //    }
  //  }

  //  runTest();
  //}, []);

  useEffect(() => {
    if ($storyFragmentInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $storyFragmentInit]);

  const handleScroll = useCallback(() => {
    if (headerRef.current) {
      const scrollPosition = window.scrollY;
      setHideElements(scrollPosition > 0);
    }
  }, []);

  const debouncedHandleScroll = useMemo(
    () => debounce(handleScroll, 10),
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

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="w-full" ref={headerRef}>
      <div className="w-full my-2">
        <div
          className={`flex flex-wrap items-center gap-y-2 gap-x-4 ${hideElements ? `justify-around` : `justify-start`}`}
        >
          <div style={{ display: hideElements ? "none" : "block" }}>
            <object
              type="image/svg+xml"
              data="/custom/logo.svg"
              className="h-5 w-auto pointer-events-none mr-2"
              aria-label="Logo"
            >
              Logo
            </object>
          </div>
          <div
            className="mr-auto"
            style={{ display: hideElements ? "none" : "block" }}
          >
            <h1 className="font-2xl font-bold font-action">
              the website builder that converts
            </h1>
          </div>

          <ViewportSelector viewport={viewport} setViewport={setViewport} />
          <ToolModeSelector toolMode={toolMode} setToolMode={setToolMode} />
          {toolMode === `insert` ? (
            <ToolAddModeSelector
              toolAddMode={toolAddMode}
              setToolAddMode={setToolAddMode}
            />
          ) : null}

          <div className="inline">
            <button
              type="button"
              className="my-1 rounded bg-myblue px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
              onClick={handleEditModeToggle}
            >
              Settings
            </button>

            {hasUnsavedChanges ? (
              <a
                data-astro-reload
                href={`/${$storyFragmentSlug[id]?.original}/edit`}
                className="inline-block my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
              >
                Cancel
              </a>
            ) : (
              <a
                href={`/${$storyFragmentSlug[id]?.original}`}
                className="inline-block my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
              >
                Close
              </a>
            )}

            {hasUnsavedChanges ? (
              <button
                type="button"
                className="my-1 rounded bg-myorange px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack ml-2 disabled:hidden"
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
              handleEditingChange={handleEditingChange}
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
});
