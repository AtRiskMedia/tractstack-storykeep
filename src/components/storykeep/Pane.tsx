import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
//import { classNames } from "../../utils/helpers";
import {
  editModeStore,
  paneInit,
  //paneSlug,
  //paneMarkdownBody,
  //paneHeightOffsetDesktop,
  //paneHeightOffsetMobile,
  //paneHeightOffsetTablet,
  //paneHeightRatioDesktop,
  //paneHeightRatioMobile,
  //paneHeightRatioTablet,
  //paneFragmentIds,
  //paneFragmentMarkdown,
  //paneFragmentBgPane,
  //paneFragmentBgColour,
  //paneHasOverflowHidden,
  //paneHasMaxHScreen,
  //paneFiles,
} from "../../store/storykeep";
import { handleToggleOn, handleToggleOff } from "../../utils/storykeep";
//import BgPane from "./components/BgPane";
//import MarkdownWrapper from "./components/MarkdownWrapper";
import type {} from //BgPaneDatum,
//BgColourDatum,
//MarkdownPaneDatum,
//EditModeValue,
"../../types";

export const Pane = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  //const [paneHeight, setPaneHeight] = useState<[number, number, number] | null>(
  //  null
  //);
  //const [paneHeightRatio, setPaneHeightRatio] = useState<string | null>(null);
  //const [paneHeightOffset, setPaneHeightOffset] = useState<string | null>(null);
  //const [paneFragments, setPaneFragments] = useState<
  //  BgPaneDatum | BgColourDatum | MarkdownPaneDatum
  //>([]);
  //const [bgColour, setBgColour] = useState<string | null>(null);
  //const bgColourStyle = bgColour ? { backgroundColor: bgColour } : {};
  const $editMode = useStore(editModeStore);
  const $paneInit = useStore(paneInit);
  //const $paneSlug = useStore(paneSlug);
  //const $paneMarkdownBody = useStore(paneMarkdownBody);
  //const $paneHeightOffsetDesktop = useStore(paneHeightOffsetDesktop);
  //const $paneHeightOffsetTablet = useStore(paneHeightOffsetTablet);
  //const $paneHeightOffsetMobile = useStore(paneHeightOffsetMobile);
  //const $paneHeightRatioDesktop = useStore(paneHeightRatioDesktop);
  //const $paneHeightRatioTablet = useStore(paneHeightRatioTablet);
  //const $paneHeightRatioMobile = useStore(paneHeightRatioMobile);
  //const $paneFragmentIds = useStore(paneFragmentIds);
  //const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  //const $paneFragmentBgPane = useStore(paneFragmentBgPane);
  //const $paneFragmentBgColour = useStore(paneFragmentBgColour);
  //const $paneHasOverflowHidden = useStore(paneHasOverflowHidden);
  //const $paneHasMaxHScreen = useStore(paneHasMaxHScreen);
  //const $paneFiles = useStore(paneFiles);

  useEffect(() => {
    if ($paneInit[id]?.init) {
      //const paneFragments = $paneFragmentIds[id].current.map((f: string) => {
      //  return (
      //    $paneFragmentMarkdown[f]?.current ||
      //    $paneFragmentBgPane[f]?.current ||
      //    $paneFragmentBgColour[f]?.current ||
      //    []
      //  );
      //});
      //setPaneFragments(paneFragments);
      //const paneHeightRatioDesktop =
      //  Number($paneHeightRatioDesktop[id].current) == 0
      //    ? null
      //    : Math.floor(
      //        (1920 * Number($paneHeightRatioDesktop[id].current)) / 100
      //      );
      //const paneHeightRatioTablet =
      //  Number($paneHeightRatioTablet[id].current) == 0
      //    ? null
      //    : Math.floor(
      //        (1080 * Number($paneHeightRatioTablet[id].current)) / 100
      //      );
      //const paneHeightRatioMobile =
      //  Number($paneHeightRatioMobile[id].current) == 0
      //    ? null
      //    : Math.floor(
      //        (600 * Number($paneHeightRatioMobile[id].current)) / 100
      //      );
      //const paneHeightRatio = setPaneHeightRatio(
      //  classNames(
      //    paneHeightRatioMobile
      //      ? `h-[calc(var(--scale)*${paneHeightRatioMobile}px)] xs:h-[calc(var(--scale)*${paneHeightRatioMobile}px)]`
      //      : ``,
      //    paneHeightRatioTablet
      //      ? `md:h-[calc(var(--scale)*${paneHeightRatioTablet}px)]`
      //      : ``,
      //    paneHeightRatioDesktop
      //      ? `xl:h-[calc(var(--scale)*${paneHeightRatioDesktop}px)]`
      //      : ``
      //  )
      //);
      //setPaneHeight([
      //  Math.floor((600 * Number($paneHeightRatioMobile[id].current)) / 100),
      //  Math.floor((1080 * Number($paneHeightRatioTablet[id].current)) / 100),
      //  Math.floor((1920 * Number($paneHeightRatioDesktop[id].current)) / 100),
      //]);
      //setPaneHeightOffset(
      //  classNames(
      //    $paneHeightOffsetMobile[id]?.current !== undefined
      //      ? `mt-[calc(var(--scale)*${Math.floor((600 * ($paneHeightOffsetMobile[id]?.current ?? 0)) / 100)}px)] xs:mt-[calc(var(--scale)*${Math.floor((600 * ($paneHeightOffsetMobile[id]?.current ?? 1)) / 100)}px)]`
      //      : ``,
      //    $paneHeightOffsetTablet[id]?.current !== undefined
      //      ? `md:mt-[calc(var(--scale)*${Math.floor(
      //          (1080 * ($paneHeightOffsetTablet[id]?.current ?? 1)) / 100
      //        )}px)]`
      //      : ``,
      //    $paneHeightOffsetDesktop[id]?.current !== undefined
      //      ? `xl:mt-[calc(var(--scale)*${Math.floor((1920 * ($paneHeightOffsetDesktop[id]?.current ?? 1)) / 100)}px)]`
      //      : ``
      //  )
      //);
      //const bgColourPane =
      //  paneFragments &&
      //  (paneFragments
      //    .filter(
      //      (a: BgColourDatum | BgPaneDatum | MarkdownPaneDatum) =>
      //        a.type === `bgColour`
      //    )
      //    .at(0) as BgColourDatum);
      //if (bgColourPane?.bgColour) setBgColour(bgColourPane?.bgColour);
    }
    setIsClient(true);
  }, [id, $paneInit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        $editMode?.type === "pane" &&
        $editMode?.mode === "settings" &&
        $editMode.id === id
      ) {
        toggleOffEditModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [$editMode, id]);

  const toggleOffEditModal = () => {
    editModeStore.set(null);
    handleToggleOff();
  };

  const handleEditModeToggle = () => {
    if (
      $editMode?.type === "pane" &&
      $editMode?.mode === "settings" &&
      $editMode.id === id
    ) {
      toggleOffEditModal();
    } else {
      editModeStore.set({
        id,
        mode: "settings",
        type: "pane",
      });
      handleToggleOn();
    }
  };

  if (!isClient) return <div>Loading...</div>;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div>
        {/* Placeholder content */}
        Pane: {id}
      </div>
      <div
        onClick={handleEditModeToggle}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: "pointer",
          backgroundColor: isHovered ? "rgba(0, 0, 0, 0.1)" : "transparent",
          transition: "background-color 0.3s ease",
        }}
      >
        {isHovered && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          >
            Edit{" "}
            <button
              onClick={handleEditModeToggle}
              style={{ fontWeight: "bold" }}
            >
              settings
            </button>{" "}
            on this pane
          </div>
        )}
      </div>
    </div>
  );
};
