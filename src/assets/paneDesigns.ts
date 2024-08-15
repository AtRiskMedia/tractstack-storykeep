//import { ulid } from "ulid";
//import type { Root } from "hast";
import type {
  PaneDesign,
  //  MarkdownEditDatum,
  //  BgPaneDatum,
  //  BgColourDatum,
  OptionsPayloadDatum,
} from "../types";

export const paneDesigns: PaneDesign[] = [
  {
    id: "titleText",
    name: "Title with paragraph",
    description: "Standard fare; heading and paragraph styles",
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
    },
    fragments: [
      {
        type: "markdown",
        markdownBody: `## title\n\n...\n`,
        imageMaskShapeDesktop: "none",
        imageMaskShapeTablet: "none",
        imageMaskShapeMobile: "none",
        textShapeOutsideDesktop: "none",
        textShapeOutsideTablet: "none",
        textShapeOutsideMobile: "none",
        isModal: false,
        hiddenViewports: "none",
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
                textCOLOR: ["myblue"],
                textSIZE: ["3xl", "5xl"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
              },
            },
            p: {
              classes: {
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["lg", "xl"],
                my: [3, 4],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "text",
    name: "Paragraphs",
    description: "Standard fare; heading and paragraph styles",
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
    },
    fragments: [
      {
        type: "markdown",
        markdownBody: `...\n`,
        imageMaskShapeDesktop: "none",
        imageMaskShapeTablet: "none",
        imageMaskShapeMobile: "none",
        textShapeOutsideDesktop: "none",
        textShapeOutsideTablet: "none",
        textShapeOutsideMobile: "none",
        isModal: false,
        hiddenViewports: "none",
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
                textCOLOR: ["myblue"],
                textSIZE: ["3xl", "5xl"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
              },
            },
            p: {
              classes: {
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["lg", "xl"],
                my: [3, 4],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "modal",
    name: "Modal with title",
    description: "Pick a modal; includes heading 2 styles",
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `15.89`,
      heightRatioTablet: `26.00`,
      heightRatioMobile: `32.67`,
      bgColour: false,
    },
    fragments: [
      {
        type: "markdown",
        markdownBody: `## catchy title\n`,
        imageMaskShapeDesktop: "modal1",
        imageMaskShapeTablet: "modal1",
        imageMaskShapeMobile: "modal2",
        textShapeOutsideDesktop: "none",
        textShapeOutsideTablet: "none",
        textShapeOutsideMobile: "none",
        isModal: true,
        hiddenViewports: "none",
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
    ],
  },
  {
    id: "fancy",
    name: "Fancy title section",
    description: "The works *includes shapes and heading 2 + paragraph styles",
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `58.39`,
      heightRatioTablet: `92.22`,
      heightRatioMobile: `120.83`,
      bgColour: false,
    },
    fragments: [
      {
        type: "markdown",
        markdownBody: `## fancy title\n\n...\n`,
        textShapeOutsideDesktop: "comic1920r3main1inner",
        textShapeOutsideTablet: "comic1080r3inner",
        textShapeOutsideMobile: "comic600r3inner",
        imageMaskShapeDesktop: "none",
        imageMaskShapeTablet: "none",
        imageMaskShapeMobile: "none",
        isModal: false,
        hiddenViewports: "none",
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
      {
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
      },
      {
        type: "bgPane",
        shapeMobile: "none",
        shapeTablet: "none",
        shapeDesktop: "comic1920r3main2",
        hiddenViewports: "mobile,tablet",
        optionsPayload: {
          classNamesPayload: {},
          artpack: {
            all: {
              image: "nightcity",
              collection: "kCz",
              filetype: "png",
              mode: "mask",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "borderedText",
    name: "Bordered paragraphs",
    description: "Includes parent and paragraph styles",
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
    },
    fragments: [
      {
        type: "markdown",
        markdownBody: `...\n`,
        imageMaskShapeDesktop: "none",
        imageMaskShapeTablet: "none",
        imageMaskShapeMobile: "none",
        textShapeOutsideDesktop: "none",
        textShapeOutsideTablet: "none",
        textShapeOutsideMobile: "none",
        isModal: false,
        hiddenViewports: "none",
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
                my: [3, 4],
              },
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["3xl", "5xl"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks",
    name: "Transition Shape",
    description: "Add some personality...",
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: `#10120d`,
    },
    fragments: [
      {
        type: "bgPane",
        shapeMobile: "none",
        shapeTablet: "none",
        shapeDesktop: "none",
        hiddenViewports: "none",
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
      },
    ],
  },
];
