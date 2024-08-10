import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import { MS_BETWEEN_UNDO, MAX_HISTORY_LENGTH } from "../../constants";
import { cloneDeep } from "../../utils/helpers";
import type {
  FieldWithHistory,
  HistoryEntry,
  MarkdownEditDatum,
  MarkdownLookup,
  OptionsPayloadDatum,
  Tuple,
} from "../../types";
import type {
  Root as HastRoot,
  Element as HastElement,
  Text as HastText,
  ElementContent,
} from "hast";
import type { Root as MdastRoot, List } from "mdast";

export function updateHistory(
  currentField: FieldWithHistory<MarkdownEditDatum>,
  now: number
): HistoryEntry<MarkdownEditDatum>[] {
  const newHistory = cloneDeep(currentField.history);
  const timeSinceLastUpdate = now - (newHistory[0]?.timestamp || 0);
  if (timeSinceLastUpdate > MS_BETWEEN_UNDO) {
    newHistory.unshift({
      value: cloneDeep(currentField.current),
      timestamp: now,
    });
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.pop();
    }
  }
  return newHistory;
}

function processMarkdownElement(
  lines: string[],
  outerIdx: number,
  idx: number | null,
  tag: string,
  action: "extract" | "update",
  newContent?: string
): string | null {
  let currentOuterIdx = 0;
  let inList = false;
  let listItemIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === "") {
      if (inList) {
        inList = false;
        listItemIndex = 0;
      }
      continue;
    }

    if (/^#{1,6}\s/.test(line)) {
      // Heading handling
      const headingMatch = line.match(/^#+/);
      const headingLevel = headingMatch ? headingMatch[0].length : 0;
      if (headingLevel > 0 && headingLevel <= 6) {
        const headingTag = `h${headingLevel}`;
        if (tag === headingTag && currentOuterIdx === outerIdx) {
          if (action === "extract") {
            return line.replace(/^#+\s*/, "");
          } else if (action === "update" && newContent) {
            lines[i] = `${"#".repeat(headingLevel)} ${newContent}`;
            return lines.join("\n");
          }
        }
        currentOuterIdx++;
      }
    } else if (/^\d+\.\s/.test(line) || /^-\s/.test(line)) {
      // List item handling
      if (!inList) {
        inList = true;
        currentOuterIdx++;
      }
      if (tag === "li" && currentOuterIdx - 1 === outerIdx) {
        if (idx === null || listItemIndex === idx) {
          if (action === "extract") {
            return line.replace(/^(\d+\.|-)\s*/, "");
          } else if (action === "update" && newContent) {
            const prefix = /^\d+\.\s/.test(line)
              ? line.match(/^\d+\./)?.at(0) ?? "1."
              : "-";
            lines[i] = `${prefix} ${newContent}`;
            return lines.join("\n");
          }
        }
      }
      listItemIndex++;
    } else {
      // Paragraph handling
      if (inList) {
        inList = false;
        listItemIndex = 0;
      }
      if (tag === "p" && currentOuterIdx === outerIdx) {
        if (action === "extract") {
          return line;
        } else if (action === "update" && newContent) {
          lines[i] = newContent;
          return lines.join("\n");
        }
      }
      currentOuterIdx++;
    }
  }

  return null;
}

export function extractMarkdownElement(
  fullMarkdown: string,
  tag: string,
  outerIdx: number,
  idx: number | null = null
): string {
  const lines = fullMarkdown.split("\n");
  const result = processMarkdownElement(lines, outerIdx, idx, tag, "extract");
  return result || "";
}

export function updateMarkdownElement(
  fullMarkdown: string,
  newContent: string,
  tag: string,
  outerIdx: number,
  idx: number | null = null
): string {
  const lines = fullMarkdown.split("\n");
  const result = processMarkdownElement(
    lines,
    outerIdx,
    idx,
    tag,
    "update",
    newContent
  );
  return result || fullMarkdown;
}

export function getGlobalNth(
  Tag: string,
  idx: number | null = null,
  outerIdx: number,
  markdownLookup: MarkdownLookup
): number | null {
  if (idx === null) return null;

  switch (Tag) {
    case "li":
      return markdownLookup?.listItemsLookup?.[outerIdx]?.[idx] ?? null;
    case "img":
      return markdownLookup?.imagesLookup?.[outerIdx]?.[idx] ?? null;
    case "code":
      return markdownLookup?.codeItemsLookup?.[outerIdx]?.[idx] ?? null;
    case "a":
      return markdownLookup?.linksLookup?.[outerIdx]?.[idx] ?? null;
    default:
      return null;
  }
}

