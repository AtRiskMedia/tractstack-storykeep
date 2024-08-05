import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
} from "../../../store/storykeep";
import {
  updateMarkdownElement,
  extractMarkdownElement,
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
  outerIdx: number;
  idx: number | null;
  queueUpdate: (updateFn: () => void) => void;
  isUpdating: boolean;
}

const EditableContent = memo(
  ({
    content,
    tag,
    paneId,
    classes,
    outerIdx,
    idx,
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
        const extractedContent = extractMarkdownElement(
          fullMarkdown,
          tag,
          outerIdx,
          idx
        );
        if (extractedContent !== localContent) {
          setLocalContent(extractedContent);
          originalContentRef.current = extractedContent;
        }
      }
    }, [fragmentId, $paneFragmentMarkdown, tag, outerIdx, idx, isUpdating]);

    const updateHistory = useCallback(
      /* eslint-disable @typescript-eslint/no-explicit-any */
      (
        currentField: FieldWithHistory<any>,
        now: number
      ): HistoryEntry<any>[] => {
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current;
        const newHistory = [...currentField.history];
        if (timeSinceLastUpdate > MS_BETWEEN_UNDO) {
          newHistory.unshift({ value: currentField.current, timestamp: now });
          if (newHistory.length > MAX_HISTORY_LENGTH) {
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
          const updatedMarkdown = updateMarkdownElement(
            currentMarkdown,
            newContent,
            tag,
            outerIdx,
            idx
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
        outerIdx,
        idx,
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

            const undoneContent = extractMarkdownElement(
              lastEntry.value.markdown.body,
              tag,
              outerIdx,
              idx
            );
            setLocalContent(undoneContent);
            originalContentRef.current = undoneContent;
          });

          return false;
        }

        return true;
      },
      [fragmentId, $paneFragmentMarkdown, tag, outerIdx, idx, queueUpdate]
    );

    return (
      <ContentEditableField
        id={`${outerIdx}${typeof idx === `number` ? `-${idx}` : ``}-${paneId}`}
        value={localContent}
        onChange={handleEdit}
        onEditingChange={handleEditingChange}
        onKeyDown={handleKeyDown}
        className={classes}
      />
    );
  }
);

export default EditableContent;
