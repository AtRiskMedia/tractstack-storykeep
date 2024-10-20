import { toolAddModes } from "./constants";
import type { Root } from "hast";
import type { MapStore } from "nanostores";

interface IndexedItem {
  parentNth: number;
  childNth: number;
}

export interface MarkdownLookup {
  images: { [key: number]: IndexedItem };
  codeItems: { [key: number]: IndexedItem };
  listItems: { [key: number]: IndexedItem };
  links: { [key: number]: IndexedItem };
  imagesLookup: { [parentNth: number]: { [childNth: number]: number } };
  codeItemsLookup: { [parentNth: number]: { [childNth: number]: number } };
  listItemsLookup: { [parentNth: number]: { [childNth: number]: number } };
  linksLookup: { [parentNth: number]: { [childNth: number]: number } };
}

export type ToolMode =
  | "insert"
  | "text"
  | "styles"
  | "settings"
  | "pane"
  | "eraser";
export type StoreKey =
  | "storyFragmentTitle"
  | "storyFragmentSlug"
  | "storyFragmentTractStackId"
  | "storyFragmentMenuId"
  | "storyFragmentPaneIds"
  | "storyFragmentSocialImagePath"
  | "storyFragmentTailwindBgColour"
  | "paneTitle"
  | "paneSlug"
  | "paneMarkdownBody"
  | "paneIsContextPane"
  | "paneIsHiddenPane"
  | "paneHasOverflowHidden"
  | "paneHasMaxHScreen"
  | "paneHeightOffsetDesktop"
  | "paneHeightOffsetTablet"
  | "paneHeightOffsetMobile"
  | "paneHeightRatioDesktop"
  | "paneHeightRatioTablet"
  | "paneHeightRatioMobile"
  | "paneFiles"
  | "paneCodeHook"
  | "paneImpression"
  | "paneHeldBeliefs"
  | "paneWithheldBeliefs";

export type ToolAddMode = (typeof toolAddModes)[number];

export interface ToggleEditModalEvent extends Event {
  detail: {
    preventHeaderScroll: boolean;
  };
}

export type EditModeValue = {
  id: string;
  mode: string;
  type:
    | "storyfragment"
    | "pane"
    | "context"
    | "tractstack"
    | "resource"
    | "menu"
    | "file";
};

export type StoreMapType = {
  [K in StoreKey]?: MapStore<Record<string, FieldWithHistory<string>>>;
};

export interface EventStreamController {
  stop: () => void;
}

export type ValidationFunction = (value: string) => boolean;

export type HistoryEntry<T> = {
  value: T;
  timestamp: number;
};

export type FieldWithHistory<T> = {
  current: T;
  original: T;
  history: HistoryEntry<T>[];
};

export interface IsInit {
  [key: string]: { init: boolean };
}

export interface Referrer {
  httpReferrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmTerm?: string;
  utmContent?: string;
}

export interface IAuthStoreLoginResponse {
  refreshToken: string | null;
  jwt: string | null;
  auth: boolean;
  knownLead: boolean;
  neo4jEnabled: boolean;
  firstname: string | null;
  fingerprint: string;
  encryptedEmail: string | null;
  encryptedCode: string | null;
  beliefs: object | null;
}

export interface IAxiosClientOptions {
  baseURL: string;
  timeout: number;
  headers: {
    [key: string]: string;
  };
}

export interface IAxiosClientProps {
  options: IAxiosClientOptions;
  getCurrentAccessToken: () => string | undefined;
  getCurrentRefreshToken: () => string | undefined;
  refreshTokenUrl: string | null;
  setRefreshedTokens: (response: IAuthStoreLoginResponse) => void;
  getAuthData: () => void;
  logout: (full?: boolean) => void;
}

export interface IAxiosRegisterProps {
  referrer: Referrer;
  fingerprint?: string;
  codeword?: string | undefined;
  email?: string | undefined;
  encryptedEmail?: string | undefined;
  encryptedCode?: string | undefined;
}

