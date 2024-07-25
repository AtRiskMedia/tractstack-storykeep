import { useStore } from "@nanostores/react";
import PaneFromAst from "./PaneFromAst";
import { classNames } from "../../../utils/helpers";
import { reduceClassNamesPayload } from "../../../utils/compositor/reduceClassNamesPayload";
import { viewportStore } from "../../../store/storykeep";
import type {
  FileNode,
  MarkdownPaneDatum,
  MarkdownDatum,
  MarkdownLookup,
  OptionsPayloadDatum,
  ViewportKey,
} from "../../../types";
import type { Nodes } from "hast";

interface Props {
  payload: MarkdownPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneId: string;
  slug: string;
  markdownLookup: MarkdownLookup;
  toolMode: string;
}

const MarkdownPane = ({
  payload,
  markdown,
  files,
  paneId,
  slug,
  markdownLookup,
  toolMode,
}: Props) => {
  const $viewport = useStore(viewportStore) as { value: ViewportKey };
  const viewportKey: ViewportKey =
    $viewport?.value && $viewport.value !== "auto" ? $viewport.value : null;
  const hasHidden =
    payload.hiddenViewports.includes(`desktop`) ||
    payload.hiddenViewports.includes(`tablet`) ||
    payload.hiddenViewports.includes(`mobile`);
  const hidden =
    hasHidden && viewportKey
      ? `${payload.hiddenViewports.includes(viewportKey) && viewportKey === `desktop` ? `hidden` : `grid`}`
      : hasHidden
        ? ``.concat(
            payload.hiddenViewports.includes(`desktop`)
              ? `xl:hidden`
              : `xl:grid`,
            payload.hiddenViewports.includes(`tablet`)
              ? `md:hidden`
              : `md:grid`,
            payload.hiddenViewports.includes(`mobile`) ? `hidden` : `grid`
          )
        : ``;
  const optionsPayload = payload.optionsPayload;
  const astPayload = {
    ast: markdown.htmlAst.children,
    buttonData: optionsPayload?.buttons || {},
    imageData: files,
  };
  const optionsPayloadDatum: OptionsPayloadDatum =
    optionsPayload && reduceClassNamesPayload(optionsPayload);
  const injectClassNames: { [key: string]: string | string[] } =
    ((viewportKey &&
      optionsPayloadDatum?.classNames &&
      optionsPayloadDatum?.classNames[viewportKey]) ||
      optionsPayloadDatum?.classNames?.all ||
      optionsPayload?.classNames?.all || { all: `` }) as {
      [key: string]: string | string[];
    };
  const classNamesParentRaw =
    (viewportKey &&
      optionsPayloadDatum?.classNamesParent &&
      optionsPayloadDatum?.classNamesParent[viewportKey]) ||
    optionsPayloadDatum?.classNamesParent?.all ||
    optionsPayload?.classNamesParent?.all ||
    ``;
  const classNamesParent =
    typeof classNamesParentRaw === `string`
      ? [classNamesParentRaw]
      : classNamesParentRaw;
  const parentClasses = Array.isArray(classNamesParent)
    ? classNamesParent
    : [classNamesParent];
  const content = astPayload.ast
    .filter((e: Nodes) => !(e?.type === `text` && e?.value === `\n`))
    .map((thisAstPayload: Nodes, idx: number) => (
      <PaneFromAst
        key={idx}
        payload={{
          ...astPayload,
          ast: [thisAstPayload],
        }}
        thisClassNames={injectClassNames}
        paneId={paneId}
        slug={slug}
        idx={null}
        outerIdx={idx}
        markdownLookup={markdownLookup}
        toolMode={toolMode}
      />
    ));

  return (
    <>
      {(parentClasses as string[])
        .slice()
        .reverse()
        .reduce(
          (accContent: JSX.Element, cssClass: string) => (
            <div className={classNames(hidden, cssClass)}>{accContent}</div>
          ),
          <>{content}</>
        )}
    </>
  );
};

export default MarkdownPane;
