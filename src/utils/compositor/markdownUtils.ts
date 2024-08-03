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
    if (tag === "li" && parentTag) {
      // Handle list items
      if (
        line.trim().startsWith(`- `) ||
        line.trim().startsWith(`* `) ||
        /^\d+\./.test(line.trim())
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
    } else if (
      line.startsWith(`<${tag}`) ||
      line.match(new RegExp(`^#{1,6}\\s`))
    ) {
      // Handle other tags
      if (currentIndex === nthIndex) {
        lines[i] = newContent;
        break;
      }
      currentIndex++;
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
