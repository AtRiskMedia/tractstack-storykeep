import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import type { Row } from "@libsql/client";
import type { FileDatum, PaneDatum, FileNode } from "../../types";

export function cleanTursoPane(row: Row, files: FileNode[]) {
  const thisFiles = files?.map((f: FileNode, idx: number) => {
    let altText = ``;
    const regexpImage = `^.*\\[(.*)\\]\\((${f.filename})\\)`;
    const match =
      typeof row?.markdown_body === `string` &&
      row.markdown_body.replace(/[\n\r]+/g, " ").match(regexpImage);
    if (match && typeof match[1] === `string`) altText = match[1];
    return {
      ...f,
      id: f.id,
      index: idx,
      altText:
        altText ||
        `This should be a description of the image; we apologize for this information being unset`,
    } as FileDatum;
  });
  const markdown = typeof row?.markdown_body === `string` &&
    typeof row?.slug === `string` && {
      body: row.markdown_body,
      slug: `${row.slug}-markdown`,
      title: `Copy for ${row.slug}`,
      htmlAst: toHast(fromMarkdown(row.markdown_body)),
    };

  if (
    typeof row?.id === `string` &&
    typeof row?.title === `string` &&
    typeof row?.slug === `string` &&
    typeof row?.created === `string` &&
    typeof row?.options_payload === `string` &&
    typeof row?.height_offset_desktop === `number` &&
    typeof row?.height_offset_tablet === `number` &&
    typeof row?.height_offset_mobile === `number` &&
    typeof row?.height_ratio_desktop === `string` &&
    typeof row?.height_ratio_tablet === `string` &&
    typeof row?.height_ratio_mobile === `string`
  ) {
    return {
      id: row.id,
      title: row.title,
      slug: row.slug,
      created: new Date(row.created),
      changed:
        (typeof row?.changed === `string` && new Date(row.changed)) || null,
      optionsPayload: row?.options_payload && JSON.parse(row.options_payload),
      heightOffsetDesktop: row?.height_offset_desktop || 0,
      heightOffsetMobile: row?.height_offset_tablet || 0,
      heightOffsetTablet: row?.height_offset_mobile || 0,
      heightRatioDesktop: row?.height_ratio_desktop || `0.00`,
      heightRatioMobile: row?.height_ratio_tablet || `0.00`,
      heightRatioTablet: row?.height_ratio_mobile || `0.00`,
      markdown: markdown,
      files: thisFiles || [],
    } as PaneDatum;
  }
  return null;
}
