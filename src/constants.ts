import {
  PencilIcon,
  PaintBrushIcon,
  Cog8ToothIcon,
  TrashIcon,
  PlusCircleIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import type { Tag, ToolMode, ToolAddMode } from "./types";

export const CONCIERGE_SYNC_INTERVAL = 4000;
export const THRESHOLD_READ = import.meta.env.PUBLIC_THRESHOLD_READ || 42000;
export const THRESHOLD_GLOSSED =
  import.meta.env.PUBLIC_THRESHOLD_GLOSSED || 7000;
export const JWT_LIFETIME = 15 * 60 * 1000;
export const WORDMARK_MODE = import.meta.env.PUBLIC_WORDMARK_MODE || "default";
export const ENABLE_HEADER_WIDGET =
  import.meta.env.ENABLE_HEADER_WIDGET === "true" || false;

export const MAX_HISTORY_LENGTH = 10;
export const MS_BETWEEN_UNDO = 10000;
export const MAX_LENGTH_CONTENT = 10000;

export const SHORT_SCREEN_THRESHOLD = 600;
export const STICKY_HEADER_THRESHOLD = 600;

export const tagTitles: Record<Tag, string> = {
  p: "Paragraph",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  img: "Image",
  code: "Widget",
  li: `List Item`,
  ol: "Outer Container",
  ul: "Outer Container",
  parent: "Pane Styles",
  modal: "Modal Styles",
};

export const toolAddModes = [
  "p",
  "h2",
  "h3",
  "h4",
  "img",
  "yt",
  "bunny",
  "belief",
  "identify",
  "toggle",
  "aside",
] as const;

export const toolAddModeTitles: Record<ToolAddMode, string> = {
  p: "Paragraph",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  img: "Image",
  yt: "YouTube Video",
  bunny: "Bunny Video",
  belief: "Belief Select",
  identify: "Identity As",
  toggle: "Toggle Belief",
  aside: "Aside Text",
};

export const toolAddModeInsertDefault: Record<ToolAddMode, string> = {
  p: "...",
  h2: "## title",
  h3: "### subtitle",
  h4: "#### section title",
  img: "* ![Descriptive title](filename)",
  yt: "* `youtube(tag|title)`",
  bunny: "* `bunny(id|title)`",
  belief: "* `belief(BeliefTag|likert|question)`",
  identify: "* `identifyAs(BeliefTag|TARGET_VALUE|question)`",
  toggle: "* `toggle(BeliefTag|likert|question)`",
  aside: "...", // on initial insert must wrap in ol
};

export const toolModes: ToolMode[] = [
  "text",
  "styles",
  "insert",
  "settings",
  "eraser",
  "pane",
];

export const toolModeButtons = [
  {
    key: "text" as const,
    Icon: PencilIcon,
    title: "Edit text",
  },
  {
    key: "styles" as const,
    Icon: PaintBrushIcon,
    title: "Edit styles",
  },
  {
    key: "insert" as const,
    Icon: PlusCircleIcon,
    title: "Insert element",
  },
  {
    key: "eraser" as const,
    Icon: TrashIcon,
    title: "Erase element",
  },
  {
    key: "settings" as const,
    Icon: Cog8ToothIcon,
    title: "Edit settings",
  },
  {
    key: "pane" as const,
    Icon: Square3Stack3DIcon,
    title: "Insert Pane",
  },
] as const;
