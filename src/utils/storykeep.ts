import { useCallback, useRef, useState } from "react";
import {
  editModeStore,
  lastInteractedPaneStore,
  lastInteractedTypeStore,
  paneCodeHook,
  paneFiles,
  paneFragmentBgColour,
  paneFragmentBgPane,
  paneFragmentIds,
  paneFragmentMarkdown,
  paneHasMaxHScreen,
  paneHasOverflowHidden,
  paneHeightOffsetDesktop,
  paneHeightOffsetMobile,
  paneHeightOffsetTablet,
  paneHeightRatioDesktop,
  paneHeightRatioMobile,
  paneHeightRatioTablet,
  paneHeldBeliefs,
  paneImpression,
  paneIsHiddenPane,
  paneSlug,
  paneTitle,
  paneWithheldBeliefs,
  storyFragmentMenuId,
  storyFragmentPaneIds,
  storyFragmentSlug,
  storyFragmentSocialImagePath,
  storyFragmentTailwindBgColour,
  storyFragmentTitle,
  temporaryErrorsStore,
  uncleanDataStore,
  unsavedChangesStore,
} from "../store/storykeep";
import { cloneDeep, isDeepEqual } from "./helpers";
import {
  MAX_HISTORY_LENGTH,
  MS_BETWEEN_UNDO,
  reservedSlugs,
  SHORT_SCREEN_THRESHOLD,
  toolAddModeInsertDefault,
} from "../constants";
import type {
  FieldWithHistory,
  HistoryEntry,
  MarkdownEditDatum,
  MarkdownLookup,
  StoreKey,
  StoreMapType,
  ToolAddMode,
  ValidationFunction,
} from "../types";
import {
  getGlobalNth,
  insertElementIntoMarkdown,
  updateHistory,
} from "@utils/compositor/markdownUtils.ts";
import { generateMarkdownLookup } from "@utils/compositor/generateMarkdownLookup.ts";

const BREAKPOINTS = {
  xl: 1367,
};

const storeMap: StoreMapType = {
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTailwindBgColour,
  storyFragmentSocialImagePath,
  storyFragmentMenuId,
  storyFragmentPaneIds,
  paneFragmentMarkdown,
  paneFragmentBgPane,
  paneTitle,
  paneSlug,
  paneIsHiddenPane,
  paneHasOverflowHidden,
  paneHasMaxHScreen,
  paneHeightOffsetDesktop,
  paneHeightOffsetMobile,
  paneHeightOffsetTablet,
  paneHeightRatioDesktop,
  paneHeightRatioMobile,
  paneHeightRatioTablet,
  paneHeldBeliefs,
  paneWithheldBeliefs,
  paneCodeHook,
  paneImpression,
  paneFiles,
  paneFragmentIds,
  paneFragmentBgColour,
  // Add other stores here
};

export function createFieldWithHistory<T>(value: T): FieldWithHistory<T> {
  return {
    current: value,
    original: value,
    history: [],
  };
}

const preValidationFunctions: Partial<Record<StoreKey, ValidationFunction>> = {
  storyFragmentTailwindBgColour: (value: string) => value.length <= 20,
  storyFragmentTitle: (value: string) => value.length <= 80,
  storyFragmentSlug: (value: string) =>
    value.length === 0 || (value.length <= 50 && /^[a-z0-9-]*$/.test(value)),
  storyFragmentSocialImagePath: (value: string) =>
    value.length <= 80 &&
    /^\/?([\w-.]+(?:\/[\w-.]+)*\/?)?[\w-]*\.?(?:png|jpg)?$/.test(value),
  storyFragmentMenuId: (value: string) => value.length <= 32,
  paneTitle: (value: string) => value.length <= 80,
  paneSlug: (value: string) =>
    value.length === 0 || (value.length <= 50 && /^[a-z0-9-]*$/.test(value)),
  // Add more pre-validation functions for other fields as needed
};

const validationFunctions: Partial<Record<StoreKey, ValidationFunction>> = {
  storyFragmentTailwindBgColour: (value: string) =>
    value.length > 0 && value.length <= 20,
  storyFragmentTitle: (value: string) => value.length > 0 && value.length <= 80,
  storyFragmentSlug: (value: string) =>
    value.length > 0 &&
    value.length <= 50 &&
    /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(value),
  storyFragmentSocialImagePath: (value: string) =>
    value.length === 0 ||
    (value.length > 0 &&
      value.length <= 80 &&
      /^\/?([\w-.]+(?:\/[\w-.]+)*\/)?[\w-]+\.(?:png|jpg)$/.test(value)),
  storyFragmentMenuId: (value: string) =>
    value.length > 0 && value.length <= 32,
  paneTitle: (value: string) => value.length > 0 && value.length <= 80,
  paneSlug: (value: string) =>
    value.length > 0 &&
    value.length <= 50 &&
    /^[a-z](?:[a-z0-9-]*[a-z0-9])?$/.test(value),
  // Add more validation functions for other fields as needed
};