export interface IAxiosProfileProps {
  profile: {
    bio: string;
    codeword: string;
    email: string;
    firstname: string;
    init: boolean;
    persona: string;
  };
}

export interface PaneFragmentDatum {
  id: string;
  hiddenViewports: string;
}
export interface BgColourDatum extends PaneFragmentDatum {
  type: `bgColour`;
  bgColour: string;
}
export interface BgPaneDatum extends PaneFragmentDatum {
  type: `bgPane`;
  shape?: string;
  shapeDesktop?: string;
  shapeTablet?: string;
  shapeMobile?: string;
  optionsPayload: OptionsPayloadDatum;
}

export type ViewportKey = "mobile" | "tablet" | "desktop" | "auto" | null;

export type TupleValue = string | number | boolean;
export type Tuple =
  | [TupleValue]
  | [TupleValue, TupleValue]
  | [TupleValue, TupleValue, TupleValue];

export interface ClassNamesPayloadValue {
  [key: string]: string | string[];
}

export interface ClassNamesPayloadDatumValue {
  [key: string]: Tuple;
}
export interface ClassNamesPayloadDatumWrapper {
  [key: number]: ClassNamesPayloadDatumValue;
}

export interface ClassNamesPayload {
  [key: string]:
    | {
        classes: ClassNamesPayloadValue;
      }
    | string;
}
export interface ClassNamesPrePayload {
  [key: string]: TupleValue | TupleValue[];
}

export interface ClassNamesPayloadDatum {
  [key: string]: {
    classes: ClassNamesPayloadDatumValue | ClassNamesPayloadDatumWrapper;
    count?: number;
    override: {
      [key: string]: Tuple[];
    };
  };
}

export interface ClassNamesPayloadResult {
  all: string;
  mobile: string;
  tablet: string;
  desktop: string;
}

export interface OptionsPayloadDatum {
  classNamesPayload: ClassNamesPayloadDatum;
  classNamesParent?: ClassNamesPayload;
  classNamesModal?: ClassNamesPayload;
  classNames?: {
    all: ClassNamesPayloadValue;
    desktop?: ClassNamesPayloadValue;
    tablet?: ClassNamesPayloadValue;
    mobile?: ClassNamesPayloadValue;
  };
  buttons?: ButtonData;
  modal?: {
    [key: string]: {
      zoomFactor: number;
      paddingLeft: number;
      paddingTop: number;
    };
  };
  artpack?: {
    [key: string]: {
      image: string;
      collection: string;
      filetype: string;
      mode: string;
      objectFit: string;
      svgFill?: string;
    };
  };
}

export interface MarkdownPaneDatum extends PaneFragmentDatum {
  type: `markdown`;
  imageMaskShape: string;
  imageMaskShapeDesktop?: string;
  imageMaskShapeTablet?: string;
  imageMaskShapeMobile?: string;
  textShapeOutside: string;
  textShapeOutsideDesktop?: string;
  textShapeOutsideTablet?: string;
  textShapeOutsideMobile?: string;
  optionsPayload: OptionsPayloadDatum;
  isModal: boolean;
  markdownId?: string;
  markdownBody?: string;
}

export interface PaneOptionsPayload {
  id: string;
  paneFragmentsPayload?: BgPaneDatum[] | BgColourDatum[] | MarkdownPaneDatum[];
  impressions?: ImpressionDatum[];
  codeHook?: CodeHookDatum;
  hiddenPane?: boolean;
  overflowHidden?: boolean;
  maxHScreen?: boolean;
  heldBeliefs?: BeliefDatum[];
  withheldBeliefs?: BeliefDatum[];
}

