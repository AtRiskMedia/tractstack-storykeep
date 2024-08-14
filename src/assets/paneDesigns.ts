import { ulid } from "ulid";
import type { Root } from "hast";
import type {
  PaneDesign,
  MarkdownEditDatum,
  BgPaneDatum,
  BgColourDatum,
  OptionsPayloadDatum,
} from "../types";

export const paneDesigns: PaneDesign[] = [
  {
    id: "titleText",
    name: "Title with paragraph",
    description: "Includes heading 2 and paragraph styles",
    payload: {
      markdown: {
        markdown: {
          body: "## title\n...\n",
          id: ulid(),
          slug: "title-with-paragraph",
          title: "Title with paragraph",
          htmlAst: { type: "root", children: [] } as Root,
        },
        payload: {
          id: ulid(),
          type: "markdown",
          imageMaskShape: "none",
          textShapeOutside: "none",
          isModal: false,
          hiddenViewports: "",
          optionsPayload: {
            classNamesPayload: {
              parent: {
                classes: [
                  { my: [12, 16] },
                  { maxW: ["2xl", "3xl"], mx: ["auto"], px: [8] },
                ],
              },
              h2: {
                classes: {
                  fontSTYLE: ["bold"],
                  rotate: ["!1"],
                  textCOLOR: ["myblue"],
                  textSIZE: ["3xl", "5xl"],
                },
              },
              p: {
                classes: {
                  textCOLOR: ["mydarkgrey"],
                  textSIZE: ["lg", "xl"],
                  my: [3],
                },
              },
            },
          } as OptionsPayloadDatum,
        },
        type: "markdown",
      } as MarkdownEditDatum,
    },
  },
  {
    id: "text",
    name: "Paragraphs",
    description: "Includes paragraph styles only",
    payload: {
      markdown: {
        markdown: {
          body: "...\n",
          id: ulid(),
          slug: "paragraphs",
          title: "Paragraphs",
          htmlAst: { type: "root", children: [] } as Root,
        },
        payload: {
          id: ulid(),
          type: "markdown",
          imageMaskShape: "none",
          textShapeOutside: "none",
          isModal: false,
          hiddenViewports: "",
          optionsPayload: {
            classNamesPayload: {
              parent: {
                classes: [
                  { my: [12, 16] },
                  { maxW: ["2xl", "3xl"], mx: ["auto"], px: [8] },
                ],
              },
              p: {
                classes: {
                  textCOLOR: ["mydarkgrey"],
                  textSIZE: ["lg", "xl"],
                  my: [3],
                },
              },
            },
          } as OptionsPayloadDatum,
        },
        type: "markdown",
      } as MarkdownEditDatum,
    },
  },
  {
    id: "modal",
    name: "Modal with title",
    description: "Pick a modal; includes heading 2 styles",
    payload: {
      markdown: {
        markdown: {
          body: "## catchy title\n",
          id: ulid(),
          slug: "modal-with-title",
          title: "Modal with title",
          htmlAst: { type: "root", children: [] } as Root,
        },
        payload: {
          id: ulid(),
          type: "markdown",
          imageMaskShape: "none",
          textShapeOutside: "modal2",
          isModal: true,
          hiddenViewports: "",
          optionsPayload: {
            classNamesPayload: {
              modal: {
                classes: {
                  0: {
                    fill: ["mywhite"],
                    strokeCOLOR: ["black"],
                    strokeSIZE: [2],
                  },
                },
              },
              h2: {
                classes: {
                  fontFACE: ["action"],
                  relative: [true],
                  textCOLOR: ["myblue"],
                  textSIZE: ["r2xl", "r3xl", "r4xl"],
                  z: [1],
                },
              },
            },
            modal: {
              desktop: { zoomFactor: 1.3, paddingLeft: 430, paddingTop: 60 },
              mobile: { zoomFactor: 0.8, paddingLeft: 60, paddingTop: 40 },
              tablet: { zoomFactor: 1, paddingLeft: 240, paddingTop: 80 },
            },
          } as OptionsPayloadDatum,
        },
        type: "markdown",
      } as MarkdownEditDatum,
    },
  },
  {
    id: "fancy",
    name: "Fancy title section",
    description: "The works; includes shapes and heading 2 + paragraph styles",
    payload: {
      markdown: {
        markdown: {
          body: "## fancy title\n...\n",
          id: ulid(),
          slug: "fancy-title-section",
          title: "Fancy title section",
          htmlAst: { type: "root", children: [] } as Root,
        },
        payload: {
          id: ulid(),
          type: "markdown",
          imageMaskShape: "none",
          textShapeOutside: "comic1920r3main1inner",
          isModal: false,
          hiddenViewports: "",
          optionsPayload: {
            classNamesPayload: {
              h2: {
                classes: {
                  fontFACE: ["action"],
                  rotate: ["!2"],
                  textCOLOR: ["myblue"],
                  textSIZE: ["r6xl", "r7xl", "r8xl"],
                  z: [1],
                  relative: [true],
                },
              },
              p: {
                classes: {
                  textCOLOR: ["mydarkgrey"],
                  textSIZE: ["r4xl", "r5xl", "r6xl"],
                  mt: ["r12"],
                  rotate: ["!1"],
                  z: [1],
                  relative: [true],
                },
              },
            },
          } as OptionsPayloadDatum,
        },
        type: "markdown",
      } as MarkdownEditDatum,
      bgPane: {
        id: ulid(),
        type: "bgPane",
        shapeMobile: "comic600r3",
        shapeTablet: "comic1080r3",
        shapeDesktop: "comic1920r3main1",
        hiddenViewports: "",
        optionsPayload: {
          classNamesPayload: {
            parent: {
              classes: [
                {
                  fill: ["slate-100"],
                  strokeCOLOR: ["mydarkgrey"],
                  strokeSIZE: [2, 3, 4],
                },
              ],
            },
          },
        } as OptionsPayloadDatum,
      } as BgPaneDatum,
    },
  },
  {
    id: "borderedText",
    name: "Bordered paragraphs",
    description: "Includes parent and paragraph styles",
    payload: {
      markdown: {
        markdown: {
          body: "...\n",
          id: ulid(),
          slug: "bordered-paragraphs",
          title: "Bordered paragraphs",
          htmlAst: { type: "root", children: [] } as Root,
        },
        payload: {
          id: ulid(),
          type: "markdown",
          imageMaskShape: "none",
          textShapeOutside: "none",
          isModal: false,
          hiddenViewports: "",
          optionsPayload: {
            classNamesPayload: {
              parent: {
                classes: [
                  { my: [12, 16], px: [12] },
                  {
                    bgCOLOR: ["slate-50"],
                    border: [true],
                    borderCOLOR: ["mylightgrey"],
                    borderSTROKE: [2],
                    borderSTYLE: ["dashed"],
                    maxW: ["none", "3xl"],
                    mx: ["auto"],
                  },
                  { maxW: ["none", "2xl"], mx: ["auto"], p: [8] },
                ],
              },
              p: {
                classes: {
                  textCOLOR: ["mydarkgrey"],
                  textSIZE: ["lg", "xl"],
                  my: [3],
                },
              },
            },
          } as OptionsPayloadDatum,
        },
        type: "markdown",
      } as MarkdownEditDatum,
    },
  },
  {
    id: "breaks",
    name: "Transition Shape",
    description: "Add some personality...",
    payload: {
      markdown: {
        markdown: {
          body: "",
          id: ulid(),
          slug: "transition-shape",
          title: "Transition Shape",
          htmlAst: { type: "root", children: [] } as Root,
        },
        payload: {
          id: ulid(),
          type: "markdown",
          imageMaskShape: "none",
          textShapeOutside: "none",
          isModal: false,
          hiddenViewports: "",
          optionsPayload: {
            classNamesPayload: {},
          } as OptionsPayloadDatum,
        },
        type: "markdown",
      } as MarkdownEditDatum,
      bgPane: {
        id: ulid(),
        type: "bgPane",
        shapeMobile: "none",
        shapeTablet: "none",
        shapeDesktop: "none",
        hiddenViewports: "",
        optionsPayload: {
          classNamesPayload: {},
          artpack: {
            desktop: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: "#c8df8c",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: "#c8df8c",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: "#c8df8c",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      } as BgPaneDatum,
      bgColour: {
        id: ulid(),
        type: "bgColour",
        bgColour: "#000000",
        hiddenViewports: "",
      } as BgColourDatum,
    },
  },
];