const initializeLastUpdateTime = (
  storeMap: StoreMapType
): Record<StoreKey, number> => {
  return Object.keys(storeMap).reduce(
    (acc, key) => {
      acc[key as StoreKey] = 0;
      return acc;
    },
    {} as Record<StoreKey, number>
  );
};

export const useStoryKeepUtils = (id: string, usedSlugs?: string[]) => {
  const [isEditing, setIsEditing] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});
  const lastUpdateTimeRef = useRef<Record<StoreKey, number>>(
    initializeLastUpdateTime(storeMap)
  );

  const setTemporaryError = useCallback(
    (storeKey: StoreKey) => {
      temporaryErrorsStore.setKey(id, {
        ...(temporaryErrorsStore.get()[id] || {}),
        [storeKey]: true,
      });
      setTimeout(() => {
        temporaryErrorsStore.setKey(id, {
          ...(temporaryErrorsStore.get()[id] || {}),
          [storeKey]: false,
        });
      }, 5000);
    },
    [id]
  );

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const updateStoreField = (
    storeKey: StoreKey,
    newValue: any,
    otherId?: string
  ): boolean => {
    const thisId = otherId || id;
    const store = storeMap[storeKey];
    if (!store) {
      console.log(`${storeKey} not found in allowed stores`);
      return false;
    }

    const isValid =
      isValidValue(storeKey, newValue) &&
      ([`paneSlug`, `storyFragmentSlug`].includes(storeKey)
        ? !(
            reservedSlugs.includes(newValue) ||
            (usedSlugs && usedSlugs.includes(newValue))
          )
        : true);
    const isPreValid = isPreValidValue(storeKey, newValue);
    if (!isPreValid) {
      // don't save to undo if preValid fails
      // contentEditable also rejects when return false
      setTemporaryError(storeKey);
      return false;
    }
    if (!isValid || !isPreValidValue) {
      uncleanDataStore.setKey(thisId, {
        ...(uncleanDataStore.get()[thisId] || {}),
        [storeKey]: true,
      });
    } else {
      uncleanDataStore.setKey(thisId, {
        ...(uncleanDataStore.get()[thisId] || {}),
        [storeKey]: false,
      });
    }

    const currentStoreValue = store.get();
    const currentField = currentStoreValue[thisId];
    if (
      currentField &&
      isPreValid &&
      !isDeepEqual(newValue, currentField.current)
    ) {
      const now = Date.now();
      const newHistory = updateHistory(storeKey, currentField, now);
      const newField = createNewField(currentField, newValue, newHistory);
      store.set({
        ...currentStoreValue,
        [thisId]: newField,
      });
      const isUnsaved = !isDeepEqual(newValue, newField.original);
      unsavedChangesStore.setKey(thisId, {
        ...(unsavedChangesStore.get()[thisId] || {}),
        [storeKey]: isUnsaved,
      });
    }
    return true;
  };

  const isPreValidValue = (storeKey: StoreKey, value: string): boolean => {
    const preValidationFunction = preValidationFunctions[storeKey];
    return !preValidationFunction || preValidationFunction(value);
  };
  const isValidValue = (storeKey: StoreKey, value: string): boolean => {
    const validationFunction = validationFunctions[storeKey];
    return !validationFunction || validationFunction(value);
  };

  const updateHistory = (
    storeKey: StoreKey,
    currentField: FieldWithHistory<string>,
    now: number
  ): HistoryEntry<string>[] => {
    const timeSinceLastUpdate =
      now - (lastUpdateTimeRef.current[storeKey] || 0);
    const newHistory = [...currentField.history];
    if (timeSinceLastUpdate > MS_BETWEEN_UNDO) {
      newHistory.unshift({ value: currentField.current, timestamp: now });
      if (newHistory.length > MAX_HISTORY_LENGTH) {
        // Remove the second oldest entry, not the first one
        newHistory.splice(-2, 1);
      }
      lastUpdateTimeRef.current[storeKey] = now;
    }
    return newHistory;
  };

  const createNewField = (
    currentField: FieldWithHistory<string>,
    newValue: string,
    newHistory: HistoryEntry<string>[]
  ): FieldWithHistory<string> => ({
    current: newValue,
    original: currentField.original,
    history: newHistory,
  });

  const handleUndo = useCallback(
    (storeKey: StoreKey, id: string) => {
      const store = storeMap[storeKey];
      if (!store) return;
      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      if (currentField && currentField.history.length > 1) {
        store.setKey(id, {
          current: currentField.history[0].value,
          original: currentField.original,
          history: currentField.history.slice(1),
        });
      }
      if (currentField && currentField.history.length === 1) {
        store.setKey(id, {
          current: currentField.original,
          original: currentField.original,
          history: [], // Clear the history
        });
      }
      unsavedChangesStore.setKey(id, {
        ...(unsavedChangesStore.get()[id] || {}),
        [storeKey]: false,
      });
    },
    [storeMap]
  );

  const handleEditingChange = useCallback(
    (storeKey: StoreKey, editing: boolean) => {
      if (editing) {
        setIsEditing(prev => ({ ...prev, [storeKey]: true }));
      } else {
        setTimeout(() => {
          setIsEditing(prev => ({ ...prev, [storeKey]: false }));
        }, 100);
      }
    },
    []
  );

  return {
    isEditing,
    updateStoreField,
    handleUndo,
    handleEditingChange,
  };
};

