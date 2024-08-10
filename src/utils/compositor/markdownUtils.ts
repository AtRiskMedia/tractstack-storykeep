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
  insertedTag: string | null = null
): OptionsPayloadDatum {
  const newOptionsPayload = JSON.parse(
    JSON.stringify(optionsPayload)
  ) as OptionsPayloadDatum;

  if (isInsertion) {
    // Handle insertion
    if (insertedTag) {
      if (!newOptionsPayload.classNamesPayload[insertedTag]) {
        newOptionsPayload.classNamesPayload[insertedTag] = {
          classes: {},
          count: 1,
        };
      } else {
        newOptionsPayload.classNamesPayload[insertedTag].count =
          (newOptionsPayload.classNamesPayload[insertedTag].count || 0) + 1;
      }

      // Adjust nth values for the inserted tag and subsequent tags of the same type
      Object.keys(newOptionsPayload.classNamesPayload).forEach(tag => {
        if (
          tag === insertedTag &&
          newOptionsPayload.classNamesPayload[tag].override
        ) {
          /* eslint-disable @typescript-eslint/no-explicit-any */
          const newOverride: Record<string, any> = {};

          if (newOptionsPayload.classNamesPayload[tag]?.override) {
            Object.entries(
              newOptionsPayload.classNamesPayload[tag].override || {}
            ).forEach(([selector, overrides]) => {
              /* eslint-disable @typescript-eslint/no-explicit-any */
              const newOverrides: Record<string, any> = {};
              Object.entries(overrides).forEach(([nth, value]) => {
                const nthNum = parseInt(nth);
                if (nthNum >= outerIdx) {
                  newOverrides[String(nthNum + 1)] = value;
                } else {
                  newOverrides[nth] = value;
                }
              });
              newOverride[selector] = newOverrides;
            });
          }
          newOptionsPayload.classNamesPayload[tag].override = newOverride;
        }
      });
    }
  } else {
    // Handle removal (keep existing removal logic)
    const removedTag = idx === null ? markdownLookup.nthTag[outerIdx] : "li";
    const removedNth =
      idx === null
        ? markdownLookup.nthTagLookup[removedTag][outerIdx].nth
        : idx;

    const processTag = (tag: string, nthToRemove: number) => {
      if (newOptionsPayload.classNamesPayload[tag]?.override) {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const newOverride: Record<string, any> = {};
        const overrideValue =
          newOptionsPayload?.classNamesPayload[tag]?.override ?? {};
        if (overrideValue) {
          Object.entries(overrideValue).forEach(([selector, overrides]) => {
            /* eslint-disable @typescript-eslint/no-explicit-any */
            const newOverrides: Record<string, any> = {};
            Object.entries(overrides).forEach(([nth, value]) => {
              const nthNum = parseInt(nth);
              if (nthNum < nthToRemove) {
                newOverrides[nth] = value;
              } else if (nthNum > nthToRemove) {
                newOverrides[String(nthNum - 1)] = value;
              }
            });
            if (Object.keys(newOverrides).length > 0) {
              newOverride[selector] = newOverrides;
            }
          });
        }
        if (Object.keys(newOverride).length > 0) {
          newOptionsPayload.classNamesPayload[tag].override = newOverride;
        } else {
          delete newOptionsPayload.classNamesPayload[tag].override;
        }
      }

      if (typeof newOptionsPayload.classNamesPayload[tag]?.count === "number") {
        newOptionsPayload.classNamesPayload[tag].count =
          (newOptionsPayload.classNamesPayload[tag].count || 0) - 1;
        if ((newOptionsPayload?.classNamesPayload[tag]?.count ?? 0) <= 0) {
          delete newOptionsPayload.classNamesPayload[tag].count;
        }
      }

      if (Object.keys(newOptionsPayload.classNamesPayload[tag]).length === 0) {
        delete newOptionsPayload.classNamesPayload[tag];
      }
    };

    // Process the removed tag
    processTag(removedTag, removedNth);

    // Handle removal of the last li in ol or ul
    if (idx !== null && removedTag === "li") {
      const parentTag = markdownLookup.nthTag[outerIdx];
      if (parentTag === "ol" || parentTag === "ul") {
        const parentNth = markdownLookup.nthTagLookup[parentTag][outerIdx].nth;
        if (newOptionsPayload.classNamesPayload[parentTag]?.count === 1) {
          processTag(parentTag, parentNth);
        }
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
