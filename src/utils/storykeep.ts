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
  cleanHtmlAst,
  getGlobalNth,
  insertElementIntoMarkdown,
  removeElementFromMarkdown,
  updateHistory,
} from "@utils/compositor/markdownUtils.ts";
import { generateMarkdownLookup } from "@utils/compositor/generateMarkdownLookup.ts";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toMarkdown } from "mdast-util-to-markdown";
import { toHast } from "mdast-util-to-hast";
import type { Root as HastRoot, RootContent } from "hast";
import type { Root as MdastRoot } from "mdast";

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

const copyHrefDataBetweenAsts = (
  originalField: FieldWithHistory<MarkdownEditDatum>,
  foundLink: string,
  newField: FieldWithHistory<MarkdownEditDatum>
) => {
  const btns = originalField?.current?.payload?.optionsPayload?.buttons;
  if (!btns) return;

  const payload = btns[foundLink];
  if (!payload) return;

  let optionsPayload = newField?.current?.payload?.optionsPayload?.buttons;
  if (!optionsPayload) {
    optionsPayload = {};
    newField.current.payload.optionsPayload.buttons = optionsPayload;
  }
  optionsPayload[foundLink] = payload;
  delete btns[foundLink];
};

const copyMarkdownIfFound = (
  el: RootContent,
  originalField: FieldWithHistory<MarkdownEditDatum>,
  newField: FieldWithHistory<MarkdownEditDatum>
) => {
  if ("properties" in el) {
    const foundLink = el.properties.href?.toString();
    if (foundLink) {
      copyHrefDataBetweenAsts(originalField, foundLink, newField);
    }
  }
  if ("children" in el) {
    for (let i = 0; i < el.children.length; i++) {
      copyMarkdownIfFound(el.children[i], originalField, newField);
    }
  }
};

const isDragInitiatedFromListElement = (
  field: MdastRoot,
  outerIdx: number,
  idx: number | null
): boolean => {
  if (!field.children[outerIdx]) return false;

  const parent = field.children[outerIdx];
  if (parent) {
    if (idx && "children" in parent) {
      const nestedChildren = parent.children[idx];
      if (nestedChildren) {
        return (
          nestedChildren.type === "list" || nestedChildren.type === "listItem"
        );
      }
    }
    return parent.type === "list";
  }
  return false;
};

function handleBlockMovementBetweenPanels(
  mdast: MdastRoot,
  el1OuterIdx: number,
  el1PaneId: string,
  el1fragmentId: string,
  el1Idx: number | null,
  markdownLookup: MarkdownLookup,
  el2FragmentId: string,
  field: FieldWithHistory<MarkdownEditDatum>,
  el2OuterIdx: number,
  newHistory: HistoryEntry<MarkdownEditDatum>[]
) {
  const erasedEl = mdast.children.splice(el1OuterIdx, 1);
  eraseElement(el1PaneId, el1fragmentId, el1OuterIdx, el1Idx, markdownLookup);

  const hoverElField = cloneDeep(paneFragmentMarkdown.get()[el2FragmentId]);
  // grab original child because mdast loses some properties when it runs "toMarkdown"
  const originalChild = field.current.markdown.htmlAst.children[el1OuterIdx];
  copyMarkdownIfFound(originalChild, field, hoverElField);

  const secondMdast = fromMarkdown(hoverElField.current.markdown.body);
  secondMdast.children.unshift(erasedEl[0]);
  for (let i = 0; i < el2OuterIdx; ++i) {
    [secondMdast.children[i], secondMdast.children[i + 1]] = [
      secondMdast.children[i + 1],
      secondMdast.children[i],
    ];
  }

  hoverElField.current.markdown.body = toMarkdown(secondMdast);
  hoverElField.current.markdown.htmlAst = cleanHtmlAst(toHast(secondMdast) as HastRoot) as HastRoot;
  paneFragmentMarkdown.setKey(el2FragmentId, {
    ...hoverElField,
    current: hoverElField.current,
    history: newHistory,
  });
}

function handleListElementsMovementBetweenPanels(
  mdast: MdastRoot,
  el1OuterIdx: number,
  el1PaneId: string,
  el1fragmentId: string,
  el1Idx: number | null,
  markdownLookup: MarkdownLookup,
  el2FragmentId: string,
  field: FieldWithHistory<MarkdownEditDatum>,
  el2OuterIdx: number,
  el2Index: number|null,
  newHistory: HistoryEntry<MarkdownEditDatum>[]
) {
  if (el1Idx === null) return;
  const parent = mdast.children[el1OuterIdx];

  if(!parent || !("children" in parent)) return;

  const erasedEl = parent.children.splice(el1Idx, 1);
  eraseElement(el1PaneId, el1fragmentId, el1OuterIdx, el1Idx, markdownLookup);

  const hoverElField = cloneDeep(paneFragmentMarkdown.get()[el2FragmentId]);
  // grab original child because mdast loses some properties when it runs "toMarkdown"
  const originalChild = field.current.markdown.htmlAst.children[el1OuterIdx];
  copyMarkdownIfFound(originalChild, field, hoverElField);

  const secondMdast = fromMarkdown(hoverElField.current.markdown.body);
  let secondMdastParent = secondMdast.children;
  if(el2Index !== null && secondMdast.children[el2OuterIdx]) {
    const innerChildren = secondMdast.children[el2OuterIdx];
    if("children" in innerChildren) {
      secondMdastParent = innerChildren.children;
    }
  }
  secondMdastParent.unshift(erasedEl[0]);
  for (let i = 0; i < el2OuterIdx; ++i) {
    [secondMdastParent[i], secondMdastParent[i + 1]] = [secondMdastParent[i + 1], secondMdastParent[i],];
  }

  hoverElField.current.markdown.body = toMarkdown(secondMdast);
  hoverElField.current.markdown.htmlAst = cleanHtmlAst(toHast(secondMdast) as HastRoot) as HastRoot;
  paneFragmentMarkdown.setKey(el2FragmentId, {
    ...hoverElField,
    current: hoverElField.current,
    history: newHistory,
  });
}