export interface PaneDatum {
  id: string;
  title: string;
  slug: string;
  created: Date;
  changed: Date | null;
  markdown: MarkdownDatum;
  optionsPayload: PaneOptionsPayload;
  isContextPane: boolean;
  heightOffsetDesktop: number;
  heightOffsetMobile: number;
  heightOffsetTablet: number;
  heightRatioDesktop: string;
  heightRatioMobile: string;
  heightRatioTablet: string;
  files: FileDatum[];
}

export interface TursoPane {
  id: string;
  title: string;
  slug: string;
  created: string;
  changed: string | null;
  markdown_body: string;
  options_payload: string | null;
  is_context_pane: boolean;
  height_offset_desktop: number;
  height_offset_mobile: number;
  height_offset_tablet: number;
  height_ratio_desktop: string;
  height_ratio_mobile: string;
  height_ratio_tablet: string;
  files: TursoFileNode[];
}

export interface TursoPaneFiles {
  files: FileDatum[];
}

export type ContentMap = {
  id: string;
  slug: string;
  title: string;
  created: Date;
  changed: Date | null;
  type: `StoryFragment` | `Pane`;
  parentId?: string;
  parentSlug?: string;
  parentTitle?: string;
  panes?: string[];
  isContextPane?: boolean;
};

export interface TursoStoryFragmentMap {
  id: string;
  title: string;
  slug: string;
  tractstack_id: string;
  tractstack_title: string;
  tractstack_slug: string;
  pane_ids: string[];
}

export interface TursoPaneMap {
  id: string;
  slug: string;
  title: string;
  is_context_pane: boolean;
}

export interface ResourceDatum {
  title: string;
  slug: string;
  category: string | null;
  actionLisp: string;
  oneliner: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  optionsPayload: any;
  timeString?: string;
  dateString?: string;
  venue?: string;
}

export interface MarkdownDatum {
  body: string;
  slug: string;
  title: string;
  htmlAst: Root;
}

export interface TursoStoryFragment {
  id: string;
  title: string;
  slug: string;
  created: Date;
  changed: Date | null;
}

export interface ResourcePayloadDatum {
  perCodeHookPayload: { [key: number]: CodeHookDatum };
  perCodeHookOptions: { [key: number]: string };
  perCodeHookResourceCategory: { [key: number]: string[] };
  resources: ResourceDatum[];
  headerWidget: ResourceDatum[];
}

export interface TractStackDatum {
  id: string;
  title: string;
  slug: string;
  socialImagePath: string;
}

export interface StoryFragmentDatum {
  id: string;
  title: string;
  slug: string;
  tractStackId: string;
  tractStackTitle: string;
  tractStackSlug: string;
  created: Date;
  changed: Date | null;
  socialImagePath: string | null;
  tailwindBgColour: string | null;
  hasMenu: boolean;
  menuId: string | null;
  menuPayload: MenuDatum | null;
  panesPayload: PaneDatum[];
  impressions: ImpressionDatum[];
  resourcesPayload: ResourcePayloadDatum;
}

export interface ContextPaneDatum {
  id: string;
  title: string;
  slug: string;
  created: Date;
  changed: Date | null;
  panePayload: PaneDatum | null;
  impressions: ImpressionDatum[];
  resourcesPayload: ResourceDatum[];
  codeHookOptions: { [key: number]: string };
}

export interface BreakOptionsDatum {
  id: string;
  artpackMode: string;
  styles: { fill: string };
  shapeName: string;
}

export interface MaskOptionsDatum {
  id: string;
  artpackMode: string;
  classNamesParent: string;
  styles: {
    backgroundImage: string;
    backgroundSize: string;
    WebkitMaskImage: string;
    maskImage: string;
    maskRepeat: string;
    WebkitMaskSize: string;
    maskSize: string;
  };
}

export interface ShapeOptionsDatum {
  id: string;
  shapeName: string;
  classNamesParent: string;
  artpackMode: string | null;
}

export interface BeliefOptionDatum {
  id: number;
  slug: string;
  name: string;
  color: string;
}

