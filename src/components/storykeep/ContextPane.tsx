import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { handleToggleOff, useStoryKeepUtils } from "../../utils/storykeep";
import {
  paneInit,
  viewportStore,
  viewportSetStore,
  viewportKeyStore,
  editModeStore,
  toolModeStore,
  toolAddModeStore,
  lastInteractedTypeStore,
  paneMarkdownFragmentId,
} from "../../store/storykeep";
import PaneWrapper from "./PaneWrapper";
import { classNames, handleEditorResize, debounce } from "../../utils/helpers";
import type { ViewportKey } from "../../types";

export const ContextPane = (props: { id: string; slug: string }) => {
  const { id, slug } = props;
  const [isClient, setIsClient] = useState(false);
  const { handleUndo } = useStoryKeepUtils(id, []);
  const $paneInit = useStore(paneInit, { keys: [id] });
  const $lastInteractedType = useStore(lastInteractedTypeStore);
  const $viewport = useStore(viewportStore);
  const $viewportKey = useStore(viewportKeyStore);
  const viewportKey = $viewportKey.value;
  const $viewportSet = useStore(viewportSetStore);
  const $editMode = useStore(editModeStore);
  const $toolMode = useStore(toolModeStore);
  const toolMode = $toolMode.value || ``;
  const $toolAddMode = useStore(toolAddModeStore);
  const toolAddMode = $toolAddMode.value || ``;

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

        const targetPaneId = id;
        const interactedType = $lastInteractedType;
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
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [$lastInteractedType]);

  useEffect(() => {
    if ($paneInit[id]?.init) setIsClient(true);
  }, [id, $paneInit]);

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

  if (!isClient) return <div>Loading...</div>;

  return (
    <>
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
      <div
        id="storykeep-preview"
        className={classNames(
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
        <PaneWrapper
          id={id}
          slug={slug}
          isContext={true}
          viewportKey={viewportKey}
          insertPane={() => {}}
          toolMode={toolMode}
          toolAddMode={toolAddMode}
          isDesigningNew={false}
        />
      </div>
    </>
  );
};