function handleBlockMovementWithinTheSamePanel(
  mdast: MdastRoot,
  el1OuterIdx: number,
  el2OuterIdx: number,
  field: FieldWithHistory<MarkdownEditDatum>,
  el1fragmentId: string,
  newHistory: HistoryEntry<MarkdownEditDatum>[]
) {
  const ast = mdast;
  if (ast.children.length >= el1OuterIdx && ast.children.length >= el2OuterIdx) {
    if (el1OuterIdx < el2OuterIdx) {
      // swap elements top to bottom
      for (let i = el1OuterIdx; i < el2OuterIdx; i++) {
        [ast.children[i], ast.children[i + 1]] = [ast.children[i + 1], ast.children[i],];
      }
    } else {
      // swap elements bottom to top
      for (let i = el1OuterIdx; i > el2OuterIdx; i--) {
        [ast.children[i], ast.children[i - 1]] = [ast.children[i - 1], ast.children[i],];
      }
    }
  }
  field.current.markdown.body = toMarkdown(mdast);
  field.current.markdown.htmlAst = cleanHtmlAst(toHast(mdast) as HastRoot) as HastRoot;

  paneFragmentMarkdown.setKey(el1fragmentId, {
    ...field,
    current: field.current,
    history: newHistory,
  });
}

function handleListElementMovementWithinTheSamePanel(
  mdast: MdastRoot,
  el1OuterIdx: number,
  el1Index: number|null,
  el2Index: number|null,
  field: FieldWithHistory<MarkdownEditDatum>,
  el1fragmentId: string,
  newHistory: HistoryEntry<MarkdownEditDatum>[]
) {
  if(el1Index === null || el2Index === null) return;

  const parent = mdast.children[el1OuterIdx];
  if(!parent || !("children" in parent)) return;

  if (parent.children.length >= el1Index && parent.children.length >= el2Index) {
    if (el1Index < el2Index) {
      // swap elements top to bottom
      for (let i = el1OuterIdx; i < el2Index; i++) {
        [parent.children[i], parent.children[i + 1]] = [parent.children[i + 1], parent.children[i],];
      }
    } else {
      // swap elements bottom to top
      for (let i = el1Index; i > el2Index; i--) {
        [parent.children[i], parent.children[i - 1]] = [parent.children[i - 1], parent.children[i],];
      }
    }
  }
  field.current.markdown.body = toMarkdown(mdast);
  field.current.markdown.htmlAst = cleanHtmlAst(toHast(mdast) as HastRoot) as HastRoot;

  paneFragmentMarkdown.setKey(el1fragmentId, {
    ...field,
    current: field.current,
    history: newHistory,
  });
}

export function moveElements(
  markdownLookup: MarkdownLookup,
  el1fragmentId: string,
  el1OuterIdx: number,
  el1PaneId: string,
  el1Idx: number | null,
  el2FragmentId: string,
  el2OuterIdx: number,
  el2PaneId: string,
  el2Idx: number | null,
) {
  const field = cloneDeep(paneFragmentMarkdown.get()[el1fragmentId]);
  const mdast = fromMarkdown(field.current.markdown.body);
  const newHistory = updateHistory(field, Date.now());

  if (el1PaneId !== el2PaneId) {
    if(isDragInitiatedFromListElement(mdast, el1OuterIdx, el1Idx)) {
      handleListElementsMovementBetweenPanels(mdast, el1OuterIdx, el1PaneId, el1fragmentId, el1Idx, markdownLookup, el2FragmentId, field, el2OuterIdx, el2Idx, newHistory);
    } else {
      handleBlockMovementBetweenPanels(mdast, el1OuterIdx, el1PaneId, el1fragmentId, el1Idx, markdownLookup, el2FragmentId, field, el2OuterIdx, newHistory);
    }
  } else {
    if(isDragInitiatedFromListElement(mdast, el1OuterIdx, el1Idx)) {
      handleListElementMovementWithinTheSamePanel(mdast, el1OuterIdx, el1Idx, el2Idx, field, el1fragmentId, newHistory);
    } else {
      handleBlockMovementWithinTheSamePanel(mdast, el1OuterIdx, el2OuterIdx, field, el1fragmentId, newHistory);
    }
  }
}

export function insertElement(
  paneId: string,
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
  const currentField = cloneDeep(paneFragmentMarkdown.get()[fragmentId]);
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

export const eraseElement = (
  paneId: string,
  fragmentId: string,
  outerIdx: number,
  idx: number | null,
  markdownLookup: MarkdownLookup
) => {
  lastInteractedTypeStore.set(`markdown`);
  lastInteractedPaneStore.set(paneId);
  const currentField = cloneDeep(paneFragmentMarkdown.get()[fragmentId]);
  const now = Date.now();
  const newHistory = updateHistory(currentField, now);
  const newValue = removeElementFromMarkdown(
    currentField.current,
    outerIdx,
    idx,
    markdownLookup
  );
  paneFragmentMarkdown.setKey(fragmentId, {
    ...currentField,
    current: newValue,
    history: newHistory,
  });
  const isUnsaved = !isDeepEqual(newValue, currentField.original);
  unsavedChangesStore.setKey(paneId, {
    ...unsavedChangesStore.get()[paneId],
    paneFragmentMarkdown: isUnsaved,
  });
};
