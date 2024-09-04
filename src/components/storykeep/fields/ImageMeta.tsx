import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
} from "../../../store/storykeep";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import ContentEditableField from "../components/ContentEditableField";
import {
  markdownToHtmlAst,
  updateMarkdownElement,
} from "../../../utils/compositor/markdownUtils";
import type { Root, Element } from "hast";

const ImageMeta = (props: {
  paneId: string;
  outerIdx: number;
  idx: number;
}) => {
  const { paneId, outerIdx, idx } = props;
  const $paneMarkdownFragmentId = useStore(paneMarkdownFragmentId, {
    keys: [paneId],
  });
  const markdownFragmentId = $paneMarkdownFragmentId[paneId].current;
  const $paneFragmentMarkdown = useStore(paneFragmentMarkdown, {
    keys: [markdownFragmentId],
  });
  const markdownFragment = $paneFragmentMarkdown[markdownFragmentId].current;

  const { updateStoreField } = useStoryKeepUtils(markdownFragmentId);

  const [altText, setAltText] = useState("");
  const [filename, setFilename] = useState("");

  useEffect(() => {
    if (markdownFragment && markdownFragment.markdown) {
      const imageNode = findImageNode(
        markdownFragment.markdown.htmlAst as Root,
        idx
      );
      if (imageNode && "properties" in imageNode) {
        setAltText((imageNode.properties?.alt as string) || "");
        setFilename((imageNode.properties?.src as string) || "");
      }
    }
  }, [markdownFragment, idx]);

  const handleAltTextChange = useCallback((newValue: string) => {
    setAltText(newValue);
    return true;
  }, []);

  const handleEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing) {
        updateStore(altText);
      }
    },
    [altText]
  );

  const updateStore = useCallback(
    (newAltText: string) => {
      if (!markdownFragmentId) return;
      lastInteractedTypeStore.set(`markdown`);
      lastInteractedPaneStore.set(paneId);
      const newBody = updateMarkdownElement(
        $paneFragmentMarkdown[markdownFragmentId].current.markdown.body,
        `![${newAltText}](${filename})`,
        "li",
        outerIdx,
        idx
      );
      updateStoreField("paneFragmentMarkdown", {
        ...markdownFragment,
        markdown: {
          ...markdownFragment.markdown,
          body: newBody,
          htmlAst: markdownToHtmlAst(newBody),
        },
      });
    },
    [
      markdownFragmentId,
      markdownFragment,
      filename,
      outerIdx,
      idx,
      updateStoreField,
      paneId,
    ]
  );

  return (
    <div className="space-y-4 min-w-80">
      <div>
        <label
          htmlFor="image-alt-text"
          className="block text-sm text-mydarkgrey"
        >
          Image Description (Alt Text)
        </label>
        <ContentEditableField
          id="image-alt-text"
          value={altText}
          onChange={handleAltTextChange}
          onEditingChange={handleEditingChange}
          placeholder="Enter image description"
          className="block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen xs:text-sm xs:leading-6"
        />
      </div>
      <div>
        <label
          htmlFor="image-filename"
          className="block text-sm text-mydarkgrey"
        >
          Image Filename
        </label>
        <div className="mt-1 flex items-center">
          <span className="block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen xs:text-sm xs:leading-6">
            {filename}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ImageMeta;

// Helper function to find the image node in the AST

function findImageNode(ast: Root, targetIdx: number): Element | null {
  let currentIdx = 0;

  function traverse(node: Root | Element): Element | null {
    if ("tagName" in node && node.tagName === "img") {
      if (currentIdx === targetIdx) {
        return node;
      }
      currentIdx++;
    }

    const children = "children" in node ? node.children : [];
    for (const child of children) {
      if ("tagName" in child) {
        const result = traverse(child);
        if (result) return result;
      }
    }
    return null;
  }

  return traverse(ast);
}
