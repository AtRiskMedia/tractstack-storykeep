import { cleanTursoFile } from "./tursoFile";
import { getOptimizedImage } from "../helpers";
import type { Row } from "@libsql/client";
import type {
  PaneDesign,
  PaneDesignMarkdown,
  PaneDesignBgPane,
  BgColourDatum,
  MarkdownPaneDatum,
  BgPaneDatum,
  PaneDesignOptionsPayload,
  FileNode,
  TursoFileNode,
  FileDatum,
} from "../../types";

export async function cleanPaneDesigns(rows: Row[]): Promise<PaneDesign[]> {
  if (!rows || rows.length === 0) {
    return [];
  }

  const cleanedDesigns = await Promise.all(
    rows.map(async (row: Row): Promise<PaneDesign | null> => {
      const filesPayload =
        (typeof row?.files === `string` && JSON.parse(row.files)) || [];
      const files = cleanTursoFile(filesPayload);
      const optimizedImagesPre: TursoFileNode[] = [];
      files.forEach((f: TursoFileNode) => {
        if (
          !optimizedImagesPre.filter(
            (i: TursoFileNode) => i.filename === f.filename
          ).length
        )
          optimizedImagesPre.push({
            id: f.id,
            filename: f.filename,
            url: f.url,
          });
      });
      const optimizedImages: FileNode[] = await Promise.all(
        optimizedImagesPre.map(async (i: TursoFileNode) => {
          const src = `${import.meta.env.PUBLIC_IMAGE_URL}${i.url}`;
          const optimizedSrc = await getOptimizedImage(src);
          return {
            id: i.id,
            filename: i.filename,
            optimizedSrc: optimizedSrc || undefined,
            src,
          };
        })
      );
      const thisFilesPayload: FileNode[] = [];
      files?.forEach((f: TursoFileNode) => {
        const optimizedSrc = optimizedImages.find(
          (o: FileNode) => o.filename === f.filename
        );
        if (optimizedSrc) thisFilesPayload.push(optimizedSrc);
      });

      const thisFiles = thisFilesPayload?.map((f: FileNode, idx: number) => {
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

      if (
        typeof row?.id !== "string" ||
        typeof row?.title !== "string" ||
        typeof row?.slug !== "string" ||
        typeof row?.options_payload !== "string" ||
        typeof row?.height_offset_desktop !== `number` ||
        typeof row?.height_offset_tablet !== `number` ||
        typeof row?.height_offset_mobile !== `number` ||
        typeof row?.height_ratio_desktop !== `string` ||
        typeof row?.height_ratio_tablet !== `string` ||
        typeof row?.height_ratio_mobile !== `string`
      ) {
        return null;
      }

      let optionsPayload: PaneDesignOptionsPayload;
      try {
        optionsPayload = JSON.parse(row.options_payload);
      } catch (error) {
        return null;
      }
      const codeHook = optionsPayload?.codeHook?.target ?? null;
      const fragments = await Promise.all(
        (optionsPayload.paneFragmentsPayload || []).map(
          async (
            fragment:
              | PaneDesignMarkdown
              | PaneDesignBgPane
              | BgPaneDatum
              | MarkdownPaneDatum
              | BgColourDatum
          ) => {
            if (fragment.type === "markdown") {
              // You can perform async operations here if needed
              return {
                ...fragment,
                markdownBody: row.markdown_body || "",
                optionsPayload: fragment.optionsPayload || {},
              } as PaneDesignMarkdown;
            } else if (fragment.type === "bgPane") {
              // You can perform async operations here if needed
              return {
                ...fragment,
                optionsPayload: fragment.optionsPayload || {},
              } as PaneDesignBgPane;
            } else if (fragment.type === "bgColour") {
              return fragment as BgColourDatum;
            }
            return null;
          }
        )
      );

      const design: PaneDesign = {
        id: row.id,
        name: row.title,
        panePayload: {
          heightOffsetDesktop: row.height_offset_desktop || 0,
          heightOffsetMobile: row.height_offset_mobile || 0,
          heightOffsetTablet: row.height_offset_tablet || 0,
          heightRatioDesktop: row.height_ratio_desktop || "0.00",
          heightRatioMobile: row.height_ratio_mobile || "0.00",
          heightRatioTablet: row.height_ratio_tablet || "0.00",
          codeHook,
          bgColour: false,
        },
        files: thisFiles,
        fragments: fragments.filter(
          (
            fragment
          ): fragment is
            | PaneDesignMarkdown
            | PaneDesignBgPane
            | BgColourDatum => fragment !== null
        ),
      };

      return design;
    })
  );

  return cleanedDesigns.filter(
    (design): design is PaneDesign => design !== null
  );
}
