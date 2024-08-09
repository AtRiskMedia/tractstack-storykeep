import {useRef, memo, useMemo, useState, useEffect, useCallback } from "react";
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
  paneFragmentBgPane,
  paneFragmentBgColour,
  paneHasOverflowHidden,
  paneHasMaxHScreen,
  paneFiles,
  toolModeStore,
} from "../../store/storykeep";
import BgPane from "./components/BgPane";
import MarkdownWrapper from "./components/MarkdownWrapper";
import type {
  BgColourDatum,
  BgPaneDatum,
  MarkdownEditDatum,
  FileDatum,
} from "../../types";

const paneFragmentStyle = {
  gridArea: "1/1/1/1",
};

type MarkdownFragment = MarkdownEditDatum & { type: "markdown" };
type BgPaneFragment = BgPaneDatum & { type: "bgPane" };
type BgColourFragment = BgColourDatum & { type: "bgColour" };
type FragmentType = MarkdownFragment | BgPaneFragment | BgColourFragment;

const Pane = memo((props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [paneData, setPaneData] = useState({
    slug: "",
    files: [] as FileDatum[],
    hasOverflowHidden: false,
    hasMaxHScreen: false,
    paneHeight: [0, 0, 0] as [number, number, number],
    paneHeightRatio: "",
    paneHeightOffset: "",
    bgColour: null as string | null,
  });
  const $paneInit = useStore(paneInit);
  const $paneSlug = useStore(paneSlug);
  const $paneHeightOffsetDesktop = useStore(paneHeightOffsetDesktop);
  const $paneHeightOffsetTablet = useStore(paneHeightOffsetTablet);
  const $paneHeightOffsetMobile = useStore(paneHeightOffsetMobile);
  const $paneHeightRatioDesktop = useStore(paneHeightRatioDesktop);
  const $paneHeightRatioTablet = useStore(paneHeightRatioTablet);
  const $paneHeightRatioMobile = useStore(paneHeightRatioMobile);
  const $paneFragmentIds = useStore(paneFragmentIds);
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const $paneFragmentBgPane = useStore(paneFragmentBgPane);
  const $paneFragmentBgColour = useStore(paneFragmentBgColour);
  const $paneHasOverflowHidden = useStore(paneHasOverflowHidden);
  const $paneHasMaxHScreen = useStore(paneHasMaxHScreen);
  const $paneFiles = useStore(paneFiles);
  const $toolMode = useStore(toolModeStore);

  const memoizedPaneData = useMemo(
    () => ({
      slug: $paneSlug[id].current,
      files: $paneFiles[id].current,
      hasOverflowHidden: $paneHasOverflowHidden[id].current,
      hasMaxHScreen: $paneHasMaxHScreen[id].current,
      paneHeight: [
        Math.floor((600 * Number($paneHeightRatioMobile[id].current)) / 100),
        Math.floor((1080 * Number($paneHeightRatioTablet[id].current)) / 100),
        Math.floor((1920 * Number($paneHeightRatioDesktop[id].current)) / 100),
      ] as [number, number, number],
      paneHeightRatio: classNames(/* ... */),
      paneHeightOffset: classNames(/* ... */),
      bgColour:
        $paneFragmentIds[id].current
          .map(fragmentId => $paneFragmentBgColour[fragmentId]?.current)
          .find(fragment => fragment && fragment.type === "bgColour")
          ?.bgColour || null,
    }),
    [
      id,
      $paneSlug[id].current,
      $paneFiles[id].current,
      $paneHasOverflowHidden[id].current,
      $paneHasMaxHScreen[id].current,
      $paneHeightRatioMobile[id].current,
      $paneHeightRatioTablet[id].current,
      $paneHeightRatioDesktop[id].current,
      $paneHeightOffsetMobile[id].current,
      $paneHeightOffsetTablet[id].current,
      $paneHeightOffsetDesktop[id].current,
      $paneFragmentIds[id].current,
      $paneFragmentBgColour,
    ]
  );

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setPaneData(memoizedPaneData);
      setIsClient(true);
    }
  }, [id, $paneInit, memoizedPaneData]);

  const renderFragment = useCallback(
    (fragmentId: string) => {
      const markdownFragment = $paneFragmentMarkdown[fragmentId]?.current as
        | MarkdownFragment
        | undefined;
      const bgPaneFragment = $paneFragmentBgPane[fragmentId]?.current as
        | BgPaneFragment
        | undefined;
      const bgColourFragment = $paneFragmentBgColour[fragmentId]?.current as
        | BgColourFragment
        | undefined;

      const fragment: FragmentType | undefined =
        markdownFragment || bgPaneFragment || bgColourFragment;

      if (!fragment) return null;

      switch (fragment.type) {
        case "markdown":
          return (
            <div
              key={fragmentId}
              className="relative w-full h-auto justify-self-start"
              style={paneFragmentStyle}
            >
              <MarkdownWrapper
                payload={fragment.payload}
                markdown={fragment.markdown}
                files={paneData.files}
                paneHeight={paneData.paneHeight}
                paneId={id}
                slug={paneData.slug}
                queueUpdate={queueUpdate}
                isUpdating={isUpdating}
              />
            </div>
          );
        case "bgPane":
          return (
            <div
              key={fragmentId}
              className="relative w-full h-auto justify-self-start"
              style={paneFragmentStyle}
            >
              <BgPane payload={fragment} />
            </div>
          );
        default:
          return null;
      }
    },
    [
      $paneFragmentMarkdown,
      $paneFragmentBgPane,
      $paneFragmentBgColour,
      paneData,
      id,
      $toolMode.value,
    ]
  );

  const [isUpdating, setIsUpdating] = useState(false);
  const updateQueue = useRef<(() => void)[]>([]);

  const queueUpdate = useCallback(
    (updateFn: () => void) => {
      updateQueue.current.push(updateFn);
      if (!isUpdating) {
        void processQueue();
      }
    },
    [isUpdating]
  );

  const processQueue = useCallback(async () => {
    if (updateQueue.current.length === 0) {
      setIsUpdating(false);
      return;
    }

    setIsUpdating(true);
    const nextUpdate = updateQueue.current.shift();
    if (nextUpdate) {
      nextUpdate();
    }
    setTimeout(processQueue, 0);
  }, []);

  if (!isClient) return <div>Loading...</div>;

  const bgColourStyle = paneData.bgColour
    ? { backgroundColor: paneData.bgColour }
    : {};
  const toolMode = $toolMode.value || ``;

  return (
    <div className="relative">
      <div
        id={`pane-inner-${id}`}
        style={bgColourStyle}
        className={classNames(
          paneData.paneHeightRatio,
          paneData.paneHeightOffset,
          paneData.hasMaxHScreen ? `max-h-screen` : ``,
          paneData.hasOverflowHidden ? `overflow-hidden` : ``,
          `grid`,
          paneData.bgColour ? `bg-[${paneData.bgColour}]` : ""
        )}
      >
        {$paneFragmentIds[id].current.map(renderFragment)}
      </div>
      {toolMode !== "text" && (
        <div className="absolute inset-0 w-full h-full z-50" />
      )}
    </div>
  );
});

export default Pane;
