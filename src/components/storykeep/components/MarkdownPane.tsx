import PaneFromAst from "./PaneFromAst";
import { classNames } from "../../../utils/helpers";
import type {
  FileNode,
  MarkdownPaneDatum,
  MarkdownDatum,
  MarkdownLookup,
} from "../../../types";

interface Props {
  payload: MarkdownPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneId: string;
  slug: string;
  markdownLookup: MarkdownLookup;
}

const MarkdownPane = ({
  payload,
  markdown,
  files,
  paneId,
  slug,
  markdownLookup,
}: Props) => {
  const hasHidden =
    payload.hiddenViewports.includes(`desktop`) ||
    payload.hiddenViewports.includes(`tablet`) ||
    payload.hiddenViewports.includes(`mobile`);
  const hidden = hasHidden
    ? ``.concat(
        payload.hiddenViewports.includes(`desktop`) ? `xl:hidden` : `xl:grid`,
        payload.hiddenViewports.includes(`tablet`) ? `md:hidden` : `md:grid`,
        payload.hiddenViewports.includes(`mobile`) ? `hidden` : `grid`
      )
    : ``;
  const optionsPayload = payload.optionsPayload;
  const astPayload = {
    ast: markdown.htmlAst.children,
    buttonData: optionsPayload?.buttons || {},
    imageData: files,
  };
  const injectClassNames = optionsPayload?.classNames?.all || {};
  const classNamesParent = optionsPayload?.classNamesParent
    ? optionsPayload.classNamesParent?.all
    : ``;
  // ensure this is an array
  const parentClasses =
    typeof classNamesParent === `string`
      ? [classNamesParent]
      : classNamesParent;
  const content = astPayload.ast
    /* eslint-disable @typescript-eslint/no-explicit-any */
    .filter((e: any) => !(e?.type === `text` && e?.value === `\n`))
    /* eslint-disable @typescript-eslint/no-explicit-any */
    .map((thisAstPayload: any, idx: number) => (
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
      />
    ));

  return (
    <>
      {parentClasses
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
