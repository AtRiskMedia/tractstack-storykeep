import { map, atom } from "nanostores";
import type {
  BeliefDatum,
  BgPaneDatum,
  BgColourDatum,
  MarkdownEditDatum,
  FieldWithHistory,
  FileDatum,
  MenuDatum,
  ResourceDatum,
  StoryKeepFileDatum,
  TractStackDatum,
  CodeHookDatum,
  ImpressionDatum,
  IsInit,
  StoreKey,
  ToolMode,
  ToolAddMode,
  EditModeValue,
  StylesMemory,
  EnvSetting,
} from "../types";
import { toolAddModes } from "../constants";

export const mockEnvSettings: EnvSetting[] = [
  {
    name: "PRIVATE_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    value: "shpat_1234567890abcdefghijklmnopqrstuv",
    type: "string",
    description: "Private access token for Shopify Storefront API",
  },
  {
    name: "PUBLIC_SHOPIFY_SHOP",
    value: "my-awesome-shop.myshopify.com",
    type: "string",
    description: "Your Shopify store URL",
  },
  {
    name: "PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN",
    value: "shpat_9876543210zyxwvutsrqponmlkjihgf",
    type: "string",
    description: "Public access token for Shopify Storefront API",
  },
  {
    name: "DRUPAL_BASE_URL",
    value: "https://my-drupal-site.com",
    type: "string",
    description: "Base URL for your Drupal installation",
  },
  {
    name: "PRIVATE_CONCIERGE_BASE_URL",
    value: "https://api.concierge.example.com",
    type: "string",
    description: "Base URL for the private Concierge API",
  },
  {
    name: "PUBLIC_CONCIERGE_STYLES_URL",
    value: "https://styles.concierge.example.com",
    type: "string",
    description: "URL for public Concierge styles",
  },
  {
    name: "PUBLIC_SITE_URL",
    value: "https://www.myawesomesite.com",
    type: "string",
    description: "Public URL of your site",
  },
  {
    name: "PUBLIC_STORYKEEP_URL",
    value: "https://storykeep.myawesomesite.com",
    type: "string",
    description: "URL for StoryKeep",
  },
  {
    name: "PUBLIC_IMAGE_URL",
    value: "https://images.myawesomesite.com",
    type: "string",
    description: "Base URL for public images",
  },
  {
    name: "PUBLIC_SOCIALS",
    value: "facebook.com/mypage|twitter.com/myhandle|instagram.com/myprofile",
    type: "string[]",
    description: "Social media links (pipe-separated)",
  },
  {
    name: "PUBLIC_FOOTER",
    value: "© 2024 My Awesome Company. All rights reserved.",
    type: "string",
    description: "Footer text for the website",
  },
  {
    name: "PUBLIC_HOME",
    value: "home",
    type: "string",
    description: "Slug for the home page",
  },
  {
    name: "PUBLIC_IMPRESSIONS_DELAY",
    value: "5000",
    type: "number",
    description: "Delay (in milliseconds) before showing impressions",
  },
  {
    name: "PUBLIC_SLOGAN",
    value: "Building awesome websites, one story at a time",
    type: "string",
    description: "Your company's slogan",
  },
  {
    name: "PUBLIC_READ_THRESHOLD",
    value: "42000",
    type: "number",
    description: "Threshold for considering content as read (in milliseconds)",
  },
  {
    name: "PUBLIC_SOFT_READ_THRESHOLD",
    value: "7000",
    type: "number",
    description:
      "Soft threshold for considering content as read (in milliseconds)",
  },
  {
    name: "PUBLIC_WORDMARK_MODE",
    value: "default",
    type: "string",
    description: "Wordmark mode (default, logo, or wordmark)",
  },
  {
    name: "PUBLIC_GOOGLE_SITE_VERIFICATION",
    value: "googleXXXXXXXXXXXXXXXX",
    type: "string",
    description: "Google site verification code",
  },
  {
    name: "TURSO_DATABASE_URL",
    value: "libsql://my-db-name.turso.io",
    type: "string",
    description: "URL for Turso database",
  },
  {
    name: "TURSO_AUTH_TOKEN",
    value: "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2...",
    type: "string",
    description: "Authentication token for Turso",
  },
  {
    name: "PRIVATE_AUTH_SECRET",
    value: "my-super-secret-auth-key",
    type: "string",
    description: "Private authentication secret",
  },
  {
    name: "PUBLIC_USE_CUSTOM_FONTS",
    value: "false",
    type: "boolean",
    description: "Whether to use custom fonts",
  },
  {
    name: "PRIVATE_OPEN_DEMO",
    value: "true",
    type: "boolean",
    description: "Whether the site is in open demo mode",
  },
];

export const lastInteractedPaneStore = atom<string | null>(null);
export const visiblePanesStore = map<Record<string, boolean>>({});
export const lastInteractedTypeStore = atom<"markdown" | "bgpane" | null>(null);