export type BeliefStore = {
  id: string;
  slug: string;
  verb: string;
  object?: string;
};

export interface BeliefDatum {
  [key: string]: string | string[];
}

export interface DatumPayload {
  files: TursoFileNode[];
  tractstack: TractStackDatum[];
  menus: MenuDatum[];
  resources: ResourceDatum[];
}

export type GraphRelationshipDatum = {
  from?: number;
  to?: number;
  label: string;
  font: { align: string; size: string };
  arrows: {
    to: {
      enabled: boolean;
      type: string;
    };
  };
};

export type GraphNodeDatum = {
  id: string;
  title: string;
  label: string;
  color: string;
  value?: number;
};

export interface ImpressionDatum {
  id: string;
  title: string;
  body: string;
  buttonText: string;
  actionsLisp: string;
  parentId: string;
}

export interface MenuDatum {
  id: string;
  title: string;
  theme: string;
  optionsPayload: MenuLink[];
}

export interface MenuLink {
  name: string;
  description: string;
  featured: boolean;
  actionLisp: string;
  to: string;
  internal: boolean;
}

export interface StoryStep {
  id: string;
  slug: string;
  title: string;
  type: string;
}

export interface ContactPersona {
  id: string;
  description: string;
  title: string;
  disabled?: boolean;
}

export interface EventNode {
  type: string;
  slug?: string;
  title?: string;
  parentId?: string;
}
export interface EventNodes {
  [key: string]: EventNode;
}

export interface Event {
  id: string;
  type: string;
  verb: string;
  duration?: number;
  targetId?: string;
  score?: string;
  targetSlug?: string;
}
export interface Events {
  [key: string]: Event;
}

export type EventStream = {
  id: string;
  type: string;
  verb: string;
  targetId?: string;
  parentId?: string;
  duration?: number;
  score?: string;
  title?: string;
  targetSlug?: string;
  isContextPane?: string;
};

export type Site = {
  website: string;
  author: string;
  desc: string;
  title: string;
  ogImage?: string;
  ogLogo?: string;
};

export interface Current {
  id: string;
  slug: string;
  title: string;
  parentId?: string;
  parentSlug?: string;
  parentTitle?: string;
}

export type PanesVisible = {
  [key: string]: number | null;
};

export interface TursoFileNode {
  id: string;
  filename: string;
  url: string;
}

export interface FileNode {
  id: string;
  filename: string;
  src: string;
  optimizedSrc?: string;
}

export interface PaneFileNode {
  id: string;
  files: FileNode[];
}

export interface FileDatum {
  id: string;
  filename: string;
  altText: string;
  src: string;
  optimizedSrc?: string;
}

export interface StoryKeepFileDatum {
  filename: string;
  altText: string;
  b64: string;
}

export type GraphNode = {
  id?: string;
  startNodeId?: number;
  endNodeId?: number;
  labels?: string[];
  type?: string;
  properties?: {
    name?: string;
    created_at?: number;
    visit_id?: string;
    object_type?: string;
    object_name?: string;
    object?: string;
    fingerprint_id?: string;
    belief_id?: string;
    pageRank?: number;
  };
};
export interface GraphNodes {
  [key: string]: GraphNode | null;
}

export interface StylesVersion {
  v: number;
}

export interface CodeHookDatum {
  target: string;
  url: string | undefined;
  options: string | undefined;
  height: string | undefined;
  width: string | undefined;
}

export interface ButtonData {
  urlTarget: string;
  callbackPayload: string;
  className: string;
  classNamesPayload: ClassNamesPayload;
  classNameDesktop?: string;
  classNameTablet?: string;
  classNameMobile?: string;
}

export interface ResourceDatumEventProps {
  title: string;
  slug: string;
  category: string | null;
  actionLisp: string;
  oneliner: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  optionsPayload: any;
  timeString: string;
  dateString: string;
  venue: string;
}
