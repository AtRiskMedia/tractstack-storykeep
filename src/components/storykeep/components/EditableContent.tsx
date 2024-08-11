import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  unsavedChangesStore,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import {
  updateMarkdownElement,
  markdownToHtmlAst,
  updateHistory,
} from "../../../utils/compositor/markdownUtils";
import ContentEditableField from "./ContentEditableField";
import { MAX_LENGTH_CONTENT } from "../../../constants";
import { isDeepEqual } from "../../../utils/helpers";
import type { KeyboardEvent } from "react";

interface EditableContentProps {
  content: string;
  tag: string;
  paneId: string;
  classes: string;
  outerIdx: number;
  idx: number | null;
  queueUpdate: (id: string, updateFn: () => void) => void;
}

const EditableContent = ({
  content,
  tag,
  paneId,
  classes,
  outerIdx,
  idx,
  queueUpdate,
}: EditableContentProps) => {
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId);
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const fragmentId = $paneMarkdownFragmentId[paneId]?.current;
  const $unsavedChanges = useStore(unsavedChangesStore);

  const [localContent, setLocalContent] = useState(content);
  const originalContentRef = useRef(content);
  const contentId = `${outerIdx}${typeof idx === "number" ? `-${idx}` : ""}-${fragmentId}`;

  useEffect(() => {
    setLocalContent(content);
    originalContentRef.current = content;
  }, [content]);

  const updateStore = useCallback(
    (newContent: string) => {
      if (!fragmentId) return;
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const fragmentData = $paneFragmentMarkdown[fragmentId];
      if (
        !fragmentData ||
        !fragmentData.current ||
        !fragmentData.current.markdown
      )
        return;
      const updatedMarkdown = updateMarkdownElement(
        fragmentData.current.markdown.body,
        newContent,
        tag,
        outerIdx,
        idx
      );
      const updatedHtmlAst = markdownToHtmlAst(updatedMarkdown);
      const now = Date.now();
      const newHistory = updateHistory(fragmentData, now);
      const newValue = {
        ...fragmentData.current,
        markdown: {
          ...fragmentData.current.markdown,
          body: updatedMarkdown,
          htmlAst: updatedHtmlAst,
        },
      };
      console.log(`after edit`, [updatedMarkdown], newValue);
      paneFragmentMarkdown.setKey(fragmentId, {
        ...fragmentData,
        current: newValue,
        history: newHistory,
      });
      const isUnsaved = !isDeepEqual(newValue, fragmentData.original);
      unsavedChangesStore.setKey(paneId, {
        ...$unsavedChanges[paneId],
        paneFragmentMarkdown: isUnsaved,
      });
    },
    [
      fragmentId,
      tag,
      outerIdx,
      idx,
      $paneFragmentMarkdown,
      queueUpdate,
      updateHistory,
    ]
  );

  const handleEdit = useCallback((newContent: string) => {
    if (newContent.length <= MAX_LENGTH_CONTENT) {
      setLocalContent(newContent);
      return true;
    }
    return false;
  }, []);

  const handleEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing && localContent !== originalContentRef.current) {
        queueUpdate(contentId, () => {
          updateStore(localContent);
          originalContentRef.current = localContent;
        });
      }
    },
    [localContent, queueUpdate, contentId]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.blur();
        return false;
      }
      return true;
    },
    [fragmentId, $paneFragmentMarkdown, tag, outerIdx, idx, queueUpdate]
  );
  return (
    <div className="w-full">
      <ContentEditableField
        id={`${outerIdx}${typeof idx === `number` ? `-${idx}` : ``}-${paneId}`}
        value={localContent}
        onChange={handleEdit}
        onEditingChange={handleEditingChange}
        onKeyDown={handleKeyDown}
        className={classes}
      />
    </div>
  );
};

export default EditableContent;
