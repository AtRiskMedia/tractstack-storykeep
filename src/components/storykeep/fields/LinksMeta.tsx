import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import { cloneDeep } from "../../../utils/helpers";
import { cleanHtmlAst } from "../../../utils/compositor/markdownUtils";
import ContentEditableField from "../components/ContentEditableField";
import { toHast } from "mdast-util-to-hast";
import { toMarkdown } from "mdast-util-to-markdown";
import { fromMarkdown } from "mdast-util-from-markdown";
import { generateMarkdownLookup } from "../../../utils/compositor/generateMarkdownLookup";
import type { Root, Element } from "hast";
import type { Root as MdastRoot } from "mdast";
import type { ButtonData } from "../../../types";

interface LinkData extends ButtonData {
  text: string;
  outerIdx: number;
  idx: number;
}

const LinksMeta = (props: { paneId: string }) => {
  const { paneId } = props;
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [paneId],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[paneId]?.current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const markdownFragment = $paneFragmentMarkdown[markdownFragmentId]?.current;

  const { updateStoreField } = useStoryKeepUtils(markdownFragmentId);

  const [links, setLinks] = useState<Record<string, LinkData>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (markdownFragment?.markdown) {
      const mdast = fromMarkdown(markdownFragment.markdown.body);
      const hast = cleanHtmlAst(toHast(mdast) as Root);
      const lookup =
        hast && "type" in hast && hast.type === "root"
          ? generateMarkdownLookup(hast)
          : null;
      const initialLinks: Record<string, LinkData> = {};

      if (lookup) {
        const linkNodes = findLinkNodes(hast as Element);
        linkNodes.forEach((node, index) => {
          const href = node.properties?.href as string;
          const text = (
            node.children[0] && "value" in node.children[0]
              ? node.children[0].value
              : ""
          ) as string;
          if (href) {
            const buttonData =
              markdownFragment.payload.optionsPayload.buttons?.[
                href as keyof ButtonData
              ];
            const linkInfo = lookup.links[index];
            initialLinks[href] = {
              urlTarget: href,
              text: text,
              callbackPayload: buttonData?.callbackPayload || "",
              className: buttonData?.className || "",
              classNamesPayload: buttonData?.classNamesPayload || {},
              outerIdx: linkInfo ? linkInfo.parentNth : 0,
              idx: linkInfo ? linkInfo.childNth : 0,
            };
          }
        });
      }
      setLinks(initialLinks);
      setIsLoading(false);
    }
  }, [markdownFragment]);

  const updateLinkInMarkdown = (
    mdast: MdastRoot,
    outerIdx: number,
    idx: number,
    newText: string
  ): MdastRoot => {
    const newMdast = cloneDeep(mdast);
    let currentOuterIdx = 0;
    let linkFound = false;

    /* eslint-disable @typescript-eslint/no-explicit-any */
    function traverseAndUpdate(node: any) {
      if (linkFound) return;

      if (currentOuterIdx === outerIdx) {
        let currentIdx = 0;
        if (Array.isArray(node.children)) {
          for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            if (child.type === "link") {
              if (currentIdx === idx) {
                // Update the link text
                node.children[i] = {
                  ...child,
                  children: [{ type: "text", value: newText }],
                };
                linkFound = true;
                return;
              }
            }
            currentIdx++;
            if (child.children) {
              traverseAndUpdate(child);
            }
          }
        }
      }

      if (
        node.type &&
        ["paragraph", "list", "listItem", "heading"].includes(node.type)
      ) {
        currentOuterIdx++;
      }
    }

    newMdast.children.forEach(traverseAndUpdate);

    return newMdast;
  };

  const updateStore = useCallback(
    (
      linkKey: string,
      field: "text" | "callbackPayload",
      currentLinkData: LinkData
    ) => {
      if (!markdownFragmentId || !markdownFragment) return;
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);

      let mdast = fromMarkdown(markdownFragment.markdown.body);

      if (field === "text") {
        mdast = updateLinkInMarkdown(
          mdast,
          currentLinkData.outerIdx,
          currentLinkData.idx,
          currentLinkData.text
        );
      }

      const newBody = toMarkdown(mdast);
      const newHast = toHast(mdast) as Root;

      const updatedButtons: Record<string, ButtonData> = {
        ...(markdownFragment.payload.optionsPayload.buttons || {}),
      };
      if (!updatedButtons[linkKey]) {
        updatedButtons[linkKey] = {} as ButtonData;
      }
      updatedButtons[linkKey] = {
        ...updatedButtons[linkKey],
        [field]: currentLinkData[field],
      };

      updateStoreField("paneFragmentMarkdown", {
        ...markdownFragment,
        markdown: {
          ...markdownFragment.markdown,
          body: newBody,
          htmlAst: newHast,
        },
        payload: {
          ...markdownFragment.payload,
          optionsPayload: {
            ...markdownFragment.payload.optionsPayload,
            buttons: updatedButtons,
          },
        },
      });
    },
    [markdownFragmentId, markdownFragment, updateStoreField, paneId]
  );

  const handleLinkChange = useCallback(
    (linkKey: string, field: "text" | "callbackPayload", value: string) => {
      setLinks(prevLinks => ({
        ...prevLinks,
        [linkKey]: {
          ...prevLinks[linkKey],
          [field]: value,
        },
      }));
    },
    []
  );

  const handleEditingChange = useCallback(
    (editing: boolean, linkKey: string, field: "text" | "callbackPayload") => {
      if (!editing) {
        const currentLinkData = links[linkKey];
        if (currentLinkData) {
          updateStore(linkKey, field, currentLinkData);
        }
      }
    },
    [links, updateStore]
  );

  if (isLoading) {
    return <div>Loading links...</div>;
  }

  if (Object.keys(links).length === 0) {
    return <div>No links found in this pane.</div>;
  }

  return (
    <div className="space-y-4">
      {Object.entries(links).map(([linkKey, linkData]) => (
        <div key={linkKey} className="border p-4 rounded">
          <h3 className="font-bold mb-2">Link: {linkData.urlTarget}</h3>
          <div className="space-y-2">
            {(["text", "callbackPayload"] as const).map(field => (
              <div key={field}>
                <label
                  htmlFor={`${linkKey}-${field}`}
                  className="block text-sm font-medium text-mydarkgrey"
                >
                  {field === "text" ? "Link Text" : "Callback Payload"}
                </label>
                <ContentEditableField
                  id={`${linkKey}-${field}`}
                  value={linkData[field]}
                  onChange={value => {
                    handleLinkChange(linkKey, field, value);
                    return true;
                  }}
                  onEditingChange={editing =>
                    handleEditingChange(editing, linkKey, field)
                  }
                  placeholder={`Enter ${field === "text" ? "link text" : "callback payload"}`}
                  className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
                />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default LinksMeta;

// Helper function to find link nodes in the AST
function findLinkNodes(ast: Element): Element[] {
  const linkNodes: Element[] = [];

  function traverse(node: Element): void {
    if (node.tagName === "a") {
      linkNodes.push(node);
    }
    if (node.children) {
      for (const child of node.children) {
        if ("tagName" in child) {
          traverse(child);
        }
      }
    }
  }

  traverse(ast);
  return linkNodes;
}
