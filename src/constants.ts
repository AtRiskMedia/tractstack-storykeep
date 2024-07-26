import {
  PencilIcon,
  PaintBrushIcon,
  Cog8ToothIcon,
  TrashIcon,
  PlusCircleIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import type { ToolMode, ToolAddMode } from "./types";

export const CONCIERGE_SYNC_INTERVAL = 4000;
export const THRESHOLD_READ = import.meta.env.PUBLIC_THRESHOLD_READ || 42000;
export const THRESHOLD_GLOSSED =
  import.meta.env.PUBLIC_THRESHOLD_GLOSSED || 7000;
export const JWT_LIFETIME = 15 * 60 * 1000;
export const WORDMARK_MODE = import.meta.env.PUBLIC_WORDMARK_MODE || "default";
export const ENABLE_HEADER_WIDGET =
  import.meta.env.ENABLE_HEADER_WIDGET === "true" || false;

export const MAX_HISTORY_LENGTH = 10;

export const toolAddModes = [
  "paragraph",
  "h2",
  "h3",
  "h4",
  "image",
  "yt",
  "bunny",
  "belief",
  "identify",
  "toggle",
  "aside",
] as const;

export const toolAddModeTitles: Record<ToolAddMode, string> = {
  paragraph: "Paragraph",
  h2: "Heading 2",
  h3: "Heading 3",
  h4: "Heading 4",
  image: "Image",
  yt: "YouTube Video",
  bunny: "Bunny Video",
  belief: "Belief Select",
  identify: "Identity As",
  toggle: "Toggle Belief",
  aside: "Aside Text",
};

export const toolModes: ToolMode[] = [
  "insert",
  "text",
  "styles",
  "settings",
  "eraser",
  "pane",
];

export const toolModeButtons = [
  {
    key: "insert" as const,
    Icon: PlusCircleIcon,
    title: "Insert element",
  },
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
    key: "eraser" as const,
    Icon: TrashIcon,
    title: "Erase element",
  },
  {
    key: "pane" as const,
    Icon: Square3Stack3DIcon,
    title: "Insert Pane",
  },
  {
    key: "settings" as const,
    Icon: Cog8ToothIcon,
    title: "Edit settings",
  },
] as const;
