import { colorValues } from "./tailwindColors";
import { PUBLIC_THEME } from "../constants";
import { tailwindToHex } from "../assets/tailwindColors";

import type {
  Theme,
  PageDesign,
  PaneDesign,
  OptionsPayloadDatum,
} from "../types";

type TailwindColor = (typeof colorValues)[number];
type ThemeColorMap = { [key in Theme]: TailwindColor };

const getComputedColor = (
  colorMap: ThemeColorMap,
  theme: Theme = PUBLIC_THEME
): TailwindColor => {
  return colorMap[theme] || "brand-1";
};

export const buttonStyleOptions = [
  "Plain text inline",
  "Fancy text inline",
  "Fancy button",
];
export const buttonStyleClasses = [
  [
    {
      fontWEIGHT: ["bold"],
      px: ["2"],
      textDECORATION: ["underline"],
      rounded: ["lg"],
      textCOLOR: ["myblue"],
    },
    {
      bgCOLOR: ["myorange"],
    },
  ],
  [
    {
      bgCOLOR: ["mygreen"],
      fontWEIGHT: ["bold"],
      px: ["3.5"],
      py: ["1.5"],
      rounded: ["lg"],
      textCOLOR: ["black"],
    },
    {
      bgCOLOR: ["myorange"],
    },
  ],
  [
    {
      bgCOLOR: ["mygreen"],
      display: ["inline-block"],
      fontWEIGHT: ["bold"],
      px: ["3.5"],
      py: ["2.5"],
      rounded: ["md"],
      textCOLOR: ["black"],
    },
    {
      bgCOLOR: ["myorange"],
      rotate: ["2"],
    },
  ],
];

