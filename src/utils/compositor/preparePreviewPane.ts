import { ulid } from "ulid";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { cleanHtmlAst } from "../../utils/compositor/markdownUtils";
import type { Root } from "hast";
import type {
  PaneDatum,
  BgPaneDatum,
  MarkdownPaneDatum,
  MarkdownDatum,
  BgColourDatum,
  PaneDesign,
  PaneDesignMarkdown,
  PaneDesignBgPane,
} from "../../types";

const preparePreviewPane = (design: PaneDesign) => {
  const paneId = ulid();
  let markdown: MarkdownDatum | undefined;
  const paneFragments = design.fragments
    .map(
      (
        f: PaneDesignBgPane | PaneDesignMarkdown
      ): BgColourDatum | BgPaneDatum | MarkdownPaneDatum | null => {
        if (f.type === "bgPane") {
          const v = f as PaneDesignBgPane;
          return {
            type: "bgPane",
            hiddenViewports: v.hiddenViewports,
            shapeDesktop: v.shapeDesktop,
            shapeTablet: v.shapeTablet,
            shapeMobile: v.shapeMobile,
            optionsPayload: v.optionsPayload,
          } as BgPaneDatum;
        } else if (f.type === "markdown") {
          const v = f as PaneDesignMarkdown;
          markdown = {
            body: v.markdownBody,
            id: ulid(),
            slug: `new-markdown`,
            title: `Copy for new pane`,
            htmlAst: cleanHtmlAst(
              toHast(fromMarkdown(v.markdownBody)) as Root
            ) as Root,
          };
          return {
            type: "markdown",
            hiddenViewports: v.hiddenViewports,
            isModal: v.isModal,
            imageMaskShapeDesktop: v.imageMaskShapeDesktop,
            imageMaskShapeTablet: v.imageMaskShapeTablet,
            imageMaskShapeMobile: v.imageMaskShapeMobile,
            textShapeOutsideDesktop: v.textShapeOutsideDesktop,
            textShapeOutsideTablet: v.textShapeOutsideTablet,
            textShapeOutsideMobile: v.textShapeOutsideMobile,
            optionsPayload: v.optionsPayload,
          } as MarkdownPaneDatum;
        }
        return null;
      }
    )
    .filter(
      (f): f is BgColourDatum | BgPaneDatum | MarkdownPaneDatum => f !== null
    );

  if (design.panePayload.bgColour) {
    const bgColourFragment: BgColourDatum = {
      id: ulid(),
      type: "bgColour",
      bgColour: design.panePayload.bgColour as string,
      hiddenViewports: "",
    };
    paneFragments.unshift(bgColourFragment);
  }

  const paneData: PaneDatum = {
    id: paneId,
    title: "Preview Pane",
    slug: "preview-pane",
    created: new Date(),
    changed: null,
    markdown: markdown || false,
    optionsPayload: {
      paneFragmentsPayload: paneFragments,
    },
    isContextPane: false,
    heightOffsetDesktop: design.panePayload.heightOffsetDesktop,
    heightOffsetMobile: design.panePayload.heightOffsetMobile,
    heightOffsetTablet: design.panePayload.heightOffsetTablet,
    heightRatioDesktop: design.panePayload.heightRatioDesktop,
    heightRatioMobile: design.panePayload.heightRatioMobile,
    heightRatioTablet: design.panePayload.heightRatioTablet,
    files: [],
  };

  return paneData;
};

export default preparePreviewPane;
