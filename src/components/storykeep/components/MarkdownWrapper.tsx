import { useMemo } from "react";
import { useStore } from "@nanostores/react";
import MarkdownPane from "./MarkdownPane";
import MarkdownInsidePane from "./MarkdownInsidePane";
import Modal from "./Modal";
import MarkdownInsideModal from "./MarkdownInsideModal";
import { classNames } from "../../../utils/helpers";
import {
  toolAddModeTitles,
  toolAddModeInsertDefault,
} from "../../../constants";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  unsavedChangesStore,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
  toolModeStore,
} from "../../../store/storykeep";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import {
  insertElementIntoMarkdown,
  updateHistory,
} from "../../../utils/compositor/markdownUtils";
import { cloneDeep } from "../../../utils/helpers";
import type {
  MarkdownDatum,
  MarkdownPaneDatum,
  FileNode,
  BgPaneDatum,
  ToolAddMode,
  ToolMode,
  ViewportAuto,
} from "../../../types";

interface Props {
  readonly: boolean;
  payload: MarkdownPaneDatum | BgPaneDatum;
  markdown: MarkdownDatum;
  files: FileNode[];
  paneHeight: [number, number, number];
  paneId: string;
  paneFragmentIds: string[];
  markdownFragmentId: string | null;
  slug: string;
  queueUpdate: (id: string, updateFn: () => void) => void;
  viewportKey: ViewportAuto;
  toolMode: ToolMode;
  toolAddMode: ToolAddMode;
}

const MarkdownWrapper = ({
  readonly,
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
    height:
      viewportKey === `mobile` && paneHeight[0] === 0
        ? `auto`
        : viewportKey === `mobile`
          ? `calc(var(--scale)*${paneHeight[0]}px)`
          : viewportKey === `tablet` && paneHeight[1] === 0
            ? `auto`
            : viewportKey === `tablet`
              ? `calc(var(--scale)*${paneHeight[1]}px)`
              : viewportKey === `desktop` && paneHeight[2] === 0
                ? `auto`
                : viewportKey === `desktop`
                  ? `calc(var(--scale)*${paneHeight[2]}px)`
                  : `auto`,
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
    queueUpdate(fragmentId, () => {
      const newContent = toolAddModeInsertDefault[toolAddMode as ToolAddMode];
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const currentField = cloneDeep($paneFragmentMarkdown[fragmentId]);
      const now = Date.now();
      const newHistory = updateHistory(currentField, now);
      const newAsideContainer = toolAddMode === `aside`;
      // wrap inside ol if new text container
      const thisNewContent = newAsideContainer
        ? `1. ${newContent}`
        : newContent;
      const newValue = insertElementIntoMarkdown(
        currentField.current,
        thisNewContent,
        toolAddMode,
        0,
        null,
        `before`,
        markdownLookup
      );
      paneFragmentMarkdown.setKey(fragmentId, {
        ...currentField,
        current: newValue,
        history: newHistory,
      });
      // safely assumes this is new/unsaved
      unsavedChangesStore.setKey(paneId, {
        ...$unsavedChanges[paneId],
        paneFragmentMarkdown: true,
      });
      toolModeStore.set({ value: `text` });
    });
  };

  const renderContent = () => {
    if (isModal && thisModalPayload) {
      return (
        <MarkdownInsideModal
          readonly={readonly}
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
          readonly={readonly}
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
          readonly={readonly}
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
  //console.log(markdown.body)
  //console.log(payload.optionsPayload.classNamesPayload);
  return (
    <div
      className={classNames(hidden, `h-fit-contents`)}
      id={`t8k-${markdownFragmentId}-modal-container`}
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