export const isFullScreenEditModal = (mode: string) => {
  const isShortScreen = window.innerHeight <= SHORT_SCREEN_THRESHOLD;
  const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
  return mode === "settings" && isShortScreen && !isDesktop;
};

export function insertElement(
  paneId: string,
  obj: FieldWithHistory<MarkdownEditDatum>,
  fragmentId: string,
  toolAddMode: ToolAddMode,
  isEmpty: boolean,
  markdownLookup: MarkdownLookup,
  outerIdx: number,
  idx: number | null,
  position: "before" | "after"
) {
  lastInteractedTypeStore.set(`markdown`);
  lastInteractedPaneStore.set(paneId);
  const currentField = cloneDeep(obj);
  const now = Date.now();
  const newHistory = updateHistory(currentField, now);
  const newContent = toolAddModeInsertDefault[toolAddMode];
  const parentTag = isEmpty ? null : markdownLookup.nthTag[outerIdx];
  const newImgContainer = toolAddMode === `img` && parentTag !== `ul`;
  const newAsideContainer = toolAddMode === `aside` && parentTag !== `ol`;
  const thisNewContent = newImgContainer
    ? `* ${newContent}`
    : newAsideContainer
      ? `1. ${newContent}`
      : newContent;
  const thisIdx = newAsideContainer ? null : idx;
  const thisOuterIdx = isEmpty ? 0 : outerIdx;
  const thisPosition = isEmpty ? "before" : position;
  const newValue = insertElementIntoMarkdown(
    currentField.current,
    thisNewContent,
    toolAddMode,
    thisOuterIdx,
    thisIdx,
    thisPosition,
    markdownLookup
  );
  const newMarkdownLookup = generateMarkdownLookup(newValue.markdown.htmlAst);
  let newOuterIdx = thisOuterIdx;
  let newIdx = thisIdx || 0;
  if (position === "after" && !isEmpty) {
    if (
      Object.keys(markdownLookup.nthTag).length <
      Object.keys(newMarkdownLookup.nthTag).length
    ) {
      newOuterIdx = outerIdx + 1;
      newIdx = 0;
    } else if (typeof idx === `number`) {
      newIdx = idx + 1;
    }
  }
  const newTag =
    toolAddMode === "img"
      ? `img`
      : [`code`, `img`, `yt`, `bunny`, `belief`, `toggle`, `identify`].includes(
            toolAddMode
          )
        ? `code`
        : toolAddMode === `aside`
          ? `li`
          : toolAddMode;
  const newGlobalNth =
    getGlobalNth(newTag, newIdx, newOuterIdx, newMarkdownLookup) || 0;

  if (
    [
      `img`,
      `code`,
      `img`,
      `yt`,
      `bunny`,
      `belief`,
      `toggle`,
      `identify`,
    ].includes(toolAddMode)
  ) {
    editModeStore.set({
      id: paneId,
      mode: "styles",
      type: "pane",
      targetId: {
        paneId,
        outerIdx: newOuterIdx,
        idx: newIdx,
        globalNth: newGlobalNth,
        tag: newTag,
        mustConfig: true,
      },
    });
  }
  paneFragmentMarkdown.setKey(fragmentId, {
    ...currentField,
    current: newValue,
    history: newHistory,
  });
  unsavedChangesStore.setKey(paneId, {
    ...unsavedChangesStore.get()[paneId],
    paneFragmentMarkdown: true,
  });
}