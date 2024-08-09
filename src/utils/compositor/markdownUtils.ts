import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { MS_BETWEEN_UNDO, MAX_HISTORY_LENGTH } from "../../constants";
import type { ElementContent, Text, Root, RootContent } from "hast";
import type {
  FieldWithHistory,
  HistoryEntry,
  MarkdownEditDatum,
  MarkdownLookup,
  OptionsPayloadDatum,
} from "../../types";

type HastNode = RootContent | Root;

export function updateHistory(
  currentField: FieldWithHistory<MarkdownEditDatum>,
  now: number
): HistoryEntry<MarkdownEditDatum>[] {
  const newHistory = [...currentField.history];
  const timeSinceLastUpdate = now - (newHistory[0]?.timestamp || 0);

  console.log("Updating history", {
    timeSinceLastUpdate,
    currentHistoryLength: newHistory.length,
  });

  if (timeSinceLastUpdate > MS_BETWEEN_UNDO) {
    newHistory.unshift({ value: currentField.current, timestamp: now });
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.pop();
    }
    console.log("History updated", {
      newHistoryLength: newHistory.length,
      latestEntry: newHistory[0].value.markdown.body,
    });
  }

  return newHistory;
}

export function cleanHtmlAst(node: HastNode): HastNode | null {
  if (node.type === "text") {
    // Remove text nodes that are just newlines
    return (node as Text).value !== `\n` ? node : null;
  } else if (node.type === "element" || node.type === "root") {
    if ("children" in node) {
      node.children = node.children
        .map(child => cleanHtmlAst(child as HastNode))
        .filter((child): child is RootContent => child !== null);
    }
    return node;
  }
  return node;
}

export function markdownToHtmlAst(markdown: string): Root {
  const mdast = fromMarkdown(markdown);
  return cleanHtmlAst(toHast(mdast)) as Root;
}

//export function renderNestedElement(element: Element | Text): string {
//  if (element.type === 'element') {
//    if (element.tagName === "a") {
//      const href = element.properties?.href as string;
//      const value = (element.children[0] as Text).value;
//      return `[${value}](${href})`;
//    } else if (element.tagName === "strong") {
//      const value = (element.children[0] as Text).value;
//      return `**${value}**`;
//    }
//    // Add more cases for other nested elements as needed
//  }
//  return (element as Text).value || '';
//}

//export function validateNestedElement(element: Element | Text): boolean {
//  if ("tagName" in element) {
//    if (element.tagName === "a") {
//      return true;
//    } else if (element.tagName === "strong") {
//      return true;
//    } else if (element.tagName === "img") {
//      return true;
//    }
//    // Add more cases for other nested elements as needed
//  }
//  return false;
//}

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

export function removeElementFromMarkdown(
  markdownEdit: MarkdownEditDatum,
  outerIdx: number,
  idx: number | null
): MarkdownEditDatum {
  const newMarkdown = { ...markdownEdit };
  const lines = newMarkdown.markdown.body.split("\n");
  const htmlAst = newMarkdown.markdown.htmlAst;

  if (idx === null) {
    // Remove entire block
    lines.splice(outerIdx, 1);
    htmlAst.children.splice(outerIdx, 1);
  } else {
    // Remove nested element (e.g., list item)
    const block = lines[outerIdx].split("\n");
    block.splice(idx, 1);
    if (block.length === 0) {
      lines.splice(outerIdx, 1);
      htmlAst.children.splice(outerIdx, 1);
    } else {
      lines[outerIdx] = block.join("\n");
      const childNode = htmlAst.children[outerIdx];
      if ("children" in childNode) {
        childNode.children.splice(idx, 1);
      }
    }
  }

  newMarkdown.markdown.body = lines.join("\n");
  newMarkdown.markdown.htmlAst = htmlAst;

  // Update OptionsPayloadDatum
  newMarkdown.payload.optionsPayload = reconcileOptionsPayload(
    newMarkdown.payload.optionsPayload,
    outerIdx,
    idx
  );

  return newMarkdown;
}

