import type { Row } from "@libsql/client";
import type {
  PaneDesign,
  PaneDesignMarkdown,
  PaneDesignBgPane,
  BgColourDatum,
  MarkdownPaneDatum,
  BgPaneDatum,
  PaneDesignOptionsPayload,
} from "../../types";

export function cleanPaneDesigns(rows: Row[]): PaneDesign[] {
  if (!rows || rows.length === 0) {
    return [];
  }

  const cleanedDesigns = rows
    .map((row: Row): PaneDesign | null => {
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
      const fragments: (
        | PaneDesignMarkdown
        | PaneDesignBgPane
        | BgColourDatum
      )[] = (optionsPayload.paneFragmentsPayload || [])
        .map(
          (
            fragment:
              | PaneDesignMarkdown
              | PaneDesignBgPane
              | BgPaneDatum
              | MarkdownPaneDatum
              | BgColourDatum
          ) => {
            if (fragment.type === "markdown") {
              return {
                ...fragment,
                markdownBody: row.markdown_body || "",
                optionsPayload: fragment.optionsPayload || {},
              } as PaneDesignMarkdown;
            } else if (fragment.type === "bgPane") {
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
        .filter(
          (
            fragment
          ): fragment is
            | PaneDesignMarkdown
            | PaneDesignBgPane
            | BgColourDatum => fragment !== null
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
        fragments: fragments,
      };

      return design;
    })
    .filter((design): design is PaneDesign => design !== null);

  return cleanedDesigns;
}
