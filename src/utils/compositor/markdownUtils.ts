import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import type { Root } from "hast";
import type { MarkdownLookup } from "../../types";

export function markdownToHtmlAst(markdown: string): Root {
  const mdast = fromMarkdown(markdown);
  return toHast(mdast) as Root;
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
