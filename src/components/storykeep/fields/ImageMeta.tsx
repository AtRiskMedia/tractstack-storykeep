import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  XMarkIcon,
  ArrowUpTrayIcon,
  FolderIcon,
} from "@heroicons/react/24/outline";
import {
  paneMarkdownFragmentId,
  paneFragmentMarkdown,
  lastInteractedTypeStore,
  lastInteractedPaneStore,
  paneFiles,
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
  const $paneFiles = useStore(paneFiles, { keys: [paneId] });
  const files = $paneFiles[paneId]?.current;
  const { updateStoreField } = useStoryKeepUtils(markdownFragmentId);
  const [altText, setAltText] = useState("");
  const [filename, setFilename] = useState("");
  const [imageSrc, setImageSrc] = useState("");

  useEffect(() => {
    if (markdownFragment && markdownFragment.markdown) {
      const imageNode = findImageNode(
        markdownFragment.markdown.htmlAst as Root,
        outerIdx,
        idx
      );
      if (imageNode && "properties" in imageNode) {
        setAltText((imageNode.properties?.alt as string) || "");
        setFilename((imageNode.properties?.src as string) || "");
        const thisImage = files?.filter(
          /* eslint-disable @typescript-eslint/no-explicit-any */
          (image: any) => image.filename === imageNode.properties?.src
        )[0];
        setImageSrc(thisImage?.optimizedSrc || thisImage?.src || `/static.jpg`);
      }
    }
  }, [markdownFragment, idx, outerIdx]);

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

  const handleRemoveFile = () => {
    console.log("Remove file clicked");
    // Implement file removal logic here
  };

  const handleUploadFile = () => {
    console.log("Upload file clicked");
    // Implement file upload logic here
  };

  const handleSelectFile = () => {
    console.log("Select file clicked");
    // Implement file selection logic here
  };

  return (
    <div className="space-y-4">
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
          className="block text-sm text-mydarkgrey mb-2"
        >
          Image
        </label>
        <div className="flex items-center space-x-4">
          <div className="relative w-24 aspect-video bg-slate-100 rounded-md overflow-hidden">
            <img
              src={imageSrc}
              alt={altText}
              className="w-full h-full object-contain"
            />
            <button
              onClick={handleRemoveFile}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-slate-100"
            >
              <XMarkIcon className="w-4 h-4 text-mydarkgrey" />
            </button>
          </div>
          <div className="flex-grow">
            <p className="text-sm text-mydarkgrey truncate">{filename}</p>
            <div className="mt-2 flex space-x-2">
              <button
                onClick={handleUploadFile}
                className="flex items-center text-sm text-myblue hover:text-myorange"
              >
                <ArrowUpTrayIcon className="w-4 h-4 mr-1" />
                Upload
              </button>
              <button
                onClick={handleSelectFile}
                className="flex items-center text-sm text-myblue hover:text-myorange"
              >
                <FolderIcon className="w-4 h-4 mr-1" />
                Select
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageMeta;

// Helper function to find the image node in the AST
function findImageNode(
  ast: Root,
  outerIdx: number,
  targetIdx: number
): Element | null {
  let currentIdx = 0;
  function traverse(node: Element): Element | null {
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
  return traverse(ast.children[outerIdx] as Element);
}
