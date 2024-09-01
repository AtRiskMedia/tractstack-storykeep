import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import {
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import {
  updateMarkdownElement,
  markdownToHtmlAst,
  cleanHtmlAst,
} from "../../../utils/compositor/markdownUtils";
import ContentEditableField from "./ContentEditableField";
import { MAX_LENGTH_CONTENT } from "../../../constants";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import type { KeyboardEvent } from "react";
import type { Element, Root } from "hast";

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

  const findLinks = (node: Element): Record<string, { text: string }> => {
    const links: Record<string, { text: string }> = {};

    const traverse = (n: Element) => {
      if (
        n.tagName === "a" &&
        n.properties &&
        typeof n.properties.href === "string"
      ) {
        const text =
          n.children[0] && "value" in n.children[0] ? n.children[0].value : "";
        links[n.properties.href] = { text };
      }
      if (n.children) {
        n.children.forEach(child => {
          if ("tagName" in child) {
            traverse(child);
          }
        });
      }
    };

    traverse(node);
    return links;
  };

  const updateStore = useCallback(
    (newContent: string) => {
      if (!markdownFragmentId) return;
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const mdast = fromMarkdown(newContent);
      const hast = cleanHtmlAst(toHast(mdast) as Root) as Element;
      const newLinks = findLinks(hast);
      const newBody = updateMarkdownElement(
        $paneFragmentMarkdown[markdownFragmentId].current.markdown.body,
        newContent,
        tag,
        outerIdx,
        idx
      );
      const updatedFragment = {
        ...$paneFragmentMarkdown[markdownFragmentId]?.current,
        markdown: {
          ...$paneFragmentMarkdown[markdownFragmentId]?.current?.markdown,
          body: newBody,
          htmlAst: markdownToHtmlAst(newBody),
        },
      };
      if (Object.keys(newLinks).length > 0) {
        const currentButtons =
          updatedFragment.payload.optionsPayload.buttons || {};
        const updatedButtons = {
          ...currentButtons,
          ...Object.fromEntries(
            Object.entries(newLinks).map(([url]) => [
              url,
              currentButtons[url] || {
                urlTarget: url,
                callbackPayload: "",
                className: "",
                classNamesPayload: {
                  [`button`]: {
                    classes: {},
                  },
                  [`hover`]: {
                    classes: {},
                  },
                },
              },
            ])
          ),
        };
        updatedFragment.payload.optionsPayload.buttons = updatedButtons;
      }
      updateStoreField("paneFragmentMarkdown", updatedFragment);
    },
    [
      markdownFragmentId,
      tag,
      outerIdx,
      idx,
      $paneFragmentMarkdown,
      updateStoreField,
      paneId,
    ]
  );

  const handleEdit = useCallback((newContent: string) => {
    if (
      newContent.length === 1 &&
      ["`", `#`, `*`, `-`, `1`].includes(newContent[0])
    )
      return false;
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