export const paneDesigns = (theme: Theme = PUBLIC_THEME): PaneDesign[] => [
  {
    id: "introCentered",
    slug: "introCentered",
    name: "Intro section - centered",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: tailwindToHex(
        getComputedColor(
          {
            light: "mywhite",
            "light-bw": "mywhite",
            "light-bold": "myoffwhite",
            dark: "myblack",
            "dark-bw": "myblack",
            "dark-bold": "black",
          },
          theme
        )
      ),
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `## add a catchy title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\nbuttons here\n`,
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
                {
                  mx: ["5", "10"],
                  my: ["20", "32"],
                },
                {
                  maxW: ["none", "screen-lg", "screen-xl"],
                  mx: ["auto"],
                  borderWIDTH: ["2"],
                  rounded: ["md", "lg"],
                  bgCOLOR: ["mywhite"],
                  borderCOLOR: ["slate-200"],
                },
                {
                  px: ["9", "14", "32"],
                  py: ["20", "32"],
                  textALIGN: ["center"],
                  textWRAP: ["balance"],
                },
              ],
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["4xl", "5xl", "6xl"],
                fontFACE: ["action"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            p: {
              classes: {
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["lg", "xl"],
                lineHEIGHT: ["loose"],
                mt: ["4", "5"],
              },
              count: 2,
              override: {
                mt: [null, ["8", "10"]],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "titleText",
    slug: "titleText",
    name: "Page section with title",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: tailwindToHex(
        getComputedColor(
          {
            light: "mywhite",
            "light-bw": "mywhite",
            "light-bold": "myoffwhite",
            dark: "myblack",
            "dark-bw": "myblack",
            "dark-bold": "black",
          },
          theme
        )
      ),
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `## add a section title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n`,
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
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "myblue",
                      "light-bw": "myblack",
                      "light-bold": "myorange",
                      dark: "mygreen",
                      "dark-bw": "myoffwhite",
                      "dark-bold": "myorange",
                    },
                    theme
                  ),
                ],
                textSIZE: ["3xl", "4xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            p: {
              classes: {
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["lg", "xl"],
                my: [3, 4],
                lineHEIGHT: ["loose"],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "farzaTitleText",
    slug: "farzaTitleText",
    name: "Page section with title (readable width)",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `## add a section title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n`,
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
                {
                  maxW: ["sm", "lg"],
                },
              ],
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["3xl", "4xl"],
                my: [8, 12],
                fontFACE: ["action"],
                maxW: ["md", "lg"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
                my: [8, 12],
                fontFACE: ["action"],
                maxW: ["md", "lg"],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
                my: [8, 12],
                fontFACE: ["action"],
                maxW: ["md", "lg"],
              },
            },
            p: {
              classes: {
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["lg", "xl"],
                my: [3, 4],
                maxW: ["md", "lg"],
                lineHEIGHT: ["loose"],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "hero-1",
    slug: "hero-1",
    name: "Hero section",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `1. Catchy and impactful title\n2. sub heading\n`,
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
                {
                  alignITEMS: ["center"],
                  justifyITEMS: ["start"],
                  display: ["flex"],
                },
              ],
            },
            ol: {
              classes: {
                maxW: ["md", "lg"],
              },
            },
            li: {
              classes: {
                fontFACE: ["action"],
                fontWEIGHT: ["normal"],
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["xl", "2xl"],
                my: [6, 8],
              },
              count: 3,
              override: {
                fontWEIGHT: [["bold"]],
                textCOLOR: [["myblue"]],
                textSIZE: [["7xl", "6xl"]],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "aside-with-image",
    slug: "aside-with-image",
    name: "Hero with image",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `1. Catchy and impactful title\n2. sub heading\n\n* ![Descriptive title](filename)\n`,
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
                {
                  alignITEMS: ["center"],
                  display: ["flex"],
                  flexWRAP: ["wrap", "nowrap"],
                  gapX: ["12"],
                  gapY: ["4"],
                },
              ],
            },
            img: {
              classes: {
                aspectRATIO: ["square"],
                bgSIZE: ["cover"],
                rounded: ["lg", "xl"],
                my: [3, 4],
              },
            },
            li: {
              classes: {
                fontFACE: ["action"],
                fontWEIGHT: ["normal"],
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["xl", "2xl"],
                my: [6, 8],
              },
              count: 3,
              override: {
                fontWEIGHT: [["bold"]],
                textCOLOR: [["myblue"]],
                textSIZE: [["7xl", "6xl"]],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "aside-with-image-before",
    slug: "aside-with-image-before",
    name: "Hero with image before",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `* ![Descriptive title](filename)\n\n1. Catchy and impactful title\n2. sub heading\n`,
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
                {
                  alignITEMS: ["center"],
                  display: ["flex"],
                  flexWRAP: ["wrap", "nowrap"],
                  gapX: ["12"],
                  gapY: ["4"],
                },
              ],
            },
            img: {
              classes: {
                aspectRATIO: ["square"],
                bgSIZE: ["cover"],
                rounded: ["lg", "xl"],
                my: [3, 4],
              },
            },
            li: {
              classes: {
                fontFACE: ["action"],
                fontWEIGHT: ["normal"],
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["xl", "2xl"],
                my: [6, 8],
              },
              count: 3,
              override: {
                fontWEIGHT: [undefined, ["bold"]],
                textCOLOR: [undefined, ["myblue"]],
                textSIZE: [undefined, ["7xl", "6xl"]],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "aside-with-image-primary",
    slug: "aside-with-image-primary",
    name: "Hero image with key points",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `* ![Descriptive title](filename)\n\n1. this is a key point, number one\n2. this is a key point, number two\n3. this is a key point, number three\n`,
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
                {
                  alignITEMS: ["center"],
                  justifyITEMS: ["center"],
                  display: ["flex"],
                  flexWRAP: ["wrap", "nowrap"],
                  gapX: ["12"],
                  gapY: ["4"],
                },
              ],
            },
            img: {
              classes: {
                aspectRATIO: ["square"],
                bgSIZE: ["cover"],
                rounded: ["lg", "xl"],
                maxW: ["xs", "sm", "md"],
                my: [3, 4],
              },
            },
            li: {
              classes: {
                fontFACE: ["action"],
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["xl", "2xl"],
                my: [6, 8],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "aside-with-large-text",
    slug: "aside-with-large-text",
    name: "Large text with aside points",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `## Catchy and impactful title goes here\n\n1. this is a key point, number one\n2. this is a key point, number two\n3. this is a key point, number three\n`,
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
                {
                  alignITEMS: ["center"],
                  justifyITEMS: ["center"],
                  display: ["flex"],
                  flexWRAP: ["wrap", "nowrap"],
                  gapX: ["12"],
                  gapY: ["4"],
                },
              ],
            },
            h2: {
              classes: {
                fontFACE: ["action"],
                textCOLOR: ["myblue"],
                textSIZE: ["7xl", "6xl"],
              },
            },
            li: {
              classes: {
                fontFACE: ["action"],
                textCOLOR: ["mydarkgrey"],
                textSIZE: ["xl", "2xl"],
                my: [6, 8],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "text",
    slug: "text",
    name: "Quick text",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `Your story begins here!\n`,
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
                textSIZE: ["3xl", "4xl"],
                my: [8, 12],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
                my: [8, 12],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
                my: [8, 12],
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
  //{
  //  id: "modal",
  //  slug: "modal",
  //  name: "Modal with title",
  //  panePayload: {
  //    heightOffsetDesktop: 0,
  //    heightOffsetTablet: 0,
  //    heightOffsetMobile: 0,
  //    heightRatioDesktop: `15.89`,
  //    heightRatioTablet: `26.00`,
  //    heightRatioMobile: `32.67`,
  //    bgColour: false,
  //    codeHook: null,
  //  },
  //  files: [],
  //  fragments: [
  //    {
  //      type: "markdown",
  //      markdownBody: `## catchy title\n`,
  //      imageMaskShapeDesktop: "none",
  //      imageMaskShapeTablet: "none",
  //      imageMaskShapeMobile: "none",
  //      textShapeOutsideDesktop: "modal1",
  //      textShapeOutsideTablet: "modal1",
  //      textShapeOutsideMobile: "modal2",
  //      isModal: true,
  //      hiddenViewports: "none",
  //      optionsPayload: {
  //        classNamesPayload: {
  //          modal: {
  //            classes: {
  //              fill: ["mywhite"],
  //              strokeCOLOR: ["black"],
  //              strokeSIZE: [2],
  //            },
  //          },
  //          h2: {
  //            classes: {
  //              fontFACE: ["action"],
  //              position: ["relative"],
  //              textCOLOR: ["myblue"],
  //              textSIZE: ["r2xl", "r3xl", "r4xl"],
  //              z: [1],
  //            },
  //          },
  //        },
  //        modal: {
  //          desktop: { zoomFactor: 1.3, paddingLeft: 430, paddingTop: 60 },
  //          mobile: { zoomFactor: 0.8, paddingLeft: 60, paddingTop: 40 },
  //          tablet: { zoomFactor: 1, paddingLeft: 240, paddingTop: 80 },
  //        },
  //      } as OptionsPayloadDatum,
  //    },
  //  ],
  //},
  //{
  //  id: "fancy",
  //  slug: "fancy",
  //  name: "Fancy title section",
  //  panePayload: {
  //    heightOffsetDesktop: 0,
  //    heightOffsetTablet: 0,
  //    heightOffsetMobile: 0,
  //    heightRatioDesktop: `58.39`,
  //    heightRatioTablet: `92.22`,
  //    heightRatioMobile: `120.83`,
  //    bgColour: false,
  //    codeHook: null,
  //  },
  //  files: [],
  //  fragments: [
  //    {
  //      type: "markdown",
  //      markdownBody: `## fancy title\n\n...\n`,
  //      textShapeOutsideDesktop: "comic1920r3main1inner",
  //      textShapeOutsideTablet: "comic1080r3inner",
  //      textShapeOutsideMobile: "comic600r3inner",
  //      imageMaskShapeDesktop: "none",
  //      imageMaskShapeTablet: "none",
  //      imageMaskShapeMobile: "none",
  //      isModal: false,
  //      hiddenViewports: "none",
  //      optionsPayload: {
  //        classNamesPayload: {
  //          h2: {
  //            classes: {
  //              fontFACE: ["action"],
  //              rotate: ["!2"],
  //              textCOLOR: ["myblue"],
  //              textSIZE: ["r6xl", "r7xl", "r8xl"],
  //              z: [1],
  //              position: ["relative"],
  //            },
  //          },
  //          p: {
  //            classes: {
  //              textCOLOR: ["mydarkgrey"],
  //              textSIZE: ["r4xl", "r5xl", "r6xl"],
  //              mt: ["r12"],
  //              rotate: ["!1"],
  //              z: [1],
  //              position: ["relative"],
  //            },
  //          },
  //        },
  //      } as OptionsPayloadDatum,
  //    },
  //    {
  //      type: "bgPane",
  //      shapeMobile: "comic600r3",
  //      shapeTablet: "comic1080r3",
  //      shapeDesktop: "comic1920r3main1",
  //      hiddenViewports: "",
  //      optionsPayload: {
  //        classNamesPayload: {
  //          parent: {
  //            classes: [
  //              {
  //                fill: ["slate-100"],
  //                strokeCOLOR: ["mydarkgrey"],
  //                strokeSIZE: [2, 3, 4],
  //              },
  //            ],
  //          },
  //        },
  //      } as OptionsPayloadDatum,
  //    },
  //    {
  //      type: "bgPane",
  //      shapeMobile: "none",
  //      shapeTablet: "none",
  //      shapeDesktop: "comic1920r3main2",
  //      hiddenViewports: "mobile,tablet",
  //      optionsPayload: {
  //        classNamesPayload: {},
  //        artpack: {
  //          all: {
  //            image: "nightcity",
  //            collection: "kCz",
  //            filetype: "png",
  //            mode: "mask",
  //            objectFit: "cover",
  //          },
  //        },
  //      } as OptionsPayloadDatum,
  //    },
  //  ],
  //},
  {
    id: "borderedText",
    slug: "borderedText",
    name: "Bordered paragraphs",
    type: `starter`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
    fragments: [
      {
        type: "markdown",
        markdownBody: `Your story begins here!\n`,
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
                textSIZE: ["3xl", "4xl"],
                my: [8, 12],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "3xl"],
                my: [8, 12],
              },
            },
            h4: {
              classes: {
                textCOLOR: ["myblue"],
                textSIZE: ["xl", "2xl"],
                my: [8, 12],
              },
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks1",
    slug: "breaks1",
    name: "Stepped from above",
    orientation: `above`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "steppedwide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks2",
    slug: "breaks2",
    name: "Cut 1 into below",
    orientation: `below`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "cut1wide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "cut1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "cut1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks3",
    slug: "breaks3",
    name: "Cut 2 into below",
    orientation: `below`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "cut2wide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "cut2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "cut2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks4",
    slug: "breaks4",
    name: "Low Cut 1 into below",
    orientation: `below`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "lowcut1wide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "lowcut1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "lowcut1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks5",
    slug: "breaks5",
    name: "Low Cut 2 into below",
    orientation: `below`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "lowcut2wide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "lowcut2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "lowcut2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks6",
    slug: "breaks6",
    name: "Jag from above",
    orientation: `above`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "jagwide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "jag",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "jag",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks7",
    slug: "breaks7",
    name: "Burst 1 from above",
    orientation: `above`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "burstwide1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "burst1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "burst1",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks8",
    slug: "breaks8",
    name: "Burst 2 from above",
    orientation: `above`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "burstwide2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "burst2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "burst2",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks9",
    slug: "breaks9",
    name: "Crooked from above",
    orientation: `above`,
    type: `break`,
    panePayload: {
      heightOffsetDesktop: 0,
      heightOffsetTablet: 0,
      heightOffsetMobile: 0,
      heightRatioDesktop: `0.00`,
      heightRatioTablet: `0.00`,
      heightRatioMobile: `0.00`,
      bgColour: false,
      codeHook: null,
    },
    files: [],
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
              image: "crookedwide",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "crooked",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "crooked",
              mode: "break",
              svgFill: "#10120d",
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
];

export const pageDesigns = (
  theme: Theme = PUBLIC_THEME
): Record<string, PageDesign> => ({
  basic: {
    name: "Basic Page",
    isContext: true,
    tailwindBgColour: getComputedColor(
      {
        light: "mywhite",
        "light-bw": "mywhite",
        "light-bold": "myoffwhite",
        dark: "myblack",
        "dark-bw": "myblack",
        "dark-bold": "black",
      },
      theme
    ),
    paneDesigns: [
      paneDesigns(theme).find(p => p.id === "introCentered") as PaneDesign,
    ],
  },
  landing: {
    name: "Landing Page",
    isContext: false,
    tailwindBgColour: getComputedColor(
      {
        light: "mywhite",
        "light-bw": "mywhite",
        "light-bold": "myoffwhite",
        dark: "myblack",
        "dark-bw": "myblack",
        "dark-bold": "black",
      },
      theme
    ),
    paneDesigns: [
      paneDesigns(theme).find(p => p.id === "hero-1") as PaneDesign,
      paneDesigns(theme).find(p => p.id === "titleText") as PaneDesign,
    ],
  },
  // ... other page designs
});
