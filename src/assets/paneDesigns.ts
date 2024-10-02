import { colorValues } from "./tailwindColors";
import { PUBLIC_THEME } from "../constants";
import { tailwindToHex } from "../assets/tailwindColors";

import type {
  Theme,
  Variant,
  PageDesign,
  PaneDesign,
  OptionsPayloadDatum,
} from "../types";

type TailwindColor = (typeof colorValues)[number];
type ThemeColorMap = { [key in Theme]: TailwindColor };
type ComputedValueMap = { [key in Variant]: string };
type ComputedValueNumericMap = { [key in Variant]: number };

const getComputedColor = (
  colorMap: ThemeColorMap,
  theme: Theme = PUBLIC_THEME
): TailwindColor => {
  return colorMap[theme] || "brand-1";
};

export const getComputedValue = (
  valueMap: ComputedValueMap,
  variant: Variant = "default"
): string => {
  return valueMap[variant] ?? valueMap["default"] ?? "";
};
export const getComputedNumber = (
  valueMap: ComputedValueNumericMap,
  variant: Variant = "default"
): number => {
  return valueMap[variant] ?? valueMap["default"] ?? 0;
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

export const paneDesigns = (
  theme: Theme = PUBLIC_THEME,
  variant: Variant = `default`
): PaneDesign[] => [
  {
    id: `intro-${variant}`,
    slug: `intro-${variant}`,
    name: getComputedValue(
      {
        default: "Intro section",
        center: "Intro section - centered",
        onecolumn: "Intro section - one column",
      },
      variant
    ),
    priority: getComputedNumber(
      {
        default: 0,
        onecolumn: 1,
        center: 2,
      },
      variant
    ),
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
        markdownBody: `## add a catchy title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n[Try it now!](try) &nbsp; [Learn more](learn)\n`,
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
                  mt: ["20", "32"],
                  mb: ["16", "20"],
                },
                {
                  maxW: ["none", "screen-lg", "screen-xl"],
                  mx: ["auto"],
                  borderWIDTH: ["2"],
                  rounded: ["md", "lg"],
                  bgCOLOR: [
                    getComputedColor(
                      {
                        light: "brand-2",
                        "light-bw": "white",
                        "light-bold": "brand-2",
                        dark: "brand-1",
                        "dark-bw": "black",
                        "dark-bold": "brand-1",
                      },
                      theme
                    ),
                  ],
                  borderCOLOR: [
                    getComputedColor(
                      {
                        light: "neutral-200",
                        "light-bw": "gray-200",
                        "light-bold": "brand-6",
                        dark: "neutral-800",
                        "dark-bw": "gray-800",
                        "dark-bold": "neutral-800",
                      },
                      theme
                    ),
                  ],
                },
                {
                  px: ["9", "14", "32"],
                  py: ["20", "32"],
                  textALIGN: [
                    getComputedValue(
                      { default: "left", center: "center", onecolumn: "left" },
                      variant
                    ),
                  ],
                  textWRAP: [
                    getComputedValue(
                      {
                        default: "pretty",
                        center: "balance",
                        onecolumn: "pretty",
                      },
                      variant
                    ),
                  ],
                  maxW: [
                    getComputedValue(
                      {
                        default: "none",
                        center: "none",
                        onecolumn: "3xl",
                      },
                      variant
                    ),
                  ],
                },
              ],
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["5xl", "6xl", "7xl"],
                fontFACE: ["action"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "3xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            h4: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "2xl"],
                my: [8, 12],
                fontFACE: ["action"],
              },
            },
            p: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-7",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-8",
                    },
                    theme
                  ),
                ],
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
          buttons: {
            try: {
              callbackPayload: "(goto (home))",
              urlTarget: "#",
              classNamesPayload: {
                button: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-7",
                          "light-bw": "black",
                          "light-bold": "brand-3",
                          dark: "slate-200",
                          "dark-bw": "white",
                          "dark-bold": "brand-3",
                        },
                        theme
                      ),
                    ],
                    display: ["inline-block"],
                    fontWEIGHT: ["bold"],
                    px: ["3.5"],
                    py: ["2.5"],
                    rounded: ["md"],
                    textCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-2",
                          "light-bw": "white",
                          "light-bold": "brand-2",
                          dark: "black",
                          "dark-bw": "black",
                          "dark-bold": "brand-1",
                        },
                        theme
                      ),
                    ],
                  },
                },
                hover: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                    rotate: ["2"],
                  },
                },
              },
              className:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              mobileClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              tabletClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              desktopClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
            },
            learn: {
              callbackPayload: "(goto (home))",
              urlTarget: "#",
              classNamesPayload: {
                button: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "neutral-200",
                          "light-bw": "brand-8",
                          "light-bold": "neutral-200",
                          dark: "neutral-800",
                          "dark-bw": "gray-800",
                          "dark-bold": "neutral-800",
                        },
                        theme
                      ),
                    ],
                    display: ["inline-block"],
                    px: ["3.5"],
                    py: ["2.5"],
                    rounded: ["md"],
                    textCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                  },
                },
                hover: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                    rotate: ["2"],
                  },
                },
              },
              className:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              mobileClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              tabletClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              desktopClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: `intro-slim-${variant}`,
    slug: `intro-slim-${variant}`,
    name: getComputedValue(
      {
        default: "Intro section - slim",
        center: "Intro section - slim, centered",
        onecolumn: "Intro section - slim, one column",
      },
      variant
    ),
    priority: getComputedNumber(
      {
        default: 3,
        onecolumn: 4,
        center: 5,
      },
      variant
    ),
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
        markdownBody: `## add a catchy title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n[Try it now!](try) &nbsp; [Learn more](learn)\n`,
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
                  my: ["3.5", "8"],
                },
                {
                  maxW: ["none", "screen-lg", "screen-xl"],
                  mx: ["auto"],
                },
                {
                  px: ["9", "14", "32"],
                  py: ["10"],
                  textALIGN: [
                    getComputedValue(
                      { default: "left", center: "center", onecolumn: "left" },
                      variant
                    ),
                  ],
                  textWRAP: [
                    getComputedValue(
                      {
                        default: "pretty",
                        center: "balance",
                        onecolumn: "pretty",
                      },
                      variant
                    ),
                  ],
                  maxW: [
                    getComputedValue(
                      {
                        default: "none",
                        center: "none",
                        onecolumn: "3xl",
                      },
                      variant
                    ),
                  ],
                },
              ],
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["4xl", "5xl", "6xl"],
                fontFACE: ["action"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "3xl"],
                fontFACE: ["action"],
              },
            },
            h4: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "2xl"],
                fontFACE: ["action"],
              },
            },
            p: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-7",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-8",
                    },
                    theme
                  ),
                ],
                textSIZE: ["lg", "xl"],
                lineHEIGHT: ["snug"],
                mt: ["2.5", "3.5"],
              },
              count: 2,
              override: {
                mt: [null, ["4", "6"]],
              },
            },
          },
          buttons: {
            try: {
              callbackPayload: "(goto (home))",
              urlTarget: "#",
              classNamesPayload: {
                button: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-7",
                          "light-bw": "black",
                          "light-bold": "brand-3",
                          dark: "slate-200",
                          "dark-bw": "white",
                          "dark-bold": "brand-3",
                        },
                        theme
                      ),
                    ],
                    display: ["inline-block"],
                    fontWEIGHT: ["bold"],
                    px: ["3.5"],
                    py: ["2.5"],
                    rounded: ["md"],
                    textCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-2",
                          "light-bw": "white",
                          "light-bold": "brand-2",
                          dark: "black",
                          "dark-bw": "black",
                          "dark-bold": "brand-1",
                        },
                        theme
                      ),
                    ],
                  },
                },
                hover: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                    rotate: ["2"],
                  },
                },
              },
              className:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              mobileClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              tabletClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              desktopClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
            },
            learn: {
              callbackPayload: "(goto (home))",
              urlTarget: "#",
              classNamesPayload: {
                button: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "neutral-200",
                          "light-bw": "brand-8",
                          "light-bold": "neutral-200",
                          dark: "neutral-800",
                          "dark-bw": "gray-800",
                          "dark-bold": "neutral-800",
                        },
                        theme
                      ),
                    ],
                    display: ["inline-block"],
                    px: ["3.5"],
                    py: ["2.5"],
                    rounded: ["md"],
                    textCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                  },
                },
                hover: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                    rotate: ["2"],
                  },
                },
              },
              className:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              mobileClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              tabletClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              desktopClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: `intro-slim-bordered-${variant}`,
    slug: `intro-slim-bordered-${variant}`,
    name: getComputedValue(
      {
        default: "Intro section - slim with border",
        center: "Intro section - slim with border, centered",
        onecolumn: "Intro section - slim with border, one column",
      },
      variant
    ),
    priority: getComputedNumber(
      {
        default: 6,
        onecolumn: 7,
        center: 8,
      },
      variant
    ),
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
        markdownBody: `## add a catchy title here\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n[Try it now!](try) &nbsp; [Learn more](learn)\n`,
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
                  m: ["5", "10"],
                },
                {
                  maxW: ["none", "screen-lg", "screen-xl"],
                  mx: ["auto"],
                  borderWIDTH: ["2"],
                  rounded: ["md", "lg"],
                  bgCOLOR: [
                    getComputedColor(
                      {
                        light: "brand-2",
                        "light-bw": "white",
                        "light-bold": "brand-2",
                        dark: "brand-1",
                        "dark-bw": "black",
                        "dark-bold": "brand-1",
                      },
                      theme
                    ),
                  ],
                  borderCOLOR: [
                    getComputedColor(
                      {
                        light: "neutral-200",
                        "light-bw": "gray-200",
                        "light-bold": "brand-6",
                        dark: "neutral-800",
                        "dark-bw": "gray-800",
                        "dark-bold": "neutral-800",
                      },
                      theme
                    ),
                  ],
                },
                {
                  px: ["9", "14", "32"],
                  pt: ["12"],
                  pb: ["10"],
                  textALIGN: [
                    getComputedValue(
                      { default: "left", center: "center", onecolumn: "left" },
                      variant
                    ),
                  ],
                  textWRAP: [
                    getComputedValue(
                      {
                        default: "pretty",
                        center: "balance",
                        onecolumn: "pretty",
                      },
                      variant
                    ),
                  ],
                  maxW: [
                    getComputedValue(
                      {
                        default: "none",
                        center: "none",
                        onecolumn: "3xl",
                      },
                      variant
                    ),
                  ],
                },
              ],
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["4xl", "5xl", "6xl"],
                fontFACE: ["action"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "3xl"],
                fontFACE: ["action"],
              },
            },
            h4: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "2xl"],
                fontFACE: ["action"],
              },
            },
            p: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-7",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-8",
                    },
                    theme
                  ),
                ],
                textSIZE: ["lg", "xl"],
                lineHEIGHT: ["snug"],
                mt: ["2.5", "3.5"],
              },
              count: 2,
              override: {
                mt: [null, ["4", "6"]],
              },
            },
          },
          buttons: {
            try: {
              callbackPayload: "(goto (home))",
              urlTarget: "#",
              classNamesPayload: {
                button: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-7",
                          "light-bw": "black",
                          "light-bold": "brand-3",
                          dark: "slate-200",
                          "dark-bw": "white",
                          "dark-bold": "brand-3",
                        },
                        theme
                      ),
                    ],
                    display: ["inline-block"],
                    fontWEIGHT: ["bold"],
                    px: ["3.5"],
                    py: ["2.5"],
                    rounded: ["md"],
                    textCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-2",
                          "light-bw": "white",
                          "light-bold": "brand-2",
                          dark: "black",
                          "dark-bw": "black",
                          "dark-bold": "brand-1",
                        },
                        theme
                      ),
                    ],
                  },
                },
                hover: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                    rotate: ["2"],
                  },
                },
              },
              className:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              mobileClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              tabletClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
              desktopClassName:
                "bg-mydarkgrey inline-block font-bold px-3.5 py-2.5 rounded-md text-mywhite hover:bg-myorange hover:rotate-2",
            },
            learn: {
              callbackPayload: "(goto (home))",
              urlTarget: "#",
              classNamesPayload: {
                button: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "neutral-200",
                          "light-bw": "brand-8",
                          "light-bold": "neutral-200",
                          dark: "neutral-800",
                          "dark-bw": "gray-800",
                          "dark-bold": "neutral-800",
                        },
                        theme
                      ),
                    ],
                    display: ["inline-block"],
                    px: ["3.5"],
                    py: ["2.5"],
                    rounded: ["md"],
                    textCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                  },
                },
                hover: {
                  classes: {
                    bgCOLOR: [
                      getComputedColor(
                        {
                          light: "brand-1",
                          "light-bw": "black",
                          "light-bold": "brand-1",
                          dark: "brand-2",
                          "dark-bw": "white",
                          "dark-bold": "brand-2",
                        },
                        theme
                      ),
                    ],
                    rotate: ["2"],
                  },
                },
              },
              className:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              mobileClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              tabletClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
              desktopClassName:
                "bg-slate-200 inline-block px-3.5 py-2.5 rounded-md text-black hover:bg-myorange hover:rotate-2",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: `paragraph-${variant}`,
    slug: `paragraph-${variant}`,
    name: getComputedValue(
      {
        default: "Paragraph section",
        center: "Paragraph section - centered",
        onecolumn: "Paragraph section - one column",
      },
      variant
    ),
    priority: getComputedNumber(
      {
        default: 10,
        onecolumn: 11,
        center: 12,
      },
      variant
    ),
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
            light: "brand-2",
            "light-bw": "white",
            "light-bold": "brand-2",
            dark: "black",
            "dark-bw": "black",
            "dark-bold": "brand-1",
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
        markdownBody: `### tell us what happened\n\nyour story continues... and continues... and continues... and continues... and continues... and continues... with nice layout and typography.\n\n#### Add in those important details\n\nWrite for both the humans and for the search engine rankings!`,
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
                  mb: ["16", "20"],
                },
                {
                  maxW: ["none", "screen-lg", "screen-xl"],
                  mx: ["auto"],
                },
                {
                  px: ["9", "14", "32"],
                  pb: ["10"],
                  textALIGN: [
                    getComputedValue(
                      { default: "left", center: "center", onecolumn: "left" },
                      variant
                    ),
                  ],
                  textWRAP: [
                    getComputedValue(
                      {
                        default: "pretty",
                        center: "balance",
                        onecolumn: "pretty",
                      },
                      variant
                    ),
                  ],
                  maxW: [
                    getComputedValue(
                      {
                        default: "none",
                        center: "none",
                        onecolumn: "3xl",
                      },
                      variant
                    ),
                  ],
                },
              ],
            },
            h2: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["4xl", "5xl", "6xl"],
                fontFACE: ["action"],
                pt: ["9", "14", "32"],
              },
            },
            h3: {
              classes: {
                fontSTYLE: ["bold"],
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-3",
                      "dark-bw": "brand-8",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "3xl"],
                fontFACE: ["action"],
                pt: ["9", "14", "32"],
              },
            },
            h4: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-5",
                      "light-bw": "brand-1",
                      "light-bold": "brand-5",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-3",
                    },
                    theme
                  ),
                ],
                textSIZE: ["xl", "2xl"],
                fontFACE: ["action"],
                pt: ["9", "14", "32"],
              },
            },
            p: {
              classes: {
                textCOLOR: [
                  getComputedColor(
                    {
                      light: "brand-7",
                      "light-bw": "brand-1",
                      "light-bold": "brand-7",
                      dark: "brand-8",
                      "dark-bw": "brand-2",
                      "dark-bold": "brand-8",
                    },
                    theme
                  ),
                ],
                textSIZE: ["lg", "xl"],
                lineHEIGHT: ["loose"],
                mt: ["2.5", "3.5"],
              },
            },
          },
          buttons: {},
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "aside-with-image",
    slug: "aside-with-image",
    name: "Hero with image",
    priority: getComputedNumber(
      {
        default: 210,
        onecolumn: 211,
        center: 212,
      },
      variant
    ),
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
    priority: getComputedNumber(
      {
        default: 210,
        onecolumn: 211,
        center: 212,
      },
      variant
    ),
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
    priority: getComputedNumber(
      {
        default: 210,
        onecolumn: 211,
        center: 212,
      },
      variant
    ),
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
    priority: getComputedNumber(
      {
        default: 210,
        onecolumn: 211,
        center: 212,
      },
      variant
    ),
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
    priority: getComputedNumber(
      {
        default: 50,
        onecolumn: 51,
        center: 52,
      },
      variant
    ),
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
    priority: getComputedNumber(
      {
        default: 53,
        onecolumn: 54,
        center: 55,
      },
      variant
    ),
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
    id: "titleText",
    slug: "titleText",
    name: "Quick section",
    priority: getComputedNumber(
      {
        default: 55,
        onecolumn: 56,
        center: 57,
      },
      variant
    ),
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
    id: "breaks-1",
    slug: "breaks-1",
    name: "Stepped from above",
    priority: 100,
    orientation: `above`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "stepped",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-2",
    slug: "breaks-2",
    name: "Cut 1 into below",
    priority: 100,
    orientation: `below`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              image: "cutwide1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "cut1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "cut1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-3",
    slug: "breaks-3",
    name: "Cut 2 into below",
    priority: 100,
    orientation: `below`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              image: "cutwide2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "cut2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "cut2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-4",
    slug: "breaks-4",
    name: "Low Cut 1 into below",
    priority: 100,
    orientation: `below`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              image: "lowcutwide1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "lowcut1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "lowcut1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-5",
    slug: "breaks-5",
    name: "Low Cut 2 into below",
    priority: 100,
    orientation: `below`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              image: "lowcutwide2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "lowcut2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "lowcut2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-6",
    slug: "breaks-6",
    name: "Jag from above",
    priority: 100,
    orientation: `above`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "jag",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "jag",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-7",
    slug: "breaks-7",
    name: "Burst 1 from above",
    priority: 100,
    orientation: `above`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "burst1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "burst1",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-8",
    slug: "breaks-8",
    name: "Burst 2 from above",
    priority: 100,
    orientation: `above`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "burst2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "burst2",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
          },
        } as OptionsPayloadDatum,
      },
    ],
  },
  {
    id: "breaks-9",
    slug: "breaks-9",
    name: "Crooked from above",
    priority: 100,
    orientation: `above`,
    type: `break`,
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
            light: "white",
            "light-bw": "brand-2",
            "light-bold": "brand-8",
            dark: "brand-1",
            "dark-bw": "brand-1",
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
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            tablet: {
              collection: "kCz",
              image: "crooked",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
              filetype: "svg",
              objectFit: "cover",
            },
            mobile: {
              collection: "kCz",
              image: "crooked",
              mode: "break",
              svgFill: tailwindToHex(
                getComputedColor(
                  {
                    light: "neutral-200",
                    "light-bw": "gray-200",
                    "light-bold": "neutral-200",
                    dark: "neutral-800",
                    "dark-bw": "gray-800",
                    "dark-bold": "neutral-800",
                  },
                  theme
                )
              ),
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
    isContext: false,
    tailwindBgColour: getComputedColor(
      {
        light: "brand-2",
        "light-bw": "brand-2",
        "light-bold": "white",
        dark: "brand-1",
        "dark-bw": "brand-1",
        "dark-bold": "black",
      },
      theme
    ),
    paneDesigns: [
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `default`).find(
        p => p.id === "intro-default"
      ) as PaneDesign,
      paneDesigns(theme, `default`).find(
        p => p.id === "paragraph-default"
      ) as PaneDesign,
    ],
  },
  basicOneColumn: {
    name: "Basic Page - One Column",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "intro-onecolumn"
      ) as PaneDesign,
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "paragraph-onecolumn"
      ) as PaneDesign,
    ],
  },
  basicCentered: {
    name: "Basic Page - Centered",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `center`).find(
        p => p.id === "intro-center"
      ) as PaneDesign,
      paneDesigns(theme, `center`).find(
        p => p.id === "paragraph-center"
      ) as PaneDesign,
    ],
  },
  basicSlim: {
    name: "Basic Page - Slim",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `default`).find(
        p => p.id === "intro-slim-default"
      ) as PaneDesign,
      paneDesigns(theme, `default`).find(
        p => p.id === "paragraph-default"
      ) as PaneDesign,
    ],
  },
  basicSlimOneColumn: {
    name: "Basic Page - Slim, One Column",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "intro-slim-onecolumn"
      ) as PaneDesign,
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "paragraph-onecolumn"
      ) as PaneDesign,
    ],
  },
  basicSlimCentered: {
    name: "Basic Page - Slim, Centered",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `center`).find(
        p => p.id === "intro-slim-center"
      ) as PaneDesign,
      paneDesigns(theme, `center`).find(
        p => p.id === "paragraph-center"
      ) as PaneDesign,
    ],
  },
  basicSlimBordered: {
    name: "Basic Page - Slim, Bordered",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `default`).find(
        p => p.id === "intro-slim-bordered-default"
      ) as PaneDesign,
      paneDesigns(theme, `default`).find(
        p => p.id === "paragraph-default"
      ) as PaneDesign,
    ],
  },
  basicSlimOneColumnBordered: {
    name: "Basic Page - Slim, One Column, Bordered",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "intro-slim-bordered-onecolumn"
      ) as PaneDesign,
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "paragraph-onecolumn"
      ) as PaneDesign,
    ],
  },
  basicSlimCenteredBordered: {
    name: "Basic Page - Slim, Centered, Bordered",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "breaks-7"
      ) as PaneDesign,
      paneDesigns(theme, `center`).find(
        p => p.id === "intro-slim-bordered-center"
      ) as PaneDesign,
      paneDesigns(theme, `center`).find(
        p => p.id === "paragraph-center"
      ) as PaneDesign,
    ],
  },
  basicContext: {
    name: "Basic Context Page - One section",
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
      paneDesigns(theme, `default`).find(
        p => p.id === "paragraph-default"
      ) as PaneDesign,
    ],
  },
  basicContextOneColumn: {
    name: "Basic Context Page - Single column",
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
      paneDesigns(theme, `onecolumn`).find(
        p => p.id === "paragraph-onecolumn"
      ) as PaneDesign,
    ],
  },
  basicContextCentered: {
    name: "Basic Context Page - Centered",
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
      paneDesigns(theme, `center`).find(
        p => p.id === "paragraph-center"
      ) as PaneDesign,
    ],
  },
});
