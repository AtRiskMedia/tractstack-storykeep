import {
  PencilIcon,
  PaintBrushIcon,
  Cog8ToothIcon,
  TrashIcon,
  PlusCircleIcon,
  Square3Stack3DIcon,
} from "@heroicons/react/24/outline";
import type {
  ResourceSetting,
  EnvSetting,
  Tag,
  ToolMode,
  ToolAddMode,
} from "./types";

export const PUBLIC_THEME = import.meta.env.PUBLIC_THEME || `light`;
export const CONCIERGE_SYNC_INTERVAL = 4000;
export const THRESHOLD_READ = import.meta.env.PUBLIC_THRESHOLD_READ || 42000;
export const THRESHOLD_GLOSSED =
  import.meta.env.PUBLIC_THRESHOLD_GLOSSED || 7000;
export const JWT_LIFETIME = 15 * 60 * 1000;
export const WORDMARK_MODE = import.meta.env.PUBLIC_WORDMARK_MODE || "default";
export const ENABLE_HEADER_WIDGET =
  import.meta.env.ENABLE_HEADER_WIDGET === "true" || false;

export const MAX_HISTORY_LENGTH = 10;
export const MS_BETWEEN_UNDO = 6000;
export const MAX_LENGTH_CONTENT = 10000;

export const SHORT_SCREEN_THRESHOLD = 900;
export const SMALL_SCREEN_WIDTH = 600;
export const MIN_SCROLL_THRESHOLD = 220;
export const HYSTERESIS = 200;

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
  img: "![Descriptive title](filename)", // on initial insert must wrap in ul
  yt: "* `youtube(tag|title)`",
  bunny: "* `bunny(id|title)`",
  belief: "* `belief(BeliefTag|likert|prompt)`",
  identify: "* `identifyAs(BeliefTag|TARGET_VALUE|prompt)`",
  toggle: "* `toggle(BeliefTag|prompt)`",
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

interface WidgetMeta {
  [key: string]: {
    title: string;
    valueLabels: string[];
    valueDefaults: string[];
    multi: boolean[];
    isScale: boolean[];
  };
}

export const widgetMeta: WidgetMeta = {
  belief: {
    title: `Belief Widget`,
    valueLabels: ["Belief Tag", "Scale", "Question Prompt"],
    valueDefaults: ["BELIEF", "yn", "Prompt"],
    multi: [false, false, false],
    isScale: [false, true, false],
  },
  identifyAs: {
    title: `Identify As Widget`,
    valueLabels: ["Belief Tag", "Belief Matching Value(s)", "Question Prompt"],
    valueDefaults: ["BELIEF", "*", "Prompt"],
    multi: [false, true, false],
    isScale: [false, false, false],
  },
  toggle: {
    title: `Toggle Belief Widget`,
    valueLabels: ["Belief Tag", "Question Prompt"],
    valueDefaults: ["BELIEF", "Prompt"],
    multi: [false, false],
    isScale: [false, false],
  },
  youtube: {
    title: `YouTube Video Embed`,
    valueLabels: ["Embed Code", "Title"],
    valueDefaults: ["*", "Descriptive Title"],
    multi: [false, false],
    isScale: [false, false],
  },
  bunny: {
    title: `BunnyCDN Video Embed`,
    valueLabels: ["Embed Code", "Title"],
    valueDefaults: ["*", "Descriptive Title"],
    multi: [false, false],
    isScale: [false, false],
  },
  resource: {
    title: `Not yet implemented`,
    valueLabels: ["Type", "Variation"],
    valueDefaults: ["?", "?"],
    multi: [false, false],
    isScale: [false, false],
  },
};