export function insertElementIntoMarkdown(
  markdownEdit: MarkdownEditDatum,
  newContent: string,
  outerIdx: number,
  idx: number | null
): MarkdownEditDatum {
  const newMarkdown = { ...markdownEdit };
  const lines = newMarkdown.markdown.body.split("\n");
  const htmlAst = newMarkdown.markdown.htmlAst;

  if (idx === null) {
    // Insert new block
    lines.splice(outerIdx, 0, newContent);
    htmlAst.children.splice(
      outerIdx,
      0,
      markdownToHtmlAst(newContent).children[0] as ElementContent
    );
  } else {
    // Insert nested element
    const block = lines[outerIdx].split("\n");
    block.splice(idx, 0, newContent);
    lines[outerIdx] = block.join("\n");
    const childNode = htmlAst.children[outerIdx];
    if ("children" in childNode) {
      childNode.children.splice(
        idx,
        0,
        markdownToHtmlAst(newContent).children[0] as ElementContent
      );
    }
  }

  newMarkdown.markdown.body = lines.join("\n");
  newMarkdown.markdown.htmlAst = htmlAst;

  // Update OptionsPayloadDatum
  newMarkdown.payload.optionsPayload = reconcileOptionsPayload(
    newMarkdown.payload.optionsPayload,
    outerIdx,
    idx
  );

  return newMarkdown;
}

function reconcileOptionsPayload(
  optionsPayload: OptionsPayloadDatum,
  outerIdx: number,
  idx: number | null
): OptionsPayloadDatum {
  const newOptionsPayload = { ...optionsPayload };

  Object.keys(newOptionsPayload.classNamesPayload).forEach(tag => {
    if (newOptionsPayload.classNamesPayload[tag].override) {
      /* eslint-disable @typescript-eslint/no-explicit-any */
      const newOverride: Record<string, any> = {};
      Object.entries(newOptionsPayload.classNamesPayload[tag].override).forEach(
        ([selector, overrides]) => {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          const newOverrides: Record<string, any> = {};
          Object.entries(overrides).forEach(([nth, value]) => {
            const nthNum = parseInt(nth);
            if (
              nthNum < outerIdx ||
              (idx !== null && nthNum === outerIdx && parseInt(nth) < idx)
            ) {
              newOverrides[nth] = value;
            } else if (
              nthNum > outerIdx ||
              (idx !== null && nthNum === outerIdx && parseInt(nth) > idx)
            ) {
              newOverrides[String(nthNum - 1)] = value;
            }
          });
          if (Object.keys(newOverrides).length > 0) {
            newOverride[selector] = newOverrides;
          }
        }
      );
      newOptionsPayload.classNamesPayload[tag].override = newOverride;
    }
  });

  return newOptionsPayload;
}

//function updateOptionsPayloadForInsert(
//  optionsPayload: OptionsPayloadDatum,
//  outerIdx: number,
//  idx: number | null
//): OptionsPayloadDatum {
//  const newOptionsPayload = { ...optionsPayload };
//
//  Object.keys(newOptionsPayload.classNamesPayload).forEach(tag => {
//    if (newOptionsPayload.classNamesPayload[tag].override) {
//      /* eslint-disable @typescript-eslint/no-explicit-any */
//      const newOverride: Record<string, any> = {};
//      Object.entries(newOptionsPayload.classNamesPayload[tag].override).forEach(
//        ([selector, overrides]) => {
//          /* eslint-disable @typescript-eslint/no-explicit-any */
//          const newOverrides: Record<string, any> = {};
//          Object.entries(overrides).forEach(([nth, value]) => {
//            const nthNum = parseInt(nth);
//            if (
//              nthNum < outerIdx ||
//              (idx !== null && nthNum === outerIdx && parseInt(nth) < idx)
//            ) {
//              newOverrides[nth] = value;
//            } else {
//              newOverrides[String(nthNum + 1)] = value;
//            }
//          });
//          newOverride[selector] = newOverrides;
//        }
//      );
//      newOptionsPayload.classNamesPayload[tag].override = newOverride;
//    }
//  });
//
//  return newOptionsPayload;
//}
