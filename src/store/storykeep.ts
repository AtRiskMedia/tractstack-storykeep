import { atom, map } from "nanostores";
import type {
  Analytics,
  BeliefDatum,
  BgColourDatum,
  BgPaneDatum,
  CodeHookDatum,
  CreationState,
  DashboardAnalytics,
  EditModeValue,
  EnvSetting,
  FieldWithHistory,
  FileDatum,
  ImpressionDatum,
  IsInit,
  MarkdownEditDatum, MarkdownLookup,
  MenuDatum,
  ResourceDatum,
  StoreKey,
  StoryKeepFileDatum,
  StylesMemory,
  Theme,
  ToolAddMode,
  ToolMode,
  TractStackDatum,
} from "../types";
import { knownEnvSettings, PUBLIC_THEME, toolAddModes } from "../constants";
import type { ControlPosition } from "react-draggable";
import { createNodeId } from "@utils/helpers.ts";
import type { Root } from "hast";

export const themeStore = atom<Theme>(PUBLIC_THEME as Theme);

export const lastInteractedPaneStore = atom<string | null>(null);
export const visiblePanesStore = map<Record<string, boolean>>({});
export const lastInteractedTypeStore = atom<"markdown" | "bgpane" | null>(null);

export const envSettings = map<{
  current: EnvSetting[];
  original: EnvSetting[];
  history: { value: EnvSetting[]; timestamp: number }[];
}>({
  current: knownEnvSettings,
  original: knownEnvSettings,
  history: [],
});

export const creationStateStore = atom<CreationState>({
  id: null,
  isInitialized: false,
});

// all look-ups by ulid
//

export const showAnalytics = atom<boolean>(false);
export const storedAnalytics = map<Analytics>();
export const storedDashboardAnalytics = map<DashboardAnalytics>();
export const analyticsDuration = atom<`daily` | `weekly` | `monthly`>(`weekly`);

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

// ==========================
// Drag n Drop
// ==========================
export enum Location {
  NOWHERE = -1,
  BEFORE = 0,
  AFTER = 1,
}

export interface DragNode {
  fragmentId: string;
  paneId: string;
  idx: number | null;
  outerIdx: number;
}

export interface DragState extends DragNode {
  location: "before" | "after";
  markdownLookup: MarkdownLookup;
}

export interface DragShape extends DragNode {
  root: Root;
}

export type DragHandle = {
  pos: ControlPosition;
  ghostHeight: number;
  ghostWidth: number;
  hoverElement: DragState | null;
  affectedFragments: Set<string>;
  affectedPanes: Set<string>;
  dropState: DragState | null;
  dragShape: DragShape | null;
};

const EMPTY_DRAG_HANDLE: DragHandle = {
  pos: { x: 0, y: 0 },
  ghostHeight: 0,
  ghostWidth: 0,
  hoverElement: null,
  dropState: null,
  affectedFragments: new Set<string>(),
  affectedPanes: new Set<string>(),
  dragShape: null,
};

export const resetDragStore = () => dragHandleStore.set(EMPTY_DRAG_HANDLE);

export const setDragShape = (shape: DragShape|null) => {
  dragHandleStore.set({
    ...dragHandleStore.get(),
    dragShape: shape
  });
}

export const dropDraggingElement = () => {
  const existingEl = dragHandleStore.get()?.hoverElement || null;
  dragHandleStore.set({
    ...dragHandleStore.get(),
    hoverElement: null,
    dropState: existingEl,
  });
};

export const recordExitPane = (paneId: string) => {
  if (!dragHandleStore.get().affectedPanes.has(paneId)) return;

  const panes = new Set<string>(dragHandleStore.get().affectedPanes);
  panes.delete(paneId);
  if (panes.size === 0) {
    console.log("no panes recorded, clear all affected fragments");
    resetDragStore();
  } else {
    dragHandleStore.set({ ...dragHandleStore.get(), affectedPanes: panes });
  }
};

export const setDragHoverInfo = (el: DragState | null) => {
  const existingEl = dragHandleStore.get().hoverElement;
  if (existingEl) {
    if (
      existingEl.paneId === el?.paneId &&
      existingEl.fragmentId === el?.fragmentId &&
      existingEl.location === el.location &&
      existingEl.idx === el.idx &&
      existingEl.outerIdx === el.outerIdx
    )
      return;
  }

  const nodes = new Set<string>(dragHandleStore.get().affectedFragments);
  if (el) {
    nodes.add(createNodeId(el));
  }
  const panes = new Set<string>(dragHandleStore.get().affectedPanes);
  if (el) {
    panes.add(el.paneId);
  }
  dragHandleStore.set({
    ...dragHandleStore.get(),
    hoverElement: el,
    affectedPanes: panes,
    affectedFragments: nodes,
  });
};

export const setDragPosition = (pos: ControlPosition) => {
  dragHandleStore.set({
    ...dragHandleStore.get(),
    pos,
  });
  //console.log("drag pos: " + JSON.stringify(pos));
};

export const setGhostSize = (w: number, h: number) => {
  dragHandleStore.set({
    ...dragHandleStore.get(),
    ghostWidth: w,
    ghostHeight: h,
  });
};

export const dragHandleStore = atom<DragHandle>(EMPTY_DRAG_HANDLE);

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
