import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import MarkdownPane from "./MarkdownPane";
import MarkdownInsidePane from "./MarkdownInsidePane";
import Modal from "./Modal";
import MarkdownInsideModal from "./MarkdownInsideModal";
import { classNames } from "../../../utils/helpers";
import { toolAddModeTitles } from "../../../constants";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  unsavedChangesStore,
} from "../../../store/storykeep";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import {
  insertElementIntoMarkdown,
  updateHistory,
} from "../../../utils/compositor/markdownUtils";
import type {
  MarkdownDatum,
  MarkdownPaneDatum,
  FileNode,
  BgPaneDatum,
  ToolAddMode,
  ToolMode,
  Viewport,
} from "../../../types";

interface Props {
  payload: MarkdownPaneDatum | BgPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneHeight: [number, number, number];
  paneId: string;
  paneFragmentIds: string[];
  markdownFragmentId: string | null;
  slug: string;
  queueUpdate: (id: string, updateFn: () => void) => void;
  viewportKey: Viewport;
  toolMode: ToolMode;
  toolAddMode: ToolAddMode;
}

const MarkdownWrapper = ({
  payload,
  markdown,
  files,
  paneHeight,
  paneId,
  paneFragmentIds,
  markdownFragmentId,
  slug,
  queueUpdate,
  viewportKey,
  toolMode,
  toolAddMode,
}: Props) => {
  if (!markdownFragmentId) return null;
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

  const $unsavedChanges = useStore(unsavedChangesStore, { keys: [paneId] });
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [paneId],
  });
  const fragmentId = $paneMarkdownFragmentId[paneId]?.current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [fragmentId],
  });
  const isEmptyMarkdown = markdown.body === ``;
  const mustIntercept = isEmptyMarkdown && toolMode === `insert`;

  const isModal =
    thisPayload.isModal &&
    typeof thisPayload?.optionsPayload?.modal !== `undefined`;

  const hasTextShapeOutside =
    thisPayload.textShapeOutsideMobile !== `none` ||
    thisPayload.textShapeOutsideTablet !== `none` ||
    thisPayload.textShapeOutsideDesktop !== `none`;

  const markdownLookup = useMemo(
    () => markdown?.htmlAst && generateMarkdownLookup(markdown.htmlAst),
    [markdown?.htmlAst]
  );

  const handleInsert = () => {
    const newContent = `${toolAddModeTitles[toolAddMode as ToolAddMode]} content`;
    queueUpdate(fragmentId, () => {
      const currentField = $paneFragmentMarkdown[fragmentId];
      const newMarkdownEdit = insertElementIntoMarkdown(
        currentField.current,
        newContent,
        0,
        null,
        "before",
        markdownLookup
      );
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      paneFragmentMarkdown.setKey(fragmentId, {
        ...currentField,
        current: newMarkdownEdit,
        history: newHistory,
      });
      unsavedChangesStore.setKey(paneId, {
        ...$unsavedChanges[paneId],
        paneFragmentMarkdown: true,
      });
    });
  };

  const renderContent = () => {
    if (isModal && thisModalPayload) {
      return (
        <MarkdownInsideModal
          payload={thisPayload}
          markdown={markdown}
          files={files}
          paneHeight={paneHeight}
          modalPayload={thisModalPayload}
          paneId={paneId}
          paneFragmentIds={paneFragmentIds}
          markdownFragmentId={markdownFragmentId}
          slug={slug}
          markdownLookup={markdownLookup}
          toolMode={toolMode}
          toolAddMode={toolAddMode}
          viewportKey={viewportKey}
          queueUpdate={queueUpdate}
        />
      );
    } else if (!isModal && hasTextShapeOutside) {
      return (
        <MarkdownInsidePane
          payload={thisPayload}
          markdown={markdown}
          files={files}
          paneHeight={paneHeight}
          paneId={paneId}
          paneFragmentIds={paneFragmentIds}
          markdownFragmentId={markdownFragmentId}
          slug={slug}
          markdownLookup={markdownLookup}
          toolMode={toolMode}
          toolAddMode={toolAddMode}
          viewportKey={viewportKey}
          queueUpdate={queueUpdate}
        />
      );
    } else if (!isModal && !hasTextShapeOutside) {
      return (
        <MarkdownPane
          payload={thisPayload}
          markdown={markdown}
          files={files}
          paneId={paneId}
          paneFragmentIds={paneFragmentIds}
          markdownFragmentId={markdownFragmentId}
          slug={slug}
          markdownLookup={markdownLookup}
          toolMode={toolMode}
          toolAddMode={toolAddMode}
          viewportKey={viewportKey}
          queueUpdate={queueUpdate}
        />
      );
    }
    return null;
  };

  if (mustIntercept) {
    return (
      <div className="min-h-[200px] w-full relative">
        <button
          className="relative z-103 w-full h-full bg-mygreen/20 hover:bg-mygreen/50 pointer-events-auto min-h-[200px]"
          title={`Add ${toolAddModeTitles[toolAddMode as ToolAddMode]}`}
          onClick={handleInsert}
        >
          <div
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
             text-black bg-mywhite p-2.5 rounded-sm shadow-md
             text-xl md:text-3xl font-action mx-6"
          >
            Add {toolAddModeTitles[toolAddMode as ToolAddMode]}
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={classNames(hidden, `h-fit-contents`)}
      id={`t8k-${thisPayload.id}-modal-container`}
    >
      {isModal && thisModalPayload && (
        <div
          className="relative w-full h-full justify-self-start"
          style={paneFragmentStyle}
        >
          <Modal
            payload={thisPayload}
            modalPayload={thisModalPayload}
            viewportKey={viewportKey}
          />
        </div>
      )}
      <div
        className="relative w-full h-full justify-self-start"
        style={paneFragmentStyle}
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default MarkdownWrapper;
