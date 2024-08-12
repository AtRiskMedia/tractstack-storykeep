import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { classNames } from "../../utils/helpers";
import {
  paneInit,
  paneSlug,
  paneHeightOffsetDesktop,
  paneHeightOffsetMobile,
  paneHeightOffsetTablet,
  paneHeightRatioDesktop,
  paneHeightRatioMobile,
  paneHeightRatioTablet,
  paneFragmentIds,
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  paneFragmentBgPane,
  paneFragmentBgColour,
  paneHasOverflowHidden,
  paneHasMaxHScreen,
  paneFiles,
} from "../../store/storykeep";
import BgPane from "./components/BgPane";
import MarkdownWrapper from "./components/MarkdownWrapper";
import type {
  BgColourDatum,
  BgPaneDatum,
  MarkdownEditDatum,
  ToolMode,
  ToolAddMode,
  Viewport,
} from "../../types";

type FragmentType = MarkdownEditDatum | BgPaneDatum | BgColourDatum;

const Pane = (props: {
  id: string;
  toolMode: ToolMode;
  toolAddMode: ToolAddMode;
  viewportKey: Viewport;
}) => {
  const { id, toolMode, toolAddMode, viewportKey } = props;
  const [isClient, setIsClient] = useState(false);
  const $paneInit = useStore(paneInit, { keys: [id] });
  const $paneSlug = useStore(paneSlug, { keys: [id] });
  const $paneHeightOffsetDesktop = useStore(paneHeightOffsetDesktop, {
    keys: [id],
  });
  const $paneHeightOffsetTablet = useStore(paneHeightOffsetTablet, {
    keys: [id],
  });
  const $paneHeightOffsetMobile = useStore(paneHeightOffsetMobile, {
    keys: [id],
  });
  const $paneHeightRatioDesktop = useStore(paneHeightRatioDesktop, {
    keys: [id],
  });
  const $paneHeightRatioTablet = useStore(paneHeightRatioTablet, {
    keys: [id],
  });
  const $paneHeightRatioMobile = useStore(paneHeightRatioMobile, {
    keys: [id],
  });
  const $paneFragmentIds = useStore(paneFragmentIds, { keys: [id] });
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [id],
  });
  const $paneHasOverflowHidden = useStore(paneHasOverflowHidden, {
    keys: [id],
  });
  const $paneHasMaxHScreen = useStore(paneHasMaxHScreen, { keys: [id] });
  const $paneFiles = useStore(paneFiles, { keys: [id] });

  const fragmentIds = $paneFragmentIds[id]?.current || [];
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: fragmentIds,
  });
  const $paneFragmentBgPane = useStore(paneFragmentBgPane, {
    keys: fragmentIds,
  });
  const $paneFragmentBgColour = useStore(paneFragmentBgColour, {
    keys: fragmentIds,
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const updateQueue = useRef<Array<{ id: string; updateFn: () => void }>>([]);
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});

  const paneHeightRatioDesktopPx =
    Number($paneHeightRatioDesktop[id].current) == 0
      ? 1920
      : Math.floor((1920 * Number($paneHeightRatioDesktop[id].current)) / 100);
  const paneHeightRatioTabletPx =
    Number($paneHeightRatioTablet[id].current) == 0
      ? 1080
      : Math.floor((1080 * Number($paneHeightRatioTablet[id].current)) / 100);
  const paneHeightRatioMobilePx =
    Number($paneHeightRatioMobile[id].current) == 0
      ? 600
      : Math.floor((600 * Number($paneHeightRatioMobile[id].current)) / 100);

  const memoizedPaneData = useMemo(
    () => ({
      slug: $paneSlug[id]?.current,
      files: $paneFiles[id]?.current,
      hasOverflowHidden: $paneHasOverflowHidden[id]?.current,
      hasMaxHScreen: $paneHasMaxHScreen[id]?.current,
      paneHeight: [
        Math.floor((600 * Number($paneHeightRatioMobile[id]?.current)) / 100),
        Math.floor((1080 * Number($paneHeightRatioTablet[id]?.current)) / 100),
        Math.floor((1920 * Number($paneHeightRatioDesktop[id]?.current)) / 100),
      ] as [number, number, number],
      // these custom tailwind won't work in StoryKeep layout; will have to inject via styles
      paneHeightRatio: classNames(
        paneHeightRatioMobile
          ? `h-[calc(var(--scale)*${paneHeightRatioMobilePx}px)] xs:h-[calc(var(--scale)*${paneHeightRatioMobilePx}px)]`
          : ``,
        paneHeightRatioTablet
          ? `md:h-[calc(var(--scale)*${paneHeightRatioTabletPx}px)]`
          : ``,
        paneHeightRatioDesktop
          ? `xl:h-[calc(var(--scale)*${paneHeightRatioDesktopPx}px)]`
          : ``
      ),
      // these custom tailwind won't work in StoryKeep layout; will have to inject via styles
      paneHeightOffset: classNames(
        $paneHeightOffsetMobile[id]?.current !== undefined
          ? `mt-[calc(var(--scale)*${Math.floor((600 * ($paneHeightOffsetMobile[id]?.current ?? 0)) / 100)}px)] xs:mt-[calc(var(--scale)*${Math.floor((600 * ($paneHeightOffsetMobile[id]?.current ?? 1)) / 100)}px)]`
          : ``,
        $paneHeightOffsetTablet[id]?.current !== undefined
          ? `md:mt-[calc(var(--scale)*${Math.floor(
              (1080 * ($paneHeightOffsetTablet[id]?.current ?? 1)) / 100
            )}px)]`
          : ``,
        $paneHeightOffsetDesktop[id]?.current !== undefined
          ? `xl:mt-[calc(var(--scale)*${Math.floor((1920 * ($paneHeightOffsetDesktop[id]?.current ?? 1)) / 100)}px)]`
          : ``
      ),
      bgColour:
        fragmentIds
          .map(fragmentId => $paneFragmentBgColour[fragmentId]?.current)
          .find(fragment => fragment && fragment.type === "bgColour")
          ?.bgColour || null,
      fragments: fragmentIds.map(fragmentId => {
        const markdown = $paneFragmentMarkdown[fragmentId]?.current;
        const bgPane = $paneFragmentBgPane[fragmentId]?.current;
        return markdown || bgPane;
      }),
      markdownFragmentId: $paneMarkdownFragmentId[id]?.current,
      paneFragmentIds: $paneFragmentIds[id]?.current,
    }),
    [
      id,
      $paneSlug,
      $paneFiles,
      $paneHasOverflowHidden,
      $paneHasMaxHScreen,
      $paneHeightRatioMobile,
      $paneHeightRatioTablet,
      $paneHeightRatioDesktop,
      $paneHeightOffsetMobile,
      $paneHeightOffsetTablet,
      $paneHeightOffsetDesktop,
      fragmentIds,
      $paneFragmentBgColour,
      $paneFragmentMarkdown,
      $paneMarkdownFragmentId,
      $paneFragmentBgPane,
      toolMode,
      toolAddMode,
      viewportKey,
    ]
  );

  useEffect(() => {
    if ($paneInit[id]?.init) setIsClient(true);
  }, [id, $paneInit]);

  const processQueue = useCallback(() => {
    const updates = new Map<string, () => void>();
    updateQueue.current.forEach(({ id, updateFn }) => {
      updates.set(id, updateFn);
    });
    updates.forEach(updateFn => {
      updateFn();
    });
    updateQueue.current = [];
    setIsUpdating(false);
  }, []);

  const queueUpdate = useCallback(
    (id: string, updateFn: () => void) => {
      if (debounceTimers.current[id]) {
        clearTimeout(debounceTimers.current[id]);
      }
      debounceTimers.current[id] = setTimeout(() => {
        updateQueue.current.push({ id, updateFn });
        if (!isUpdating) {
          setIsUpdating(true);
          processQueue();
        }
      }, 300);
    },
    [isUpdating, processQueue]
  );

  const renderFragment = useCallback(
    (fragment: FragmentType, index: number) => {
      if (!fragment?.type) return null;
      switch (fragment.type) {
        case "markdown":
          return (
            <div
              key={`markdown-${index}`}
              className="relative w-full h-auto justify-self-start"
              style={{ gridArea: "1/1/1/1" }}
            >
              <MarkdownWrapper
                payload={fragment.payload}
                markdown={fragment.markdown}
                files={memoizedPaneData.files}
                paneHeight={memoizedPaneData.paneHeight}
                paneId={id}
                paneFragmentIds={memoizedPaneData.paneFragmentIds}
                markdownFragmentId={memoizedPaneData.markdownFragmentId}
                slug={memoizedPaneData.slug}
                queueUpdate={queueUpdate}
                toolMode={toolMode}
                toolAddMode={toolAddMode}
                viewportKey={viewportKey}
              />
            </div>
          );
        case "bgPane":
          return (
            <div
              key={`bgpane-${index}`}
              className="relative w-full h-auto justify-self-start"
              style={{ gridArea: "1/1/1/1" }}
            >
              <BgPane
                payload={fragment}
                viewportKey={viewportKey}
                //                toolMode={toolMode}
              />
            </div>
          );
        default:
          return null;
      }
    },
    [id, memoizedPaneData, queueUpdate]
  );

  if (!isClient) return <div>Loading...</div>;

  const bgColourStyle = memoizedPaneData.bgColour
    ? { backgroundColor: memoizedPaneData.bgColour }
    : {};

  return (
    <div className="relative">
      <div
        id={`pane-inner-${id}`}
        style={bgColourStyle}
        className={classNames(
          memoizedPaneData.paneHeightRatio,
          memoizedPaneData.paneHeightOffset,
          memoizedPaneData.hasMaxHScreen ? `max-h-screen` : ``,
          memoizedPaneData.hasOverflowHidden ? `overflow-hidden` : ``,
          `grid`,
          memoizedPaneData.bgColour ? `bg-[${memoizedPaneData.bgColour}]` : ""
        )}
      >
        {memoizedPaneData.fragments.map(renderFragment)}
      </div>
      {toolMode === "settings" && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded">
            <h2 className="text-xl font-bold mb-2">Pane Settings</h2>
            {/* Add your settings UI here */}
          </div>
        </div>
      )}
    </div>
  );
};

export default Pane;
