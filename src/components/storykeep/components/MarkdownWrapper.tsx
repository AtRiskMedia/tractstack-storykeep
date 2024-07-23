import { memo } from "react";
import MarkdownPane from "./MarkdownPane";
import MarkdownInsidePane from "./MarkdownInsidePane";
import Modal from "./Modal";
import MarkdownInsideModal from "./MarkdownInsideModal";
import { classNames } from "../../../utils/helpers";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import type {
  MarkdownDatum,
  MarkdownPaneDatum,
  FileNode,
  BgPaneDatum,
} from "../../../types";

interface Props {
  payload: MarkdownPaneDatum | BgPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneHeight: [number, number, number];
  paneId: string;
  slug: string;
}

const MarkdownWrapper = ({
  payload,
  markdown,
  files,
  paneHeight,
  paneId,
  slug,
}: Props) => {
  // this is either MarkdownPane, Modal+MarkdownInsideModal, or MarkdownInsidePane
  const thisPayload = payload as MarkdownPaneDatum;
  const thisModalPayload =
    thisPayload.isModal &&
    typeof thisPayload?.optionsPayload?.modal !== `undefined`
      ? thisPayload.optionsPayload.modal
      : null;
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
    : `grid`;
  const paneFragmentStyle = {
    gridArea: "1/1/1/1",
  };

  // has modal shape?
  const isModal =
    thisPayload.isModal &&
    typeof thisPayload?.optionsPayload?.modal !== `undefined`;

  // uses textShapeOutside
  const hasTextShapeOutside =
    thisPayload.textShapeOutsideMobile !== `none` ||
    thisPayload.textShapeOutsideTablet !== `none` ||
    thisPayload.textShapeOutsideDesktop !== `none`;

  // generate markdown global lookup
  const markdownLookup =
    markdown?.htmlAst && generateMarkdownLookup(markdown.htmlAst);

  if (isModal && thisModalPayload) {
    return (
      <div
        className={classNames(hidden, `h-fit-contents`)}
        id={`t8k-${thisPayload.id}-modal-container`}
      >
        <div
          className="relative w-full h-full justify-self-start"
          style={paneFragmentStyle}
        >
          <Modal payload={thisPayload} modalPayload={thisModalPayload} />
        </div>
        <div
          className="relative w-full h-full justify-self-start"
          style={paneFragmentStyle}
        >
          <MarkdownInsideModal
            payload={thisPayload}
            markdown={markdown}
            files={files}
            paneHeight={paneHeight}
            modalPayload={thisModalPayload}
            paneId={paneId}
            slug={slug}
            markdownLookup={markdownLookup}
          />
        </div>
      </div>
    );
  }

  if (!isModal && hasTextShapeOutside) {
    return (
      <MarkdownInsidePane
        payload={thisPayload}
        markdown={markdown}
        files={files}
        paneHeight={paneHeight}
        paneId={paneId}
        slug={slug}
        markdownLookup={markdownLookup}
      />
    );
  }

  if (!isModal && !hasTextShapeOutside) {
    return (
      <MarkdownPane
        payload={thisPayload}
        markdown={markdown}
        files={files}
        paneId={paneId}
        slug={slug}
        markdownLookup={markdownLookup}
      />
    );
  }

  return null;
};

export default memo(MarkdownWrapper);