export const knownEnvSettings: EnvSetting[] = [
  {
    name: "PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    defaultValue: "shpat_1234567890abcdefghijklmnopqrstuv",
    type: "string",
    description: "Private access token for Shopify Storefront API",
    group: "Integrations",
    priority: false,
    required: false,
  },
  {
    name: "PUBLIC_SHOPIFY_SHOP",
    defaultValue: "my-awesome-shop.myshopify.com",
    type: "string",
    description: "Your Shopify store URL",
    group: "Integrations",
    priority: false,
    required: false,
  },
  {
    name: "PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    defaultValue: "shpat_9876543210zyxwvutsrqponmlkjihgf",
    type: "string",
    description: "Public access token for Shopify Storefront API",
    group: "Integrations",
    priority: false,
    required: false,
  },
  {
    name: "PRIVATE_CONCIERGE_BASE_URL",
    defaultValue: "https://storykeep.example.com/api/v1",
    type: "string",
    description: "Base URL for the private Concierge API",
    group: "Core",
    priority: false,
    required: true,
  },
  {
    name: "PUBLIC_CONCIERGE_STYLES_URL",
    defaultValue: "https://storykeep.example.com/api/styles",
    type: "string",
    description: "URL for public CSS styles",
    group: "Core",
    priority: false,
    required: true,
  },
  {
    name: "PUBLIC_SITE_URL",
    defaultValue: "https://example.com",
    type: "string",
    description: "Public URL of your site",
    group: "Core",
    priority: true,
    required: true,
  },
  {
    name: "PUBLIC_IMAGE_URL",
    defaultValue: "https://example.com",
    type: "string",
    description: "Base URL for public images",
    group: "Core",
    priority: false,
    required: true,
  },
  {
    name: "PUBLIC_SOCIALS",
    defaultValue: "x|https://x.com/you",
    type: "string[]",
    description: "Social media links",
    group: "Brand",
    priority: true,
    required: false,
  },
  {
    name: "PUBLIC_FOOTER",
    defaultValue: "Your slogan goes here",
    type: "string",
    description: "Footer text for the website",
    group: "Brand",
    priority: true,
    required: true,
  },
  {
    name: "PUBLIC_HOME",
    defaultValue: "home",
    type: "string",
    description: "Use this story fragment as home page",
    group: "Brand",
    priority: true,
    required: true,
  },
  {
    name: "PUBLIC_IMPRESSIONS_DELAY",
    defaultValue: "5000",
    type: "number",
    description: "Delay (in milliseconds) before showing impressions",
    group: "Options",
    priority: false,
    required: false,
  },
  {
    name: "PUBLIC_SLOGAN",
    defaultValue: "Building awesome websites, one story at a time",
    type: "string",
    description: "Your company's slogan",
    group: "Brand",
    priority: true,
    required: true,
  },
  {
    name: "PUBLIC_READ_THRESHOLD",
    defaultValue: "42000",
    type: "number",
    description: "Threshold for considering content as read (in milliseconds)",
    group: "Options",
    priority: false,
    required: false,
  },
  {
    name: "PUBLIC_SOFT_READ_THRESHOLD",
    defaultValue: "7000",
    type: "number",
    description:
      "Soft threshold for considering content as glossed (in milliseconds)",
    group: "Options",
    priority: false,
    required: false,
  },
  {
    name: "PUBLIC_WORDMARK_MODE",
    defaultValue: "default",
    type: "string",
    description: "Wordmark mode (default, logo, or wordmark)",
    group: "Brand",
    priority: false,
    required: false,
  },
  {
    name: "PUBLIC_GOOGLE_SITE_VERIFICATION",
    defaultValue: "googleXXXXXXXXXXXXXXXX",
    type: "string",
    description: "Google site verification code",
    group: "Integrations",
    priority: true,
    required: false,
  },
  {
    name: "TURSO_DATABASE_URL",
    defaultValue: "libsql://my-db-name.turso.io",
    type: "string",
    description: "URL for Turso database",
    group: "Core",
    priority: false,
    required: true,
  },
  {
    name: "TURSO_AUTH_TOKEN",
    defaultValue: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2...",
    type: "string",
    description: "Authentication token for Turso",
    group: "Core",
    priority: false,
    required: true,
  },
  {
    name: "PRIVATE_AUTH_SECRET",
    defaultValue: "my-super-secret-auth-key",
    type: "string",
    description: "Password to access your Story Keep",
    group: "Core",
    priority: false,
    required: true,
  },
  {
    name: "PUBLIC_USE_CUSTOM_FONTS",
    defaultValue: "false",
    type: "boolean",
    description: "Are custom fonts installed?",
    group: "Core",
    priority: false,
    required: false,
  },
  {
    name: "PRIVATE_OPEN_DEMO",
    defaultValue: "false",
    type: "boolean",
    description:
      "Allow visitors to make temporary changes to your site (DEMO MODE)",
    group: "Core",
    priority: false,
    required: false,
  },
  {
    name: "CONCIERGE_ROOT",
    defaultValue: "/home/tractstack/srv/tractstack-concierge",
    type: "string",
    description: "Server Folder for Tract Stack Concierge",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "FRONT_ROOT",
    defaultValue: "/home/tractstack/src/tractstack-storykeep",
    type: "string",
    description: "Server Folder for Tract Stack",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "WATCH_ROOT",
    defaultValue: "/home/tractstack/watch",
    type: "string",
    description: "Server Folder for Tract Stack",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "CONCIERGE_SECRET",
    defaultValue: "randomhighentropystring",
    type: "string",
    description:
      "Enter a random string for encrypted communication between storykeep and concierge",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "SECRET_KEY",
    defaultValue: "randomhighentropystring",
    type: "string",
    description: "Enter a random string for password encryption",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "DB_HOST",
    defaultValue: "localhost",
    type: "string",
    description: "Where's the database? Likely localhost",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "DB_NAME",
    defaultValue: "concierge_tractstack",
    type: "string",
    description: "Name of database on server",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "DB_USER",
    defaultValue: "tractstack",
    type: "string",
    description: "Name of database user",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "DB_PASSWORD",
    defaultValue: "strong-password",
    type: "string",
    description: "Strong password",
    group: "Backend",
    priority: false,
    required: true,
  },
  {
    name: "NEO4J_URI",
    defaultValue: "neo4j+s://id.databases.neo4j.io",
    type: "string",
    description: "AuraDB neo4j+s:// address",
    group: "Backend",
    priority: false,
    required: false,
  },
  {
    name: "NEO4J_USER",
    defaultValue: "username",
    type: "string",
    description: "AuraDB neo4j+s:// user name",
    group: "Backend",
    priority: false,
    required: false,
  },
  {
    name: "NEO4J_SECRET",
    defaultValue: "strong-password",
    type: "string",
    description: "AuraDB neo4j+s:// password",
    group: "Backend",
    priority: false,
    required: false,
  },
  {
    name: "NEO4J_ENABLED",
    defaultValue: "false",
    type: "boolean",
    description: "Are you using Neo4j?",
    group: "Backend",
    priority: true,
    required: false,
  },
];