export function reconcileOptionsPayload(
  optionsPayload: OptionsPayloadDatum,
  outerIdx: number,
  idx: number | null,
  markdownLookup: MarkdownLookup,
  isInsertion: boolean,
  insertedTag: string | null
): OptionsPayloadDatum {
  const newOptionsPayload: OptionsPayloadDatum = JSON.parse(
    JSON.stringify(optionsPayload)
  );

  const processTag = (
    tag: string,
    nthToAffect: number,
    isIncrement: boolean
  ) => {
    if (!newOptionsPayload.classNamesPayload[tag]) {
      newOptionsPayload.classNamesPayload[tag] = { classes: {} };
    }

    const tagPayload = newOptionsPayload.classNamesPayload[tag];

    if (tagPayload.override) {
      const newOverride: { [key: string]: Tuple[] } = {};
      Object.entries(tagPayload.override).forEach(([selector, overrides]) => {
        const newOverrides: Tuple[] = [];
        Object.entries(overrides).forEach(([nth, value]) => {
          const nthNum = parseInt(nth);
          if (isIncrement) {
            if (nthNum >= nthToAffect) {
              newOverrides[nthNum + 1] = value as Tuple;
            } else {
              newOverrides[nthNum] = value as Tuple;
            }
          } else {
            if (nthNum < nthToAffect) {
              newOverrides[nthNum] = value as Tuple;
            } else if (nthNum > nthToAffect) {
              newOverrides[nthNum - 1] = value as Tuple;
            }
          }
        });
        if (newOverrides.length > 0) {
          newOverride[selector] = newOverrides;
        }
      });
      if (Object.keys(newOverride).length > 0) {
        tagPayload.override = newOverride;
      } else {
        delete tagPayload.override;
      }
    }

    if (typeof tagPayload.count === "number") {
      tagPayload.count += isIncrement ? 1 : -1;
      if (tagPayload.count <= 0) {
        delete tagPayload.count;
      }
    } else if (isIncrement) {
      tagPayload.count = 1;
    }

    if (
      Object.keys(tagPayload).length === 1 &&
      "classes" in tagPayload &&
      Object.keys(tagPayload.classes).length === 0
    ) {
      delete newOptionsPayload.classNamesPayload[tag];
    }
  };

  const handleListItemInsertion = (parentTag: string) => {
    if (!newOptionsPayload.classNamesPayload[parentTag]) {
      newOptionsPayload.classNamesPayload[parentTag] = {
        classes: {},
        count: 1,
      };
    } else {
      const parentPayload = newOptionsPayload.classNamesPayload[parentTag];
      parentPayload.count = (parentPayload.count || 0) + 1;
    }
  };

  if (isInsertion) {
    if (insertedTag === "img") {
      const liNth =
        idx === null
          ? Object.keys(markdownLookup.listItemsLookup[outerIdx] || {}).length
          : idx;
      const imgNth = Object.keys(
        markdownLookup.imagesLookup[outerIdx] || {}
      ).length;

      processTag("li", liNth, true);
      processTag("img", imgNth, true);

      const parentTag = markdownLookup.nthTag[outerIdx];
      if (parentTag === "ol" || parentTag === "ul") {
        handleListItemInsertion(parentTag);
      }
    } else {
      const affectedTag = insertedTag || "li";
      const affectedNth =
        idx === null
          ? markdownLookup.nthTagLookup[affectedTag]?.[outerIdx]?.nth || 0
          : idx;

      processTag(affectedTag, affectedNth, true);

      if (affectedTag === "li") {
        const parentTag = markdownLookup.nthTag[outerIdx];
        if (parentTag === "ol" || parentTag === "ul") {
          handleListItemInsertion(parentTag);
        }
      }
    }
  } else {
    const affectedTag = idx === null ? markdownLookup.nthTag[outerIdx] : "li";
    const affectedNth =
      idx === null
        ? markdownLookup.nthTagLookup[affectedTag]?.[outerIdx]?.nth || 0
        : idx;

    processTag(affectedTag, affectedNth, false);

    if (idx !== null && affectedTag === "li") {
      const parentTag = markdownLookup.nthTag[outerIdx];
      if (parentTag === "ul" || parentTag === "ol") {
        const parentPayload = newOptionsPayload.classNamesPayload[parentTag];
        if (
          parentPayload &&
          typeof parentPayload.count === "number" &&
          parentPayload.count === 1
        ) {
          processTag(
            parentTag,
            markdownLookup.nthTagLookup[parentTag][outerIdx].nth,
            false
          );
        }
      }

      const imgGlobalNth = getGlobalNth("img", idx, outerIdx, markdownLookup);
      if (imgGlobalNth !== null) {
        const imgNth = markdownLookup.imagesLookup[outerIdx][idx];
        processTag("img", imgNth, false);
      }
    }
  }

  return newOptionsPayload;
}

