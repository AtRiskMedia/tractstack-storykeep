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
import type { KeyboardEvent } from "react";

interface EditableContentProps {
  content: string;
  tag: string;
  paneId: string;
  classes: string;
  nthIndex: number;
  parentTag?: string;
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
  queueUpdate,
  isUpdating,
}: EditableContentProps) => {
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId);
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const fragmentId = $paneMarkdownFragmentId[paneId]?.current;

  const [localContent, setLocalContent] = useState(content);
  const originalContentRef = useRef(content);

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
          parentTag
        );

        paneFragmentMarkdown.setKey(fragmentId, {
          ...fragmentData,
          current: {
            ...fragmentData.current,
            markdown: {
              ...fragmentData.current.markdown,
              body: updatedMarkdown,
            },
          },
          history: [
            ...fragmentData.history,
            {
              value: fragmentData.current,
              timestamp: Date.now(),
            },
          ],
        });
      });
    },
    [fragmentId, tag, nthIndex, parentTag, $paneFragmentMarkdown, queueUpdate]
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
        originalContentRef.current = localContent;
      }
    },
    [localContent]
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
          const previousState =
            fragmentData.history[fragmentData.history.length - 1].value;
          const newHistory = {
            ...fragmentData,
            current: previousState,
            history: fragmentData.history.slice(0, -1),
          };
          paneFragmentMarkdown.setKey(fragmentId, newHistory);

          const undoneContent = extractNthElement(
            previousState.markdown.body,
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
