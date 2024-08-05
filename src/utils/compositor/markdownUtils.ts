export function updateMarkdownPart(
  fullMarkdown: string,
  newContent: string,
  tag: string,
  nthIndex: number,
  parentTag?: string
): string {
  const lines = fullMarkdown.split("\n");
  let currentIndex = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (tag === "p" && !line.startsWith("#") && line !== "") {
      // Handle paragraphs
      if (currentIndex === nthIndex) {
        lines[i] = newContent;
        break;
      }
      currentIndex++;
    } else if (tag.match(/^h[1-6]$/)) {
      const headingLevel = Number(tag.charAt(1));
      if (
        line.startsWith("#".repeat(headingLevel)) &&
        !line.startsWith("#".repeat(headingLevel + 1))
      ) {
        if (currentIndex === nthIndex) {
          lines[i] = `${"#".repeat(headingLevel)} ${newContent}`;
          break;
        }
        currentIndex++;
      }
    } else if (tag === "li" && parentTag) {
      // Handle list items
      if (
        line.startsWith("- ") ||
        line.startsWith("* ") ||
        /^\d+\./.test(line)
      ) {
        if (currentIndex === nthIndex) {
          lines[i] = line.replace(
            /^(\s*(?:-|\*|\d+\.)\s*).*/,
            `$1${newContent}`
          );
          break;
        }
        currentIndex++;
      }
    }
  }

  return lines.join("\n");
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const renderNestedElement = (element: any): string => {
  if (element.tagName === "a") {
    return `[${element.children[0].value}](${element.properties.href})`;
  } else if (element.tagName === "strong") {
    return `**${element.children[0].value}**`;
  }
  // Add more cases for other nested elements as needed
  return element.children[0].value;
};

export function extractNthElement(
  fullMarkdown: string,
  tag: string,
  nthIndex: number,
  parentTag?: string
): string {
  const lines = fullMarkdown.split("\n");
  let currentIndex = 0;
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (
      tag === "p" &&
      !line.startsWith("#") &&
      !line.startsWith("-") &&
      !line.startsWith("*") &&
      !/^\d+\./.test(line) &&
      line !== ""
    ) {
      if (currentIndex === nthIndex) {
        return line;
      }
      currentIndex++;
    } else if (tag.match(/^h[1-6]$/)) {
      const headingLevel = Number(tag.charAt(1));
      if (
        line.startsWith("#".repeat(headingLevel)) &&
        !line.startsWith("#".repeat(headingLevel + 1))
      ) {
        if (currentIndex === nthIndex) {
          return line.replace(/^#+\s*/, "");
        }
        currentIndex++;
      }
    } else if (tag === "li" && parentTag) {
      if (
        line.startsWith("- ") ||
        line.startsWith("* ") ||
        /^\d+\./.test(line)
      ) {
        inList = true;
        if (currentIndex === nthIndex) {
          return line.replace(/^(\s*(?:-|\*|\d+\.)\s*)/, "");
        }
        currentIndex++;
      } else if (inList && line === "") {
        inList = false;
      }
    }
  }
  return "";
}
