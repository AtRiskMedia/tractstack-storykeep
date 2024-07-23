import type { Root, Element, Text, RootContent, ElementContent } from "hast";
import type { MarkdownLookup } from "../../types";

export function generateMarkdownLookup(htmlAst: Root): MarkdownLookup {
  const markdownLookup: MarkdownLookup = {
    images: {},
    codeItems: {},
    listItems: {},
    links: {},
    imagesLookup: {},
    codeItemsLookup: {},
    listItemsLookup: {},
    linksLookup: {},
  };
  let imagesIndex = 0;
  let codeItemsIndex = 0;
  let listItemsIndex = 0;
  let linksIndex = 0;

  function processNode(
    node: Element | Text,
    parentNth: number,
    childNth: number | null
  ) {
    if ("tagName" in node && typeof childNth === `number`) {
      switch (node.tagName) {
        case "img":
          addToLookup("images", imagesIndex, parentNth, childNth);
          imagesIndex++;
          break;
        case "code":
          addToLookup("codeItems", codeItemsIndex, parentNth, childNth);
          codeItemsIndex++;
          break;
        case "li":
          addToLookup("listItems", listItemsIndex, parentNth, childNth);
          listItemsIndex++;
          break;
        case "a":
          addToLookup("links", linksIndex, parentNth, childNth);
          linksIndex++;
          break;
      }
    }

    if ("children" in node && Array.isArray(node.children)) {
      node.children.forEach((childNode, index) => {
        if (isProcessableNode(childNode)) {
          processNode(
            childNode,
            parentNth,
            childNth !== null ? childNth : index
          );
        }
      });
    }
  }

  function addToLookup(
    type: "images" | "codeItems" | "listItems" | "links",
    globalNth: number,
    parentNth: number,
    childNth: number
  ) {
    markdownLookup[type][globalNth] = { parentNth, childNth };
    const lookupType = `${type}Lookup` as `${typeof type}Lookup`;
    if (!markdownLookup[lookupType][parentNth]) {
      markdownLookup[lookupType][parentNth] = {};
    }
    markdownLookup[lookupType][parentNth][childNth] = globalNth;
  }

  function isProcessableNode(
    node: ElementContent | RootContent
  ): node is Element | Text {
    return "tagName" in node || "value" in node;
  }

  htmlAst.children.forEach((node, parentNth) => {
    if (isProcessableNode(node)) {
      processNode(node, parentNth, null);
    }
  });

  return markdownLookup;
}
