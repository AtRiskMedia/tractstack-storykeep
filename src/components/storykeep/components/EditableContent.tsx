import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import {
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
  editModeStore,
} from "../../../store/storykeep";
import {
  updateMarkdownElement,
  markdownToHtmlAst,
  cleanHtmlAst,
} from "../../../utils/compositor/markdownUtils";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";

import ContentEditableField from "./ContentEditableField";
import { MAX_LENGTH_CONTENT } from "../../../constants";
import { useStoryKeepUtils, handleToggleOn } from "../../../utils/storykeep";
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
      let hast = cleanHtmlAst(toHast(mdast) as Root) as Element;
      let newLinks = findLinks(hast);

      const currentButtons =
        $paneFragmentMarkdown[markdownFragmentId].current.payload.optionsPayload
          .buttons || {};

      const updatedButtons = { ...currentButtons };
      let markdownUpdated = false;

      const getUniqueKey = (baseKey: string): string => {
        let newKey = baseKey;
        let counter = 1;
        while (newKey in updatedButtons) {
          newKey = `${baseKey}${counter}`;
          counter++;
        }
        return newKey;
      };

      const updateMarkdownAndButtons = (oldUrl: string, newUrl: string) => {
        mdast.children = mdast.children.map(node => {
          if (node.type === "paragraph") {
            node.children = node.children.map(child => {
              if (child.type === "link" && child.url === oldUrl) {
                return { ...child, url: newUrl };
              }
              return child;
            });
          }
          return node;
        });
        updatedButtons[newUrl] = {
          urlTarget: newUrl,
          callbackPayload: "",
          className: "",
          classNamesPayload: {
            [`button`]: { classes: {} },
            [`hover`]: { classes: {} },
          },
        };
        markdownUpdated = true;
      };

      Object.keys(newLinks).forEach(url => {
        if (updatedButtons[url] && url !== updatedButtons[url].urlTarget) {
          const newUrl = getUniqueKey(url);
          updateMarkdownAndButtons(url, newUrl);
        } else if (!updatedButtons[url]) {
          updatedButtons[url] = {
            urlTarget: url,
            callbackPayload: "",
            className: "",
            classNamesPayload: {
              [`button`]: { classes: {} },
              [`hover`]: { classes: {} },
            },
          };
        }
      });

      if (markdownUpdated) {
        newContent = toMarkdown(mdast);
        hast = cleanHtmlAst(toHast(mdast) as Root) as Element;
        newLinks = findLinks(hast);
      }

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
        payload: {
          ...$paneFragmentMarkdown[markdownFragmentId]?.current?.payload,
          optionsPayload: {
            ...$paneFragmentMarkdown[markdownFragmentId]?.current?.payload
              .optionsPayload,
            buttons: updatedButtons,
          },
        },
      };

      const newHtmlAst = markdownToHtmlAst(updatedFragment.markdown.body);
      const newMarkdownLookup = generateMarkdownLookup(newHtmlAst);
      const firstNewLink = Object.keys(newLinks).find(
        url => !currentButtons[url]
      );
      if (firstNewLink) {
        const linkInfo = newMarkdownLookup.linksByTarget[firstNewLink];
        if (linkInfo) {
          editModeStore.set({
            id: paneId,
            mode: "styles",
            type: "pane",
            targetId: {
              paneId,
              outerIdx: linkInfo.parentNth,
              idx: linkInfo.childNth,
              globalNth: linkInfo.globalNth,
              tag: "a",
              buttonTarget: firstNewLink,
            },
          });
          handleToggleOn("styles");
        }
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
