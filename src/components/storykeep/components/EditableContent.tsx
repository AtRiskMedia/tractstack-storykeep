import { useCallback, useMemo, useState, useRef } from "react";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { cleanHtmlAst } from "../../../utils/compositor/cleanHtmlAst";
import ContentEditableField from "./ContentEditableField";
import {
  paneFragmentMarkdown,
  paneMarkdownFragmentId,
  toolModeStore,
} from "../../../store/storykeep";
import { updateMarkdownPart } from "../../../utils/compositor/markdownUtils";
import { useStore } from "@nanostores/react";
import type { Root } from "hast";

interface EditableContentProps {
  content: string;
  tag: string;
  paneId: string;
  classes: string;
  nthIndex: number;
  parentTag?: string;
}

const EditableContent = ({
  content,
  tag,
  paneId,
  classes,
  nthIndex,
  parentTag,
}: EditableContentProps) => {
  const $toolMode = useStore(toolModeStore);
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId);
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  const fragmentId = $paneMarkdownFragmentId[paneId]?.current;
  const [localContent, setLocalContent] = useState(content);
  const pendingUpdate = useRef(false);

  const isEditing = useMemo(
    () => $toolMode.value === "text",
    [$toolMode.value]
  );

  const regenerateHtmlAst = useCallback((markdown: string): Root => {
    const mdast = fromMarkdown(markdown);
    return cleanHtmlAst(toHast(mdast)) as Root;
  }, []);

  const updateStore = useCallback(
    (newContent: string, updateHtmlAst: boolean) => {
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

      const updatedData = {
        ...fragmentData,
        current: {
          ...fragmentData.current,
          markdown: {
            ...fragmentData.current.markdown,
            body: updatedMarkdown,
          },
        },
      };

      if (updateHtmlAst) {
        updatedData.current.markdown.htmlAst =
          regenerateHtmlAst(updatedMarkdown);
        pendingUpdate.current = false;
      }

      paneFragmentMarkdown.setKey(fragmentId, updatedData);
    },
    [
      fragmentId,
      tag,
      nthIndex,
      parentTag,
      $paneFragmentMarkdown,
      regenerateHtmlAst,
    ]
  );

  const handleEdit = useCallback(
    (newContent: string) => {
      setLocalContent(newContent);
      updateStore(newContent, false);
      pendingUpdate.current = true;
      return true;
    },
    [updateStore]
  );

  const handleEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing && pendingUpdate.current) {
        // Update htmlAst when focus is lost and there's a pending update
        updateStore(localContent, true);
      }
    },
    [localContent, updateStore]
  );

  if (isEditing) {
    return (
      <ContentEditableField
        id={`${tag}-${paneId}`}
        value={localContent}
        onChange={handleEdit}
        onEditingChange={handleEditingChange}
        className={classes}
      />
    );
  }

  return <div className={classes}>{localContent}</div>;
};

export default EditableContent;
