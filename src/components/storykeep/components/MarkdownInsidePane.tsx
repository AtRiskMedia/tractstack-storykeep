import { useStore } from "@nanostores/react";
import PaneFromAst from "./PaneFromAst";
import { SvgInsideLeft } from "../../panes/SvgInsideLeft";
import { SvgInsideRight } from "../../panes/SvgInsideRight";
import { classNames } from "../../../utils/helpers";
import { reduceClassNamesPayload } from "../../../utils/compositor/reduceClassNamesPayload";
import { viewportStore } from "../../../store/storykeep";
import type {
  FileNode,
  MarkdownDatum,
  MarkdownPaneDatum,
  MarkdownLookup,
  OptionsPayloadDatum,
  ViewportKey,
} from "../../../types";

interface Props {
  payload: MarkdownPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneHeight: [number, number, number];
  paneId: string;
  slug: string;
  markdownLookup: MarkdownLookup;
  toolMode: string;
}

const MarkdownInsidePane = ({
  payload,
  markdown,
  files,
  paneHeight,
  paneId,
  slug,
  markdownLookup,
  toolMode,
}: Props) => {
  const $viewport = useStore(viewportStore) as { value: ViewportKey };
  const viewportKey: ViewportKey =
    $viewport?.value && $viewport.value !== "auto"
      ? $viewport.value
      : typeof window !== "undefined" && window.innerWidth >= 1368
        ? "desktop"
        : typeof window !== "undefined" && window.innerWidth >= 768
          ? "tablet"
          : "mobile";

  const optionsPayload = payload.optionsPayload;
  const optionsPayloadDatum: OptionsPayloadDatum =
    optionsPayload && reduceClassNamesPayload(optionsPayload);

  if (payload.hiddenViewports.includes(viewportKey)) return null;

  const shapeName =
    viewportKey === `desktop`
      ? payload.textShapeOutsideDesktop
      : viewportKey === `tablet`
        ? payload.textShapeOutsideTablet
        : viewportKey === `mobile`
          ? payload.textShapeOutsideMobile
          : payload.textShapeOutside;

  const astPayload = {
    ast: markdown.htmlAst.children,
    buttonData: optionsPayload?.buttons || {},
    imageData: files,
  };

  const injectClassNames =
    (optionsPayloadDatum?.classNames &&
      optionsPayloadDatum?.classNames[viewportKey]) ||
    optionsPayloadDatum?.classNames?.all ||
    optionsPayload?.classNames?.all ||
    {};

  const classNamesParentRaw =
    (optionsPayloadDatum?.classNamesParent &&
      optionsPayloadDatum?.classNamesParent[viewportKey]) ||
    optionsPayloadDatum?.classNamesParent?.all ||
    optionsPayload?.classNamesParent?.all ||
    ``;

  const classNamesParent = Array.isArray(classNamesParentRaw)
    ? classNamesParentRaw
    : [classNamesParentRaw];

  return (
    <div
      className={classNames(
        Array.isArray(classNamesParent) ? classNamesParent.join(` `) : ``,
        `h-fit-contents`
      )}
    >
      <div
        className="relative w-full h-full justify-self-start"
        style={{ gridArea: "1/1/1/1" }}
      >
        <SvgInsideLeft
          shapeName={shapeName || ``}
          viewportKey={viewportKey}
          id={`markdown-${paneId}`}
          paneHeight={
            paneHeight[
              viewportKey === `desktop` ? 2 : viewportKey === `tablet` ? 1 : 0
            ]
          }
        />
        <SvgInsideRight
          shapeName={shapeName || ``}
          viewportKey={viewportKey}
          id={`markdown-${paneId}`}
          paneHeight={
            paneHeight[
              viewportKey === `desktop` ? 2 : viewportKey === `tablet` ? 1 : 0
            ]
          }
        />
        {astPayload.ast
          /* eslint-disable @typescript-eslint/no-explicit-any */
          .filter((e: any) => !(e?.type === `text` && e?.value === `\n`))
          .map((thisAstPayload: any, idx: number) => (
            <PaneFromAst
              key={idx}
              payload={{
                ...astPayload,
                ast: [thisAstPayload],
              }}
              thisClassNames={
                injectClassNames as {
                  [key: string]: string | string[];
                }
              }
              paneId={paneId}
              slug={slug}
              idx={null}
              outerIdx={idx}
              markdownLookup={markdownLookup}
              toolMode={toolMode}
            />
          ))}
      </div>
    </div>
  );
};

export default MarkdownInsidePane;
