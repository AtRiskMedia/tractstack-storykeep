import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
} from "../../../store/storykeep";
import {
  updateMarkdownPart,
  extractNthElement,
} from "../../../utils/compositor/markdownUtils";
import ContentEditableField from "./ContentEditableField";
import { MS_BETWEEN_UNDO, MAX_HISTORY_LENGTH } from "../../../constants";
import type { KeyboardEvent } from "react";
import type { FieldWithHistory, HistoryEntry } from "../../../types";

interface EditableContentProps {
  content: string;
  tag: string;
  paneId: string;
  classes: string;
  nthIndex: number;
  parentTag?: string;
  globalNth?: number;
  queueUpdate: (updateFn: () => void) => void;
  isUpdating: boolean;
}

const EditableContent = ({
  content,
  tag,
  paneId,
  classes,
  nthIndex,
  parentTag,
  globalNth,
  queueUpdate,
  isUpdating,
}: EditableContentProps) => {
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId);
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const fragmentId = $paneMarkdownFragmentId[paneId]?.current;

  const [localContent, setLocalContent] = useState(content);
  const originalContentRef = useRef(content);
  const lastUpdateTimeRef = useRef(0);

  useEffect(() => {
    if (fragmentId && $paneFragmentMarkdown[fragmentId] && !isUpdating) {
      const fullMarkdown =
        $paneFragmentMarkdown[fragmentId].current.markdown.body;
      const extractedContent = extractNthElement(
        fullMarkdown,
        tag,
        nthIndex,
        parentTag
      );
      if (extractedContent !== localContent) {
        setLocalContent(extractedContent);
        originalContentRef.current = extractedContent;
      }
    }
  }, [fragmentId, $paneFragmentMarkdown, tag, nthIndex, parentTag, isUpdating]);

  const updateHistory = useCallback(
    (currentField: FieldWithHistory<any>, now: number): HistoryEntry<any>[] => {
      const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
      const newHistory = [...currentField.history];
      if (timeSinceLastUpdate > MS_BETWEEN_UNDO) {
        newHistory.unshift({ value: currentField.current, timestamp: now });
        if (newHistory.length > MAX_HISTORY_LENGTH) {
          // Remove the second oldest entry, not the first one
          newHistory.splice(-2, 1);
        }
        lastUpdateTimeRef.current = now;
      }
      return newHistory;
    },
    []
  );

  const updateStore = useCallback(
    (newContent: string) => {
      queueUpdate(() => {
        if (!fragmentId) return;
        const fragmentData = $paneFragmentMarkdown[fragmentId];
        if (
          !fragmentData ||
          !fragmentData.current ||
          !fragmentData.current.markdown
        )
          return;

        const currentMarkdown = fragmentData.current.markdown.body;
        const updatedMarkdown = updateMarkdownPart(
          currentMarkdown,
          newContent,
          tag,
          nthIndex,
          parentTag,
          globalNth
        );

        const now = Date.now();
        const newHistory = updateHistory(fragmentData, now);

        paneFragmentMarkdown.setKey(fragmentId, {
          ...fragmentData,
          current: {
            ...fragmentData.current,
            markdown: {
              ...fragmentData.current.markdown,
              body: updatedMarkdown,
            },
          },
          history: newHistory,
        });
      });
    },
    [
      fragmentId,
      tag,
      nthIndex,
      parentTag,
      globalNth,
      $paneFragmentMarkdown,
      queueUpdate,
      updateHistory,
    ]
  );

  const handleEdit = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);
      updateStore(newContent);
      return true;
    },
    [updateStore]
  );

  const handleEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing && localContent !== originalContentRef.current) {
        updateStore(localContent);
        originalContentRef.current = localContent;
      }
    },
    [localContent, updateStore]
  );

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Enter") {
        event.preventDefault();
        event.currentTarget.blur();
        return false;
      }

      if (event.ctrlKey && event.key === "z") {
        event.preventDefault();
        if (!fragmentId) return false;
        const fragmentData = $paneFragmentMarkdown[fragmentId];
        if (!fragmentData || fragmentData.history.length === 0) return false;

        queueUpdate(() => {
          const [lastEntry, ...newHistory] = fragmentData.history;
          paneFragmentMarkdown.setKey(fragmentId, {
            ...fragmentData,
            current: lastEntry.value,
            history: newHistory,
          });

          const undoneContent = extractNthElement(
            lastEntry.value.markdown.body,
            tag,
            nthIndex,
            parentTag
          );
          setLocalContent(undoneContent);
          originalContentRef.current = undoneContent;
        });

        return false;
      }

      return true;
    },
    [fragmentId, $paneFragmentMarkdown, tag, nthIndex, parentTag, queueUpdate]
  );

  return (
    <ContentEditableField
      id={`${tag}-${paneId}`}
      value={localContent}
      onChange={handleEdit}
      onEditingChange={handleEditingChange}
      onKeyDown={handleKeyDown}
      className={classes}
    />
  );
};

export default EditableContent;
