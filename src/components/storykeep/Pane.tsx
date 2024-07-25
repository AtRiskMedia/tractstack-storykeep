import { memo, useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { classNames } from "../../utils/helpers";
import {
  editModeStore,
  paneInit,
  paneSlug,
  paneMarkdownBody,
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
import {
  isFullScreenEditModal,
  handleToggleOn,
  handleToggleOff,
} from "../../utils/storykeep";
import BgPane from "./components/BgPane";
import MarkdownWrapper from "./components/MarkdownWrapper";
import { cleanHtmlAst } from "../../utils/compositor/cleanHtmlAst";
import type {
  BgPaneDatum,
  BgColourDatum,
  MarkdownPaneDatum,
  FileDatum,
  MarkdownDatum,
  //EditModeValue,
} from "../../types";
import type { Root } from "hast";

const paneFragmentStyle = {
  gridArea: "1/1/1/1",
};

export const Pane = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [slug, setSlug] = useState(`slug`);
  const [markdown, setMarkdown] = useState<MarkdownDatum | null>(null);
  const [files, setFiles] = useState<FileDatum[]>([]);
  const [hasOverflowHidden, setHasOverflowHidden] = useState(false);
  const [hasMaxHScreen, setHasMaxHScreen] = useState(false);
  const [paneHeight, setPaneHeight] = useState<[number, number, number]>([
    0, 0, 0,
  ]);
  const [paneHeightRatio, setPaneHeightRatio] = useState<string | null>(null);
  const [paneHeightOffset, setPaneHeightOffset] = useState<string | null>(null);
  const [paneFragments, setPaneFragments] = useState<
    (BgPaneDatum | BgColourDatum | MarkdownPaneDatum)[]
  >([]);
  const [bgColour, setBgColour] = useState<string | null>(null);
  const bgColourStyle = bgColour ? { backgroundColor: bgColour } : {};
  const $editMode = useStore(editModeStore);
  const $toolMode = useStore(toolModeStore);
  const toolMode = $toolMode.value || ``;
  const $paneInit = useStore(paneInit);
  const $paneSlug = useStore(paneSlug);
  const $paneMarkdownBody = useStore(paneMarkdownBody);
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
  const [paneElement, setPaneElement] = useState<HTMLDivElement | null>(null);
  const paneRef = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        setPaneElement(node);
      }
    },
    [props.id]
  );

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setSlug($paneSlug[id].current);
      const markdownPayload = $paneMarkdownBody[id]?.current &&
        typeof $paneMarkdownBody[id].current === `string` &&
        $paneSlug[id]?.current && {
          body: $paneMarkdownBody[id].current,
          slug: `${$paneSlug[id].current}-markdown`,
          title: `Copy for ${$paneSlug[id].current}`,
          htmlAst: cleanHtmlAst(
            toHast(fromMarkdown($paneMarkdownBody[id].current))
          ),
        };
      if (markdownPayload && markdownPayload?.htmlAst?.type === "root") {
        const rootAst = markdownPayload.htmlAst as Root;

        setMarkdown({
          ...markdownPayload,
          htmlAst: rootAst,
        });
      }
      setFiles($paneFiles[id].current);
      setHasOverflowHidden($paneHasOverflowHidden[id].current);
      setHasMaxHScreen($paneHasMaxHScreen[id].current);
      const paneFragments: (MarkdownPaneDatum | BgPaneDatum | BgColourDatum)[] =
        $paneFragmentIds[id].current.map((f: string) => {
          return (
            ($paneFragmentMarkdown[f]?.current as MarkdownPaneDatum) ||
            ($paneFragmentBgPane[f]?.current as BgPaneDatum) ||
            ($paneFragmentBgColour[f]?.current as BgColourDatum) ||
            []
          );
        });
      setPaneFragments(paneFragments);
      const paneHeightRatioDesktop =
        Number($paneHeightRatioDesktop[id].current) == 0
          ? null
          : Math.floor(
              (1920 * Number($paneHeightRatioDesktop[id].current)) / 100
            );
      const paneHeightRatioTablet =
        Number($paneHeightRatioTablet[id].current) == 0
          ? null
          : Math.floor(
              (1080 * Number($paneHeightRatioTablet[id].current)) / 100
            );
      const paneHeightRatioMobile =
        Number($paneHeightRatioMobile[id].current) == 0
          ? null
          : Math.floor(
              (600 * Number($paneHeightRatioMobile[id].current)) / 100
            );
      setPaneHeightRatio(
        classNames(
          paneHeightRatioMobile
            ? `h-[calc(var(--scale)*${paneHeightRatioMobile}px)] xs:h-[calc(var(--scale)*${paneHeightRatioMobile}px)]`
            : ``,
          paneHeightRatioTablet
            ? `md:h-[calc(var(--scale)*${paneHeightRatioTablet}px)]`
            : ``,
          paneHeightRatioDesktop
            ? `xl:h-[calc(var(--scale)*${paneHeightRatioDesktop}px)]`
            : ``
        )
      );
      setPaneHeight([
        Math.floor((600 * Number($paneHeightRatioMobile[id].current)) / 100),
        Math.floor((1080 * Number($paneHeightRatioTablet[id].current)) / 100),
        Math.floor((1920 * Number($paneHeightRatioDesktop[id].current)) / 100),
      ]);
      setPaneHeightOffset(
        classNames(
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
        )
      );
      const bgColourPane = paneFragments?.find(
        (a): a is BgColourDatum | BgPaneDatum | MarkdownPaneDatum =>
          a.type === "bgColour"
      );
      if (
        bgColourPane &&
        bgColourPane.type === "bgColour" &&
        "bgColour" in bgColourPane
      ) {
        setBgColour(bgColourPane.bgColour);
      }
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

  useEffect(() => {
    if (!paneElement || isFullScreenEditModal($editMode?.mode || ``)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          const currentEditMode = editModeStore.get();
          if (
            currentEditMode?.type === "pane" &&
            currentEditMode.mode === "settings" &&
            currentEditMode.id === props.id
          ) {
            toggleOffEditModal();
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(paneElement);

    return () => {
      observer.disconnect();
    };
  }, [paneElement, props.id, $editMode]);

  const toggleOffEditModal = useCallback(() => {
    editModeStore.set(null);
    handleToggleOff();
  }, [props.id]);

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
      ref={paneRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      <div
        id={`pane-inner-${id}`}
        style={bgColourStyle}
        className={classNames(
          paneHeightRatio ? paneHeightRatio : ``,
          paneHeightOffset ? paneHeightOffset : ``,
          hasMaxHScreen ? `max-h-screen` : ``,
          hasOverflowHidden ? `overflow-hidden` : ``,
          `grid`,
          bgColour ? `bg-[${bgColour}]` : ""
        )}
      >
        {paneFragments
          .sort(
            (a, b) =>
              (a.type === `markdown` ? 1 : 0) - (b.type === `markdown` ? 1 : 0)
          )
          .map((f, idx) =>
            f.type === `markdown` && markdown ? (
              <div
                key={idx}
                className="relative w-full h-auto justify-self-start"
                style={paneFragmentStyle}
              >
                <MarkdownWrapper
                  payload={f as MarkdownPaneDatum}
                  markdown={markdown}
                  files={files}
                  paneHeight={paneHeight}
                  paneId={id}
                  slug={slug}
                />
              </div>
            ) : f.type === `bgPane` ? (
              <div
                key={idx}
                className="relative w-full h-auto justify-self-start"
                style={paneFragmentStyle}
              >
                <BgPane payload={f as BgPaneDatum} />
              </div>
            ) : null
          )}
      </div>
      {toolMode === `settings` ? (
        <div
          onClick={handleEditModeToggle}
          className={`absolute inset-0 cursor-pointer transition-colors duration-300 ease-in-out ${
            isHovered ? "bg-[rgba(167,177,183,0.85)]" : "bg-transparent"
          }`}
        >
          {isHovered && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
               bg-white p-2.5 rounded-md shadow-md
               text-xl md:text-3xl font-action mx-6"
            >
              {$editMode?.id === id ? (
                <span>Close settings pane</span>
              ) : (
                <span>
                  Edit <button onClick={handleEditModeToggle}>settings</button>{" "}
                  on this pane
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full z-50" />
      )}
    </div>
  );
};

export default memo(Pane);