export const reservedSlugs = [
  `api`,
  `create`,
  `edit`,
  `concierge`,
  `context`,
  `products`,
  `storykeep`,
  `cart`,
  `404`,
];

// Define known resource settings based on categorySlug
export const knownResourceSettings: {
  [categorySlug: string]: ResourceSetting;
} = {
  crusade: {
    location: { type: "string" },
    details: { type: "string" },
    ytembed: { type: "string" },
    date: { type: "date" },
    cancelled: { type: "boolean", defaultValue: false },
    live: { type: "boolean", defaultValue: false },
  },
  // Add more category slugs and their corresponding settings as needed
};

export function isKnownResourceSetting(
  categorySlug: string | number
): categorySlug is keyof typeof knownResourceSettings {
  return (
    typeof categorySlug === "string" && categorySlug in knownResourceSettings
  );
}
export function getResourceSetting(
  categorySlug: string | number
): ResourceSetting | undefined {
  return isKnownResourceSetting(categorySlug)
    ? knownResourceSettings[categorySlug]
    : undefined;
}

// Helper function to validate and process a resource value based on its type
export function processResourceValue(
  key: string,
  /* eslint-disable @typescript-eslint/no-explicit-any */
  value: any,
  setting: ResourceSetting
): any {
  if (key in setting) {
    const { type, defaultValue } = setting[key];
    switch (type) {
      case "string":
        return typeof value === "string" ? value : (defaultValue ?? "");
      case "boolean":
        return typeof value === "boolean" ? value : (defaultValue ?? false);
      case "number":
        return typeof value === "number" ? value : (defaultValue ?? 0);
      case "date":
        return typeof value === "number"
          ? new Date(value * 1000).toISOString()
          : (defaultValue ?? "");
      default:
        return value;
    }
  }
  return value;
}