export function insertElementIntoMarkdown(
  markdownEdit: MarkdownEditDatum,
  newContent: string,
  outerIdx: number,
  idx: number | null,
  markdownLookup: MarkdownLookup
): MarkdownEditDatum {
  const newMarkdown = { ...markdownEdit };
  const lines = newMarkdown.markdown.body.split("\n");
  const htmlAst = newMarkdown.markdown.htmlAst;

  let insertedTag = null;

  if (idx === null) {
    // Insert new block
    lines.splice(outerIdx, 0, newContent);
    const newNode = markdownToHtmlAst(newContent).children[0] as ElementContent;
    htmlAst.children.splice(outerIdx, 0, newNode);
    if ("tagName" in newNode) {
      insertedTag = newNode.tagName;
    }
  } else {
    // Insert nested element
    const block = lines[outerIdx].split("\n");
    block.splice(idx, 0, newContent);
    lines[outerIdx] = block.join("\n");
    const childNode = htmlAst.children[outerIdx];
    if ("children" in childNode) {
      const newNode = markdownToHtmlAst(newContent)
        .children[0] as ElementContent;
      childNode.children.splice(idx, 0, newNode);
      if ("tagName" in newNode) {
        insertedTag = newNode.tagName;
      }
    }
  }

  newMarkdown.markdown.body = lines.join("\n");
  newMarkdown.markdown.htmlAst = htmlAst;

  newMarkdown.payload.optionsPayload = reconcileOptionsPayload(
    newMarkdown.payload.optionsPayload,
    outerIdx,
    idx,
    markdownLookup,
    true,
    insertedTag
  );

  return newMarkdown;
}

export function removeElementFromMarkdown(
  markdownEdit: MarkdownEditDatum,
  outerIdx: number,
  idx: number | null,
  markdownLookup: MarkdownLookup
): MarkdownEditDatum {
  const newMarkdown = { ...markdownEdit };
  const mdast = fromMarkdown(newMarkdown.markdown.body) as MdastRoot;

  // Filter out text nodes and get only block-level elements
  const blockElements = mdast.children.filter(
    node => node.type !== "text" && node.type !== "html"
  );

  if (outerIdx >= 0 && outerIdx < blockElements.length) {
    const elementToRemove = blockElements[outerIdx];

    if (idx === null) {
      // Remove the entire block
      mdast.children = mdast.children.filter(node => node !== elementToRemove);
    } else if (
      elementToRemove.type === "list" &&
      Array.isArray((elementToRemove as List).children)
    ) {
      // Remove a specific list item
      if (idx >= 0 && idx < (elementToRemove as List).children.length) {
        (elementToRemove as List).children.splice(idx, 1);
        if ((elementToRemove as List).children.length === 0) {
          // If the list is now empty, remove the entire list
          mdast.children = mdast.children.filter(
            node => node !== elementToRemove
          );
        }
      }
    }
  }

  // Regenerate markdown from the updated AST
  newMarkdown.markdown.body = toMarkdown(mdast);

  // Update htmlAst
  const hastRoot = toHast(mdast) as HastRoot;
  newMarkdown.markdown.htmlAst = cleanHtmlAst(hastRoot) as HastRoot;

  // Update OptionsPayloadDatum
  newMarkdown.payload.optionsPayload = reconcileOptionsPayload(
    newMarkdown.payload.optionsPayload,
    outerIdx,
    idx,
    markdownLookup,
    false,
    null
  );

  return newMarkdown;
}

export function markdownToHtmlAst(markdown: string): HastRoot {
  const mdast = fromMarkdown(markdown);
  const hast = toHast(mdast) as HastRoot;
  return ensureRoot(cleanHtmlAst(hast));
}

function ensureRoot(node: HastRoot | HastElement | HastText | null): HastRoot {
  if (node && node.type === "root") {
    return node;
  }
  return { type: "root", children: node ? [node] : [] };
}

export function cleanHtmlAst(
  node: HastRoot | HastElement | HastText
): HastRoot | HastElement | HastText | null {
  if (node.type === "text") {
    return node.value !== "\n" ? node : null;
  } else if (node.type === "element" || node.type === "root") {
    if ("children" in node) {
      node.children = node.children
        .map(child => cleanHtmlAst(child as HastElement | HastText))
        .filter((child): child is HastElement | HastText => child !== null);
    }
    return node;
  }
  return node;
}
