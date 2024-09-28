import { colorValues } from "./tailwindColors";

interface TailwindClassDefinition {
  values: string[];
  group: string;
  title: string;
  className: string;
  prefix: string;
  priority: number;
  useKeyAsClass?: boolean;
  allowNegative?: boolean;
}

type TailwindClasses = {
  [key: string]: TailwindClassDefinition;
};

const spacing = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "11",
  "12",
  "14",
  "16",
  "20",
  "24",
  "28",
  "32",
  "36",
  "40",
  "44",
  "48",
  "52",
  "56",
  "60",
  "64",
  "72",
  "80",
  "96",
  "auto",
  "px",
  "0.5",
  "1.5",
  "2.5",
  "3.5",
  "r1",
  "r2",
  "r3",
  "r4",
  "r5",
  "r6",
  "r7",
  "r8",
  "r9",
  "r10",
  "r11",
  "r12",
  "r14",
  "r16",
  "r20",
];
const opacity = [
  "0",
  "5",
  "10",
  "20",
  "25",
  "30",
  "40",
  "50",
  "60",
  "70",
  "75",
  "80",
  "90",
  "95",
  "100",
];

export const tailwindClasses: TailwindClasses = {
  w: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
      "auto",
      "px",
      "0.5",
      "1.5",
      "2.5",
      "3.5",
      "1/2",
      "1/3",
      "2/3",
      "1/4",
      "2/4",
      "3/4",
      "1/5",
      "2/5",
      "3/5",
      "4/5",
      "1/6",
      "2/6",
      "3/6",
      "4/6",
      "5/6",
      "1/12",
      "2/12",
      "3/12",
      "4/12",
      "5/12",
      "6/12",
      "7/12",
      "8/12",
      "9/12",
      "10/12",
      "11/12",
      "full",
      "screen",
      "min",
      "max",
      "fit",
    ],
    group: "Layout",
    title: "Width",
    className: "w",
    prefix: "w-",
    priority: 0,
  },
  h: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
      "auto",
      "px",
      "0.5",
      "1.5",
      "2.5",
      "3.5",
      "1/2",
      "1/3",
      "2/3",
      "1/4",
      "2/4",
      "3/4",
      "1/5",
      "2/5",
      "3/5",
      "4/5",
      "1/6",
      "2/6",
      "3/6",
      "4/6",
      "5/6",
      "full",
      "screen",
      "min",
      "max",
      "fit",
    ],
    group: "Layout",
    title: "Height",
    className: "h",
    prefix: "h-",
    priority: 0,
  },
  maxW: {
    values: [
      "0",
      "none",
      "xs",
      "sm",
      "md",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "6xl",
      "7xl",
      "full",
      "min",
      "max",
      "fit",
      "prose",
      "screen-sm",
      "screen-md",
      "screen-lg",
      "screen-xl",
      "screen-2xl",
    ],
    group: "Layout",
    title: "Max Width",
    className: "max-w",
    prefix: "max-w-",
    priority: 0,
  },
  maxH: {
    values: ["0", "full", "screen", "min", "max", "fit"],
    group: "Layout",
    title: "Max Height",
    className: "max-h",
    prefix: "max-h-",
    priority: 0,
  },
  display: {
    values: [
      "block",
      "inline-block",
      "inline",
      "flex",
      "inline-flex",
      "grid",
      "inline-grid",
      "contents",
      "list-item",
      "hidden",
    ],
    group: "Layout",
    title: "Display",
    className: "display",
    prefix: "",
    useKeyAsClass: true,
    priority: 0,
  },
  position: {
    values: ["static", "fixed", "absolute", "relative", "sticky"],
    group: "Layout",
    title: "Position",
    className: "position",
    prefix: "",
    useKeyAsClass: true,
    priority: 0,
  },
  inset: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
      "auto",
      "px",
      "0.5",
      "1.5",
      "2.5",
      "3.5",
      "1/2",
      "1/3",
      "2/3",
      "1/4",
      "2/4",
      "3/4",
      "full",
    ],
    group: "Layout",
    title: "Inset",
    className: "inset",
    prefix: "inset-",
    priority: 0,
  },
  z: {
    values: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "auto"],
    group: "Layout",
    title: "Z-Index",
    className: "z",
    prefix: "z-",
    priority: 0,
  },
  overflow: {
    values: ["auto", "hidden", "visible", "scroll"],
    group: "Layout",
    title: "Overflow",
    className: "overflow",
    prefix: "overflow-",
    priority: 0,
  },
  textCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Typography",
    title: "Text Color",
    className: "text",
    prefix: "text-",
    priority: 0,
  },
  textALIGN: {
    values: ["left", "center", "right", "justify", "start", "end"],
    group: "Typography",
    title: "Text Align",
    className: "text",
    prefix: "text-",
    priority: 0,
  },
  textSIZE: {
    values: [
      "xs",
      "sm",
      "base",
      "lg",
      "xl",
      "2xl",
      "3xl",
      "4xl",
      "5xl",
      "6xl",
      "7xl",
      "8xl",
      "9xl",
      "rxs",
      "rsm",
      "rbase",
      "rlg",
      "rxl",
      "r2xl",
      "r3xl",
      "r4xl",
      "r5xl",
      "r6xl",
      "r7xl",
      "r8xl",
      "r9xl",
    ],
    group: "Typography",
    title: "Text Size",
    className: "text",
    prefix: "text-",
    priority: 0,
  },
  fontFACE: {
    values: ["main", "action", "sans", "serif", "mono"],
    group: "Typography",
    title: "Font Family",
    className: "font",
    prefix: "font-",
    priority: 0,
  },
  fontSTYLE: {
    values: ["italic", "not-italic"],
    group: "Typography",
    title: "Font Style",
    className: "font",
    prefix: "",
    useKeyAsClass: true,
    priority: 0,
  },
  fontWEIGHT: {
    values: [
      //"thin",
      //"extralight",
      //"light",
      "normal",
      //"medium",
      //"semibold",
      "bold",
      //"extrabold",
      //"black",
    ],
    group: "Typography",
    title: "Font Weight",
    className: "font",
    prefix: "font-",
    priority: 0,
  },
  textDECORATION: {
    values: ["underline", "overline", "line-through", "no-underline"],
    group: "Typography",
    title: "Text Decoration",
    className: "decoration",
    prefix: "",
    useKeyAsClass: true,
    priority: 0,
  },
  textDECORATIONCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Typography",
    title: "Text Decoration Color",
    className: "decoration",
    prefix: "decoration-",
    priority: 0,
  },
  textDECORATIONSTYLE: {
    values: ["solid", "double", "dotted", "dashed", "wavy"],
    group: "Typography",
    title: "Text Decoration Style",
    className: "decoration",
    prefix: "decoration-",
    priority: 0,
  },
  textDECORATIONTHICKNESS: {
    values: ["auto", "from-font", "0", "1", "2", "4", "8"],
    group: "Typography",
    title: "Text Decoration Thickness",
    className: "decoration",
    prefix: "decoration-",
    priority: 0,
  },
  textUNDERLINEOFFSET: {
    values: ["auto", "0", "1", "2", "4", "8"],
    group: "Typography",
    title: "Text Underline Offset",
    className: "underline-offset",
    prefix: "underline-offset-",
    priority: 0,
  },
  textTRANSFORM: {
    values: ["uppercase", "lowercase", "capitalize", "normal-case"],
    group: "Typography",
    title: "Text Transform",
    className: "text",
    prefix: "",
    useKeyAsClass: true,
    priority: 0,
  },
  textOVERFLOW: {
    values: ["truncate", "text-ellipsis", "text-clip"],
    group: "Typography",
    title: "Text Overflow",
    className: "text",
    prefix: "",
    useKeyAsClass: true,
    priority: 0,
  },
  lineHEIGHT: {
    values: [
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "12",
      "14",
      "16",
      "20",
      "none",
      "tight",
      "snug",
      "normal",
      "relaxed",
      "loose",
    ],
    group: "Typography",
    title: "Line Height",
    className: "leading",
    prefix: "leading-",
    priority: 0,
  },
  letterSPACING: {
    values: ["tighter", "tight", "normal", "wide", "wider", "widest"],
    group: "Typography",
    title: "Letter Spacing",
    className: "tracking",
    prefix: "tracking-",
    priority: 0,
  },
  objectFIT: {
    values: ["contain", "cover", "fill", "none", "scale-down"],
    group: "Layout",
    title: "Object Fit",
    className: "object",
    prefix: "object-",
    priority: 0,
  },
  objectPOSITION: {
    values: [
      "bottom",
      "center",
      "left",
      "left-bottom",
      "left-top",
      "right",
      "right-bottom",
      "right-top",
      "top",
    ],
    group: "Layout",
    title: "Object Position",
    className: "object",
    prefix: "object-",
    priority: 0,
  },
  aspectRATIO: {
    values: ["auto", "square", "video"],
    group: "Layout",
    title: "Aspect Ratio",
    className: "aspect",
    prefix: "aspect-",
    priority: 0,
  },
  textWRAP: {
    values: ["wrap", "nowrap", "balance", "pretty"],
    group: "Typography",
    title: "Text Wrap",
    className: "text",
    prefix: "text-",
    priority: 0,
  },
  accentCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Colors",
    title: "Accent Color",
    className: "accent",
    prefix: "accent-",
    priority: 2,
  },
  breakUTILITIES: {
    values: ["normal", "words", "all", "keep"],
    group: "Typography",
    title: "Break",
    className: "break",
    prefix: "break-",
    priority: 0,
  },
  gridCOLSPAN: {
    values: [
      "auto",
      "span-1",
      "span-2",
      "span-3",
      "span-4",
      "span-5",
      "span-6",
      "span-7",
      "span-8",
      "span-9",
      "span-10",
      "span-11",
      "span-12",
      "span-full",
    ],
    group: "Flexbox & Grid",
    title: "Grid Column Span",
    className: "col",
    prefix: "col-",
    priority: 1,
  },
  gridROWSPAN: {
    values: [
      "auto",
      "span-1",
      "span-2",
      "span-3",
      "span-4",
      "span-5",
      "span-6",
      "span-full",
    ],
    group: "Flexbox & Grid",
    title: "Grid Row Span",
    className: "row",
    prefix: "row-",
    priority: 1,
  },
  gridAUTOFLOW: {
    values: ["row", "col", "dense", "row-dense", "col-dense"],
    group: "Flexbox & Grid",
    title: "Grid Auto Flow",
    className: "grid-flow",
    prefix: "grid-flow-",
    priority: 1,
  },
  placeITEMS: {
    values: ["start", "end", "center", "baseline", "stretch"],
    group: "Flexbox & Grid",
    title: "Place Items",
    className: "place-items",
    prefix: "place-items-",
    priority: 1,
  },
  placeCONTENT: {
    values: [
      "start",
      "end",
      "center",
      "between",
      "around",
      "evenly",
      "stretch",
    ],
    group: "Flexbox & Grid",
    title: "Place Content",
    className: "place-content",
    prefix: "place-content-",
    priority: 1,
  },
  placeSELF: {
    values: ["auto", "start", "end", "center", "stretch"],
    group: "Flexbox & Grid",
    title: "Place Self",
    className: "place-self",
    prefix: "place-self-",
    priority: 1,
  },
  orderORDER: {
    values: [
      "first",
      "last",
      "none",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
    ],
    group: "Flexbox & Grid",
    title: "Order",
    className: "order",
    prefix: "order-",
    priority: 1,
  },
  m: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin",
    className: "m",
    prefix: "m-",
    priority: 1,
  },
  mx: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin X",
    className: "mx",
    prefix: "mx-",
    priority: 1,
  },
  my: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin Y",
    className: "my",
    prefix: "my-",
    priority: 1,
  },
  mt: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin Top",
    className: "mt",
    prefix: "mt-",
    priority: 1,
  },
  mr: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin Right",
    className: "mr",
    prefix: "mr-",
    priority: 1,
  },
  mb: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin Bottom",
    className: "mb",
    prefix: "mb-",
    priority: 1,
  },
  ml: {
    values: [...spacing],
    group: "Spacing",
    title: "Margin Left",
    className: "ml",
    prefix: "ml-",
    priority: 1,
  },
  p: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding",
    className: "p",
    prefix: "p-",
    priority: 1,
  },
  px: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding X",
    className: "px",
    prefix: "px-",
    priority: 1,
  },
  py: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding Y",
    className: "py",
    prefix: "py-",
    priority: 1,
  },
  pt: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding Top",
    className: "pt",
    prefix: "pt-",
    priority: 1,
  },
  pr: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding Right",
    className: "pr",
    prefix: "pr-",
    priority: 1,
  },
  pb: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding Bottom",
    className: "pb",
    prefix: "pb-",
    priority: 1,
  },
  pl: {
    values: [...spacing],
    group: "Spacing",
    title: "Padding Left",
    className: "pl",
    prefix: "pl-",
    priority: 1,
  },
  flex: {
    values: ["1", "auto", "initial", "none"],
    group: "Flexbox",
    title: "Flex",
    className: "flex",
    prefix: "flex-",
    priority: 1,
  },
  flexDIRECTION: {
    values: ["row", "row-reverse", "col", "col-reverse"],
    group: "Flexbox",
    title: "Flex Direction",
    className: "flex",
    prefix: "flex-",
    priority: 1,
  },
  flexWRAP: {
    values: ["wrap", "wrap-reverse", "nowrap"],
    group: "Flexbox",
    title: "Flex Wrap",
    className: "flex",
    prefix: "flex-",
    priority: 1,
  },
  justifyITEMS: {
    values: ["start", "end", "center", "stretch"],
    group: "Flexbox",
    title: "Justify Items",
    className: "justify-items",
    prefix: "justify-items-",
    priority: 1,
  },
  justifyCONTENT: {
    values: ["start", "end", "center", "between", "around", "evenly"],
    group: "Flexbox",
    title: "Justify Content",
    className: "justify",
    prefix: "justify-",
    priority: 1,
  },
  alignITEMS: {
    values: ["start", "end", "center", "baseline", "stretch"],
    group: "Flexbox",
    title: "Align Items",
    className: "items",
    prefix: "items-",
    priority: 1,
  },
  gap: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
      "px",
      "0.5",
      "1.5",
      "2.5",
      "3.5",
    ],
    group: "Flexbox",
    title: "Gap",
    className: "gap",
    prefix: "gap-",
    priority: 1,
  },
  gapX: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
      "px",
      "0.5",
      "1.5",
      "2.5",
      "3.5",
    ],
    group: "Flexbox",
    title: "Gap X",
    className: "gap-x",
    prefix: "gap-",
    priority: 1,
  },
  gapY: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
      "px",
      "0.5",
      "1.5",
      "2.5",
      "3.5",
    ],
    group: "Flexbox",
    title: "Gap Y",
    className: "gap-y",
    prefix: "gap-",
    priority: 1,
  },
  borderSTYLE: {
    values: ["solid", "dashed", "dotted", "double", "hidden", "none"],
    group: "Borders",
    title: "Border Style",
    className: "border",
    prefix: "border-",
    priority: 2,
  },
  borderWIDTH: {
    values: ["0", "2", "4", "8"],
    group: "Borders",
    title: "Border Width",
    className: "border",
    prefix: "border-",
    priority: 2,
  },
  borderCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Borders",
    title: "Border Color",
    className: "border",
    prefix: "border-",
    priority: 2,
  },
  borderSTROKE: {
    values: ["0", "2", "4", "8"],
    group: "Borders",
    title: "Border Stroke Size",
    className: "border",
    prefix: "border-",
    priority: 2,
  },
  rounded: {
    values: ["none", "sm", "md", "lg", "xl", "2xl", "3xl", "full"],
    group: "Borders",
    title: "Border Radius",
    className: "rounded",
    prefix: "rounded-",
    priority: 2,
  },
  divideWIDTH: {
    values: ["0", "2", "4", "8"],
    group: "Borders",
    title: "Divide Width",
    className: "divide",
    prefix: "divide-",
    priority: 2,
  },
  divideCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Borders",
    title: "Divide Color",
    className: "divide",
    prefix: "divide-",
    priority: 2,
  },
  divideSTYLE: {
    values: ["solid", "dashed", "dotted", "double", "none"],
    group: "Borders",
    title: "Divide Style",
    className: "divide",
    prefix: "divide-",
    priority: 2,
  },
  outlineWIDTH: {
    values: ["0", "2", "4", "8"],
    group: "Borders",
    title: "Outline Width",
    className: "outline",
    prefix: "outline-",
    priority: 2,
  },
  outlineCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Borders",
    title: "Outline Color",
    className: "outline",
    prefix: "outline-",
    priority: 2,
  },
  outlineSTYLE: {
    values: ["none", "solid", "dashed", "dotted", "double"],
    group: "Borders",
    title: "Outline Style",
    className: "outline",
    prefix: "outline-",
    priority: 2,
  },
  ringWIDTH: {
    values: ["0", "2", "4", "8"],
    group: "Borders",
    title: "Ring Width",
    className: "ring",
    prefix: "ring-",
    priority: 2,
  },
  ringCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Borders",
    title: "Ring Color",
    className: "ring",
    prefix: "ring-",
    priority: 2,
  },
  ringOffsetWIDTH: {
    values: ["0", "2", "4", "8"],
    group: "Borders",
    title: "Ring Offset Width",
    className: "ring-offset",
    prefix: "ring-offset-",
    priority: 2,
  },
  ringOffsetCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Borders",
    title: "Ring Offset Color",
    className: "ring-offset",
    prefix: "ring-offset-",
    priority: 2,
  },
  bgCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Backgrounds",
    title: "Background Color",
    className: "bg",
    prefix: "bg-",
    priority: 2,
  },
  bgOPACITY: {
    values: [...opacity],
    group: "Backgrounds",
    title: "Background Opacity",
    className: "bg-opacity",
    prefix: "bg-opacity-",
    priority: 2,
  },
  bgPOSITION: {
    values: [
      "bottom",
      "center",
      "left",
      "left-bottom",
      "left-top",
      "right",
      "right-bottom",
      "right-top",
      "top",
    ],
    group: "Backgrounds",
    title: "Background Position",
    className: "bg",
    prefix: "bg-",
    priority: 2,
  },
  bgSIZE: {
    values: ["auto", "cover", "contain"],
    group: "Backgrounds",
    title: "Background Size",
    className: "bg",
    prefix: "bg-",
    priority: 2,
  },
  bgREPEAT: {
    values: ["repeat", "no-repeat", "repeat-x", "repeat-y", "round", "space"],
    group: "Backgrounds",
    title: "Background Repeat",
    className: "bg",
    prefix: "bg-",
    priority: 2,
  },
  bgATTACHMENT: {
    values: ["fixed", "local", "scroll"],
    group: "Backgrounds",
    title: "Background Attachment",
    className: "bg",
    prefix: "bg-",
    priority: 2,
  },
  bgCLIP: {
    values: ["border", "padding", "content", "text"],
    group: "Backgrounds",
    title: "Background Clip",
    className: "bg-clip",
    prefix: "bg-clip-",
    priority: 2,
  },
  bgORIGIN: {
    values: ["border", "padding", "content"],
    group: "Backgrounds",
    title: "Background Origin",
    className: "bg-origin",
    prefix: "bg-origin-",
    priority: 2,
  },
  fill: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Colors",
    title: "Fill Color",
    className: "fill",
    prefix: "fill-",
    priority: 2,
  },
  strokeCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Colors",
    title: "Stroke Color",
    className: "stroke",
    prefix: "stroke-",
    priority: 2,
  },
  strokeSIZE: {
    values: ["0", "1", "2"],
    group: "Colors",
    title: "Stroke Size",
    className: "stroke",
    prefix: "stroke-",
    priority: 2,
  },
  textOPACITY: {
    values: [...opacity],
    group: "Colors",
    title: "Text Opacity",
    className: "text-opacity",
    prefix: "text-opacity-",
    priority: 2,
  },
  placeholderCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Colors",
    title: "Placeholder Color",
    className: "placeholder",
    prefix: "placeholder-",
    priority: 2,
  },
  placeholderOPACITY: {
    values: [...opacity],
    group: "Colors",
    title: "Placeholder Opacity",
    className: "placeholder-opacity",
    prefix: "placeholder-opacity-",
    priority: 2,
  },
  isolate: {
    values: ["isolate", "isolation-auto"],
    group: "Effects",
    title: "Isolation",
    className: "isolation",
    prefix: "",
    useKeyAsClass: true,
    priority: 3,
  },
  transitionPROPERTY: {
    values: ["none", "all", "colors", "opacity", "shadow", "transform"],
    group: "Transitions",
    title: "Transition Property",
    className: "transition",
    prefix: "transition-",
    priority: 3,
  },
  scale: {
    values: ["0", "50", "75", "90", "95", "100", "105", "110", "125", "150"],
    group: "Transforms",
    title: "Scale",
    className: "scale",
    prefix: "scale-",
    priority: 3,
  },
  skew: {
    values: ["0", "1", "2", "3", "6", "12"],
    group: "Transforms",
    title: "Skew",
    className: "skew",
    prefix: "skew-",
    priority: 3,
  },
  translate: {
    values: [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "11",
      "12",
      "14",
      "16",
      "20",
      "24",
      "28",
      "32",
      "36",
      "40",
      "44",
      "48",
      "52",
      "56",
      "60",
      "64",
      "72",
      "80",
      "96",
    ],
    group: "Transforms",
    title: "Translate",
    className: "translate",
    prefix: "translate-",
    priority: 3,
  },
  listSTYLETYPE: {
    values: ["none", "disc", "decimal"],
    group: "Typography",
    title: "List Style Type",
    className: "list",
    prefix: "list-",
    priority: 0,
  },
  listSTYLEPOSITION: {
    values: ["inside", "outside"],
    group: "Typography",
    title: "List Style Position",
    className: "list",
    prefix: "list-",
    priority: 0,
  },
  rotate: {
    values: ["0", "1", "2", "3", "6", "12", "45", "90", "180"],
    group: "Effects",
    title: "Rotate",
    className: "rotate",
    prefix: "rotate-",
    priority: 3,
    allowNegative: true,
  },
  opacity: {
    values: [...opacity],
    group: "Effects",
    title: "Opacity",
    className: "opacity",
    prefix: "opacity-",
    priority: 3,
  },
  mixBlendMODE: {
    values: [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
    ],
    group: "Effects",
    title: "Mix Blend Mode",
    className: "mix-blend",
    prefix: "mix-blend-",
    priority: 3,
  },
  backgroundBlendMODE: {
    values: [
      "normal",
      "multiply",
      "screen",
      "overlay",
      "darken",
      "lighten",
      "color-dodge",
      "color-burn",
      "hard-light",
      "soft-light",
      "difference",
      "exclusion",
      "hue",
      "saturation",
      "color",
      "luminosity",
    ],
    group: "Effects",
    title: "Background Blend Mode",
    className: "bg-blend",
    prefix: "bg-blend-",
    priority: 3,
  },
  shadow: {
    values: ["sm", "md", "lg", "xl", "2xl", "inner", "none"],
    group: "Effects",
    title: "Box Shadow",
    className: "shadow",
    prefix: "shadow-",
    priority: 3,
  },
  boxShadowCOLOR: {
    values: ["inherit", "current", "transparent", ...colorValues],
    group: "Effects",
    title: "Box Shadow Color",
    className: "shadow",
    prefix: "shadow-",
    priority: 3,
  },
  filter: {
    values: ["none"],
    group: "Effects",
    title: "Filter",
    className: "filter",
    prefix: "filter-",
    useKeyAsClass: true,
    priority: 3,
  },
  blur: {
    values: ["none", "sm", "md", "lg", "xl", "2xl", "3xl"],
    group: "Effects",
    title: "Blur",
    className: "blur",
    prefix: "blur-",
    priority: 3,
  },
  brightness: {
    values: [
      "0",
      "50",
      "75",
      "90",
      "95",
      "100",
      "105",
      "110",
      "125",
      "150",
      "200",
    ],
    group: "Effects",
    title: "Brightness",
    className: "brightness",
    prefix: "brightness-",
    priority: 3,
  },
  contrast: {
    values: ["0", "50", "75", "100", "125", "150", "200"],
    group: "Effects",
    title: "Contrast",
    className: "contrast",
    prefix: "contrast-",
    priority: 3,
  },
  dropSHADOW: {
    values: ["sm", "md", "lg", "xl", "2xl", "none"],
    group: "Effects",
    title: "Drop Shadow",
    className: "drop-shadow",
    prefix: "drop-shadow-",
    priority: 3,
  },
  grayscale: {
    values: ["0", "1"],
    group: "Effects",
    title: "Grayscale",
    className: "grayscale",
    prefix: "grayscale-",
    priority: 3,
  },
  hueROTATE: {
    values: ["0", "15", "30", "60", "90", "180"],
    group: "Effects",
    title: "Hue Rotate",
    className: "hue-rotate",
    prefix: "hue-rotate-",
    priority: 3,
  },
  invert: {
    values: ["0", "1"],
    group: "Effects",
    title: "Invert",
    className: "invert",
    prefix: "invert-",
    priority: 3,
  },
  saturate: {
    values: ["0", "50", "100", "150", "200"],
    group: "Effects",
    title: "Saturate",
    className: "saturate",
    prefix: "saturate-",
    priority: 3,
  },
  sepia: {
    values: ["0", "1"],
    group: "Effects",
    title: "Sepia",
    className: "sepia",
    prefix: "sepia-",
    priority: 3,
  },
  backdropFILTER: {
    values: ["none"],
    group: "Effects",
    title: "Backdrop Filter",
    className: "backdrop",
    prefix: "backdrop-",
    useKeyAsClass: true,
    priority: 3,
  },
  backdropBLUR: {
    values: ["none", "sm", "md", "lg", "xl", "2xl", "3xl"],
    group: "Effects",
    title: "Backdrop Blur",
    className: "backdrop-blur",
    prefix: "backdrop-blur-",
    priority: 3,
  },
  backdropBRIGHTNESS: {
    values: [
      "0",
      "50",
      "75",
      "90",
      "95",
      "100",
      "105",
      "110",
      "125",
      "150",
      "200",
    ],
    group: "Effects",
    title: "Backdrop Brightness",
    className: "backdrop-brightness",
    prefix: "backdrop-brightness-",
    priority: 3,
  },
  backdropCONTRAST: {
    values: ["0", "50", "75", "100", "125", "150", "200"],
    group: "Effects",
    title: "Backdrop Contrast",
    className: "backdrop-contrast",
    prefix: "backdrop-contrast-",
    priority: 3,
  },
  backdropGRAYSCALE: {
    values: ["0", "1"],
    group: "Effects",
    title: "Backdrop Grayscale",
    className: "backdrop-grayscale",
    prefix: "backdrop-grayscale-",
    priority: 3,
  },
  backdropHueROTATE: {
    values: ["0", "15", "30", "60", "90", "180"],
    group: "Effects",
    title: "Backdrop Hue Rotate",
    className: "backdrop-hue-rotate",
    prefix: "backdrop-hue-rotate-",
    priority: 3,
  },
  backdropINVERT: {
    values: ["0", "1"],
    group: "Effects",
    title: "Backdrop Invert",
    className: "backdrop-invert",
    prefix: "backdrop-invert-",
    priority: 3,
  },
  backdropOPACITY: {
    values: [
      "0",
      "5",
      "10",
      "20",
      "25",
      "30",
      "40",
      "50",
      "60",
      "70",
      "75",
      "80",
      "90",
      "95",
      "100",
    ],
    group: "Effects",
    title: "Backdrop Opacity",
    className: "backdrop-opacity",
    prefix: "backdrop-opacity-",
    priority: 3,
  },
  backdropSATURATE: {
    values: ["0", "50", "100", "150", "200"],
    group: "Effects",
    title: "Backdrop Saturate",
    className: "backdrop-saturate",
    prefix: "backdrop-saturate-",
    priority: 3,
  },
  backdropSEPIA: {
    values: ["0", "1"],
    group: "Effects",
    title: "Backdrop Sepia",
    className: "backdrop-sepia",
    prefix: "backdrop-sepia-",
    priority: 3,
  },
  transition: {
    values: ["none", "all", "colors", "opacity", "shadow", "transform"],
    group: "Transitions",
    title: "Transition",
    className: "transition",
    prefix: "transition-",
    priority: 3,
  },
  transitionDURATION: {
    values: ["75", "100", "150", "200", "300", "500", "700", "1000"],
    group: "Transitions",
    title: "Transition Duration",
    className: "duration",
    prefix: "duration-",
    priority: 3,
  },
  transitionTimingFUNCTION: {
    values: ["linear", "in", "out", "in-out"],
    group: "Transitions",
    title: "Transition Timing Function",
    className: "ease",
    prefix: "ease-",
    priority: 3,
  },
  transitionDELAY: {
    values: ["75", "100", "150", "200", "300", "500", "700", "1000"],
    group: "Transitions",
    title: "Transition Delay",
    className: "delay",
    prefix: "delay-",
    priority: 3,
  },
  animate: {
    values: ["none", "spin", "ping", "pulse", "bounce"],
    group: "Transitions",
    title: "Animation",
    className: "animate",
    prefix: "animate-",
    priority: 3,
  },
  cursor: {
    values: [
      "auto",
      "default",
      "pointer",
      "wait",
      "text",
      "move",
      "help",
      "not-allowed",
      "none",
      "context-menu",
      "progress",
      "cell",
      "crosshair",
      "vertical-text",
      "alias",
      "copy",
      "no-drop",
      "grab",
      "grabbing",
      "all-scroll",
      "col-resize",
      "row-resize",
      "n-resize",
      "e-resize",
      "s-resize",
      "w-resize",
      "ne-resize",
      "nw-resize",
      "se-resize",
      "sw-resize",
      "ew-resize",
      "ns-resize",
      "nesw-resize",
      "nwse-resize",
      "zoom-in",
      "zoom-out",
    ],
    group: "Interactivity",
    title: "Cursor",
    className: "cursor",
    prefix: "cursor-",
    priority: 3,
  },
  pointerEVENTS: {
    values: ["none", "auto"],
    group: "Interactivity",
    title: "Pointer Events",
    className: "pointer-events",
    prefix: "pointer-events-",
    priority: 3,
  },
  resize: {
    values: ["none", "y", "x", ""],
    group: "Interactivity",
    title: "Resize",
    className: "resize",
    prefix: "resize-",
    priority: 3,
  },
  scrollBEHAVIOR: {
    values: ["auto", "smooth"],
    group: "Interactivity",
    title: "Scroll Behavior",
    className: "scroll",
    prefix: "scroll-",
    priority: 3,
  },
  scrollSNAP: {
    values: ["none", "x", "y", "both"],
    group: "Interactivity",
    title: "Scroll Snap",
    className: "snap",
    prefix: "snap-",
    priority: 3,
  },
  touchACTION: {
    values: [
      "auto",
      "none",
      "pan-x",
      "pan-left",
      "pan-right",
      "pan-y",
      "pan-up",
      "pan-down",
      "pinch-zoom",
      "manipulation",
    ],
    group: "Interactivity",
    title: "Touch Action",
    className: "touch",
    prefix: "touch-",
    priority: 3,
  },
  userSELECT: {
    values: ["none", "text", "all", "auto"],
    group: "Interactivity",
    title: "User Select",
    className: "select",
    prefix: "select-",
    priority: 3,
  },
  willCHANGE: {
    values: ["auto", "scroll", "contents", "transform"],
    group: "Interactivity",
    title: "Will Change",
    className: "will-change",
    prefix: "will-change-",
    priority: 3,
  },
};
