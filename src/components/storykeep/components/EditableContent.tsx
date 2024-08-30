import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import {
  updateMarkdownElement,
  markdownToHtmlAst,
} from "../../../utils/compositor/markdownUtils";
import ContentEditableField from "./ContentEditableField";
import { MAX_LENGTH_CONTENT } from "../../../constants";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import type { KeyboardEvent } from "react";

interface EditableContentProps {
  content: string;
  tag: string;
  paneId: string;
  markdownFragmentId: string;
  classes: string;
  outerIdx: number;
  idx: number | null;
  queueUpdate: (id: string, updateFn: () => void) => void;
}

const EditableContent = ({
  content,
  tag,
  paneId,
  markdownFragmentId,
  classes,
  outerIdx,
  idx,
  queueUpdate,
}: EditableContentProps) => {
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const [localContent, setLocalContent] = useState(content);
  const originalContentRef = useRef(content);
  const contentId = `${outerIdx}${typeof idx === "number" ? `-${idx}` : ""}-${markdownFragmentId}`;
  const { updateStoreField } = useStoryKeepUtils(markdownFragmentId, []);

  useEffect(() => {
    setLocalContent(content);
    originalContentRef.current = content;
  }, [content]);

  const updateStore = useCallback(
    (newContent: string) => {
      if (!markdownFragmentId) return;
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const newBody = updateMarkdownElement(
        $paneFragmentMarkdown[markdownFragmentId].current.markdown.body,
        newContent,
        tag,
        outerIdx,
        idx
      );
      updateStoreField("paneFragmentMarkdown", {
        ...($paneFragmentMarkdown[markdownFragmentId]?.current || {}),
        markdown: {
          ...($paneFragmentMarkdown[markdownFragmentId]?.current?.markdown ||
            {}),
          body: newBody,
          htmlAst: markdownToHtmlAst(newBody),
        },
      });
    },
    [
      markdownFragmentId,
      tag,
      outerIdx,
      idx,
      $paneFragmentMarkdown,
      updateStoreField,
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
    [markdownFragmentId, $paneFragmentMarkdown, tag, outerIdx, idx, queueUpdate]
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
