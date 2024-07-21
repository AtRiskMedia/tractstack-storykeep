import type { Element, Text, Root, RootContent } from "hast";

type HastNode = RootContent | Root;

export function cleanHtmlAst(node: HastNode): HastNode | null {
  if (node.type === "text") {
    // Remove text nodes that are just newlines
    return (node as Text).value !== `\n` ? node : null;
  } else if (node.type === "element" || node.type === "root") {
    const element = node as Element | Root;
    if ("children" in element) {
      element.children = element.children
        .map(child => cleanHtmlAst(child as HastNode))
        .filter((child): child is RootContent => child !== null);
    }
    return element;
  }
  return node;
}
