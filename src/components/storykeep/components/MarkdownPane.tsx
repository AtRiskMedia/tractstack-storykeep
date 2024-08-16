import { useMemo } from "react";
import PaneFromAst from "./PaneFromAst";
import { classNames } from "../../../utils/helpers";
import { reduceClassNamesPayload } from "../../../utils/compositor/reduceClassNamesPayload";
import type {
  FileNode,
  MarkdownPaneDatum,
  MarkdownDatum,
  MarkdownLookup,
  OptionsPayloadDatum,
  ViewportAuto,
  ToolMode,
  ToolAddMode,
} from "../../../types";
import type { Nodes } from "hast";

interface Props {
  readonly: boolean;
  payload: MarkdownPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneId: string;
  paneFragmentIds: string[];
  markdownFragmentId: string;
  slug: string;
  markdownLookup: MarkdownLookup;
  toolMode: ToolMode;
  toolAddMode: ToolAddMode;
  viewportKey: ViewportAuto;
  queueUpdate: (id: string, updateFn: () => void) => void;
}

const MarkdownPane = ({
  readonly,
  payload,
  markdown,
  files,
  paneId,
  paneFragmentIds,
  markdownFragmentId,
  slug,
  markdownLookup,
  toolMode,
  toolAddMode,
  viewportKey,
  queueUpdate,
}: Props) => {
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
  const optionsPayloadDatum: OptionsPayloadDatum = useMemo(
    () => optionsPayload && reduceClassNamesPayload(optionsPayload),
    [optionsPayload]
  );
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
        readonly={readonly}
        key={idx}
        payload={{
          ...astPayload,
          ast: [thisAstPayload],
        }}
        markdown={markdown}
        thisClassNames={injectClassNames}
        paneId={paneId}
        paneFragmentIds={paneFragmentIds}
        markdownFragmentId={markdownFragmentId}
        slug={slug}
        idx={null}
        outerIdx={idx}
        markdownLookup={markdownLookup}
        toolMode={toolMode}
        toolAddMode={toolAddMode}
        queueUpdate={queueUpdate}
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
