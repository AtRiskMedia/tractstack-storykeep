import { map, atom } from "nanostores";
import type {
  BeliefDatum,
  BgPaneDatum,
  BgColourDatum,
  MarkdownPaneDatum,
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
} from "../types";
import { toolAddModes } from "../constants";

// all look-ups by ulid
//

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
export const activeEditModalStore = atom<"desktop" | "mobile" | null>(null);
export const viewportStore = map<{
  value: "auto" | "mobile" | "tablet" | "desktop";
}>({
  value: "auto",
});
export const toolModeStore = map<{ value: ToolMode }>({
  value: "text",
});
export const toolAddModeStore = map<{ value: ToolAddMode }>({
  value: toolAddModes[0], // Default to the first mode
});

export const editModeStore = atom<EditModeValue | null>(null);

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
export const paneMarkdownBody = map<Record<string, FieldWithHistory<string>>>();
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
  map<Record<string, FieldWithHistory<CodeHookDatum>>>();
export const paneImpression =
  map<Record<string, FieldWithHistory<ImpressionDatum>>>();
export const paneHeldBeliefs =
  map<Record<string, FieldWithHistory<BeliefDatum[]>>>();
export const paneWithheldBeliefs =
  map<Record<string, FieldWithHistory<BeliefDatum[]>>>();

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
  map<Record<string, FieldWithHistory<MarkdownPaneDatum>>>();
