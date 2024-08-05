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

export function updateMarkdownPart(
  fullMarkdown: string,
  newContent: string,
  tag: string,
  nthIndex: number,
  globalNth?: number
): string {
  const lines = fullMarkdown.split("\n");
  const currentIndex = {
    p: 0,
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    li: 0,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === "") continue;

    if (/^#{1,6}\s/.test(line)) {
      const headingMatch = line.match(/^#+/);
      const headingLevel = headingMatch ? headingMatch[0].length : 0;
      if (headingLevel > 0 && headingLevel <= 6) {
        const headingTag = `h${headingLevel}` as keyof typeof currentIndex;
        if (tag === headingTag && currentIndex[headingTag] === nthIndex) {
          lines[i] = `${"#".repeat(headingLevel)} ${newContent}`;
          return lines.join("\n");
        }
        currentIndex[headingTag]++;
      }
    } else if (/^\d+\.\s/.test(line)) {
      if (
        tag === "li" &&
        (globalNth !== undefined
          ? currentIndex.li === globalNth
          : currentIndex.li === nthIndex)
      ) {
        lines[i] = line.replace(/^(\d+\.)\s*.*/, `$1 ${newContent}`);
        return lines.join("\n");
      }
      currentIndex.li++;
    } else {
      if (tag === "p" && currentIndex.p === nthIndex) {
        lines[i] = newContent;
        return lines.join("\n");
      }
      currentIndex.p++;
    }
  }

  return lines.join("\n");
}

export function extractNthElement(
  fullMarkdown: string,
  tag: string,
  nthIndex: number,
  parentTag?: string,
  globalNth?: number
): string {
  const lines = fullMarkdown.split("\n");
  const currentIndex = {
    p: 0,
    h1: 0,
    h2: 0,
    h3: 0,
    h4: 0,
    h5: 0,
    h6: 0,
    li: 0,
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line === "") continue;

    if (/^#{1,6}\s/.test(line)) {
      const headingMatch = line.match(/^#+/);
      const headingLevel = headingMatch ? headingMatch[0].length : 0;
      if (headingLevel > 0 && headingLevel <= 6) {
        const headingTag = `h${headingLevel}` as keyof typeof currentIndex;
        if (tag === headingTag && currentIndex[headingTag] === nthIndex) {
          return line.replace(/^#+\s*/, "");
        }
        currentIndex[headingTag]++;
      }
    } else if (/^\d+\.\s/.test(line)) {
      if (
        tag === "li" &&
        (globalNth !== undefined
          ? currentIndex.li === globalNth
          : currentIndex.li === nthIndex)
      ) {
        return line.replace(/^\d+\.\s*/, "");
      }
      currentIndex.li++;
    } else {
      if (tag === "p" && currentIndex.p === nthIndex) {
        return line;
      }
      currentIndex.p++;
    }
  }

  return "";
}