export const envSettings = map<{
  current: EnvSetting[];
  original: EnvSetting[];
  history: { value: EnvSetting[]; timestamp: number }[];
}>({
  current: mockEnvSettings,
  original: mockEnvSettings,
  history: [],
});

// all look-ups by ulid
//

export const showAnalytics = atom<boolean>(false);

// storykeep state
export const unsavedChangesStore = map<
  Record<string, Record<StoreKey, boolean>>
>({});
export const uncleanDataStore = map<Record<string, Record<StoreKey, boolean>>>(
  {}
);
export const temporaryErrorsStore = map<
  Record<string, Record<StoreKey, boolean>>
>({});
export const viewportKeyStore = map<{
  value: "mobile" | "tablet" | "desktop";
}>({
  value: "mobile",
});
export const viewportStore = map<{
  value: "auto" | "mobile" | "tablet" | "desktop";
}>({
  value: "auto",
});
export const viewportSetStore = atom<boolean>(false);
export const toolModeStore = map<{ value: ToolMode }>({
  value: "text",
});
export const toolAddModeStore = map<{ value: ToolAddMode }>({
  value: toolAddModes[0], // Default to the first mode
});

export const editModeStore = atom<EditModeValue | null>(null);

// styles memory
export const stylesMemoryStore = map<StylesMemory>({});

// datums from turso
export const menu = map<Record<string, FieldWithHistory<MenuDatum>>>();
export const file = map<Record<string, FieldWithHistory<StoryKeepFileDatum>>>();
export const resource = map<Record<string, FieldWithHistory<ResourceDatum>>>();
export const tractstack =
  map<Record<string, FieldWithHistory<TractStackDatum>>>();

export const storyFragmentInit = map<IsInit>();
export const paneInit = map<IsInit>();
export const storyFragmentUnsavedChanges = map<IsInit>();
export const paneUnsavedChanges = map<IsInit>();

export const storyFragmentTitle =
  map<Record<string, FieldWithHistory<string>>>();
export const storyFragmentSlug =
  map<Record<string, FieldWithHistory<string>>>();
export const storyFragmentTractStackId =
  map<Record<string, FieldWithHistory<string>>>();
export const storyFragmentMenuId =
  map<Record<string, FieldWithHistory<string>>>();
export const storyFragmentPaneIds =
  map<Record<string, FieldWithHistory<string[]>>>();
export const storyFragmentSocialImagePath =
  map<Record<string, FieldWithHistory<string>>>();
export const storyFragmentTailwindBgColour =
  map<Record<string, FieldWithHistory<string>>>();

export const paneTitle = map<Record<string, FieldWithHistory<string>>>();
export const paneSlug = map<Record<string, FieldWithHistory<string>>>();
export const paneMarkdownFragmentId =
  map<Record<string, FieldWithHistory<string>>>();
export const paneIsContextPane =
  map<Record<string, FieldWithHistory<boolean>>>();
export const paneIsHiddenPane =
  map<Record<string, FieldWithHistory<boolean>>>();
export const paneHasOverflowHidden =
  map<Record<string, FieldWithHistory<boolean>>>();
export const paneHasMaxHScreen =
  map<Record<string, FieldWithHistory<boolean>>>();
export const paneHeightOffsetDesktop =
  map<Record<string, FieldWithHistory<number>>>();
export const paneHeightOffsetTablet =
  map<Record<string, FieldWithHistory<number>>>();
export const paneHeightOffsetMobile =
  map<Record<string, FieldWithHistory<number>>>();
export const paneHeightRatioDesktop =
  map<Record<string, FieldWithHistory<string>>>();
export const paneHeightRatioTablet =
  map<Record<string, FieldWithHistory<string>>>();
export const paneHeightRatioMobile =
  map<Record<string, FieldWithHistory<string>>>();
export const paneFiles = map<Record<string, FieldWithHistory<FileDatum[]>>>();
export const paneCodeHook =
  map<Record<string, FieldWithHistory<CodeHookDatum | null>>>();
export const paneImpression =
  map<Record<string, FieldWithHistory<ImpressionDatum | null>>>();
export const paneHeldBeliefs =
  map<Record<string, FieldWithHistory<BeliefDatum>>>();
export const paneWithheldBeliefs =
  map<Record<string, FieldWithHistory<BeliefDatum>>>();

// pane fragments have no ids ...
// PaneDatum has an array of BgPaneDatum, BgColourDatum, MarkdownPaneDatum
// the nanostore state is derived from PaneDatum;
// paneFragment ids are generated during this process and linked accordingly
// on save, paneFragmentsPayload as json object is generated
export const paneFragmentIds =
  map<Record<string, FieldWithHistory<string[]>>>();
export const paneFragmentBgPane =
  map<Record<string, FieldWithHistory<BgPaneDatum>>>();
export const paneFragmentBgColour =
  map<Record<string, FieldWithHistory<BgColourDatum>>>();
export const paneFragmentMarkdown =
  map<Record<string, FieldWithHistory<MarkdownEditDatum>>>();
