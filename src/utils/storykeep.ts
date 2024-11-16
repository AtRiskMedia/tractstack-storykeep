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
import {
  cloneDeep,
  getHtmlTagFromMdast,
  isDeepEqual,
  findIndicesFromLookup,
  swapObjectValues, extractEntriesAtIndex, getNthFromAstUsingElement, removeAt,
} from "./helpers";
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
  OptionsPayloadDatum,
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
import type { Root, Root as HastRoot, RootContent } from "hast";
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
  if (el && "properties" in el) {
    const foundLink = el.properties.href?.toString();
    if (foundLink) {
      copyHrefDataBetweenAsts(originalField, foundLink, newField);
    }
  }
  if (el && "children" in el) {
    for (let i = 0; i < el.children.length; i++) {
      copyMarkdownIfFound(el.children[i], originalField, newField);
    }
  }
};

const isElementInList = (
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
  el1OuterIdx: number,
  el1PaneId: string,
  el1fragmentId: string,
  el1Idx: number | null,
  markdownLookup: MarkdownLookup,
  newMarkdownLookup: MarkdownLookup,
  el2fragmentId: string,
  field: FieldWithHistory<MarkdownEditDatum>,
  el2OuterIdx: number,
  el2Idx: number | null,
  newHistory: HistoryEntry<MarkdownEditDatum>[]
) {
  const originalFieldCopy = {...field};
  const elToErase = field.current.markdown.htmlAst.children[el1OuterIdx];

  const originalNth = getNthFromAstUsingElement(field.current.markdown.htmlAst, elToErase);
  const erasedEl = field.current.markdown.htmlAst.children.splice(el1OuterIdx, 1)[0];
  //eraseElement(el1PaneId, el1fragmentId, el1OuterIdx, el1Idx, markdownLookup);

  const newField = cloneDeep(paneFragmentMarkdown.get()[el2fragmentId]);
  // grab original child because mdast loses some properties when it runs "toMarkdown"
  copyMarkdownIfFound(erasedEl, field, newField);
  paneFragmentMarkdown.setKey(el1fragmentId, {
    ...field,
    current: field.current,
    history: newHistory,
  });

  const secondAst = newField.current.markdown.htmlAst;
  console.log(secondAst);

  let isListElement = false;
  let secondAstParent = secondAst.children;
  if (el2Idx !== null && secondAst.children[el2OuterIdx]) {
    const innerChildren = secondAst.children[el2OuterIdx];
    if ("children" in innerChildren) {
      isListElement = true;
      secondAstParent = innerChildren.children;
    }
  }

  // @ts-expect-error tagName exists
  const curTag = erasedEl.tagName || "";
  let newTag = curTag;
  if (isListElement) {
    // @ts-expect-error children exists
    newTag = "li" || "";
    if ("tagName" in erasedEl) {
      erasedEl.tagName = "li";
    }
  }

  //if (isListElement) {
  //  erasedEl.type = "listItem";
  //}
  secondAstParent.unshift(erasedEl);
  newMarkdownLookup = generateMarkdownLookup(newField.current.markdown.htmlAst);

  addClassNamesPayloadOverrides(
    curTag,
    el1Idx !== null ? el1Idx : el1OuterIdx,
    el2Idx !== null ? el2Idx : el2OuterIdx,
    newTag,
    originalFieldCopy,
    newField,
    newMarkdownLookup
  );

  const payload = field.current.payload.optionsPayload.classNamesPayload[curTag]?.override;
  if(payload) {
    Object.keys(payload).forEach((key) => {
      removeAt(payload[key], originalNth);
    });
  }

  const lookup = createNodeToClassesLookup(newField);

  for (let i = 0; i < el2OuterIdx; ++i) {
    [secondAstParent[i], secondAstParent[i + 1]] = [secondAstParent[i + 1], secondAstParent[i],];
  }

  newField.current.markdown.htmlAst = cleanHtmlAst(secondAst) as HastRoot;
  postProcessUpdateStyles(newField, secondAst, lookup);
  paneFragmentMarkdown.setKey(el2fragmentId, {
    ...newField,
    current: newField.current,
  });
}

function handleListElementsMovementBetweenPanels(
  mdast: MdastRoot,
  el1OuterIdx: number,
  el1PaneId: string,
  el1fragmentId: string,
  el1Idx: number | null,
  markdownLookup: MarkdownLookup,
  newMarkdownLookup: MarkdownLookup,
  el2FragmentId: string,
  field: FieldWithHistory<MarkdownEditDatum>,
  el2OuterIdx: number,
  el2Idx: number | null,
  newHistory: HistoryEntry<MarkdownEditDatum>[]
) {
  if (el1Idx === null) return;
  const originalFieldCopy = {...field};

  const parent = field.current.markdown.htmlAst.children[el1OuterIdx];

  if (!parent || !("children" in parent)) return;

  // use children here because actual elements are wrapped in the listelement
  const erasedEl = parent.children.splice(el1Idx, 1)[0];
  //eraseElement(el1PaneId, el1fragmentId, el1OuterIdx, el1Idx, markdownLookup);

  const newField = cloneDeep(paneFragmentMarkdown.get()[el2FragmentId]);
  // grab original child because mdast loses some properties when it runs "toMarkdown"
  const originalChild = field.current.markdown.htmlAst.children[el1OuterIdx];
  copyMarkdownIfFound(originalChild, field, newField);

  paneFragmentMarkdown.setKey(el1fragmentId, {
    ...field,
    current: field.current,
    history: newHistory,
  });

  const secondAst = newField.current.markdown.htmlAst;

  let isListItem = false;
  if (isElementInList(mdast, el1OuterIdx, el1Idx)) {
    console.log("source element is in list");
    isListItem = true;
  }

  let secondAstParent = secondAst.children;
  if (el2Idx !== null && secondAst.children[el2OuterIdx]) {
    const innerChildren = secondAst.children[el2OuterIdx];
    if ("children" in innerChildren) {
      secondAstParent = innerChildren.children;
    }
  }

  // @ts-expect-error tagName exists
  const curTag = erasedEl.tagName || "";
  let newTag = curTag;
  if (isListItem) {
    // use original mdast to figure out expected field type because we can't extract type from the AST
    // @ts-expect-error children tagName exists
    newTag = getHtmlTagFromMdast(mdast.children[el1OuterIdx].children[el1Idx].children[0]) || "";
  }

  // @ts-expect-error children tagName exists
  const hastEl = toHast(mdast.children[el1OuterIdx].children[el1Idx].children[0]);

  // @ts-expect-error children exists but need to set up definitions
  secondAstParent.unshift(hastEl);
  newMarkdownLookup = generateMarkdownLookup(newField.current.markdown.htmlAst);

  addClassNamesPayloadOverrides(
    curTag,
    el1Idx !== null ? el1Idx : el1OuterIdx,
    el2Idx !== null ? el2Idx : el2OuterIdx,
    newTag,
    originalFieldCopy,
    newField,
    newMarkdownLookup
  );

  const payload = field.current.payload.optionsPayload.classNamesPayload["li"]?.override;
  if(payload) {
    Object.keys(payload).forEach((key) => {
      removeAt(payload[key], el1Idx);
    });
  }

  const lookup = createNodeToClassesLookup(newField);
  for (let i = 0; i < el2OuterIdx; ++i) {
    [secondAstParent[i], secondAstParent[i + 1]] = [secondAstParent[i + 1], secondAstParent[i],];
  }

  newField.current.markdown.htmlAst = cleanHtmlAst(secondAst) as HastRoot;
  postProcessUpdateStyles(newField, secondAst, lookup);
  paneFragmentMarkdown.setKey(el2FragmentId, {
    ...newField,
    current: newField.current,
  });
}

type NodeToClassData = {
  tagName: string;
  originalNth: number; // this won't be the current Nth, if you just swapped elements then use getNthFromAstUsingElement
  overrideClasses: any;
  classes: any;
}

function createNodeToClassesLookup(field: FieldWithHistory<MarkdownEditDatum>) {
  console.log(field.current);
  const lookup = new Map<any, NodeToClassData>();
  const elementsCounter = new Map<string, number>();

  const ast = field.current.markdown.htmlAst;
  const payload = field.current.payload.optionsPayload.classNamesPayload;

  for(let i = 0; i < ast.children.length; i++) {
    // @ts-expect-error tagName exists
    const tagName = ast.children[i].tagName;
    const idx = elementsCounter.get(tagName) || 0;
    lookup.set(ast.children[i], {
      tagName,
      originalNth: idx,
      // @ts-expect-error it's iteratable but TS swears at types.. fix eventually
      classes: extractEntriesAtIndex(payload[tagName]?.classes, idx),
      // @ts-expect-error it's iteratable but TS swears at types.. fix eventually
      overrideClasses: extractEntriesAtIndex(payload[tagName]?.override, idx),
    });

    elementsCounter.set(tagName, idx + 1);
  }
  console.log(Array.from(lookup));
  return lookup;
}

function postProcessUpdateStyles(
  field: FieldWithHistory<MarkdownEditDatum>,
  ast: Root,
  lookup: Map<any, NodeToClassData>
) {
  const payload = field.current.payload.optionsPayload.classNamesPayload;
  for (const c of ast.children) {
    const metaData = lookup.get(c);
    if (metaData && payload[metaData.tagName]) {
      const overrides = payload[metaData.tagName].override;
      if (overrides) {
        const nth = getNthFromAstUsingElement(ast, c);
        Object.keys(metaData.overrideClasses).forEach(val => {
          overrides[val].setAt(nth, metaData.overrideClasses[val]);
        });
      }
    }
  }
}

// todo fix adding new element breaks classes overrides
function handleBlockMovementWithinTheSamePanel(
  el1OuterIdx: number,
  el2OuterIdx: number,
  field: FieldWithHistory<MarkdownEditDatum>,
  el1fragmentId: string,
  newHistory: HistoryEntry<MarkdownEditDatum>[],
) {
  const ast = field.current.markdown.htmlAst;
  const lookup = createNodeToClassesLookup(field);
  if (
    ast.children.length >= el1OuterIdx &&
    ast.children.length >= el2OuterIdx
  ) {
    console.log(ast.children);
    // todo: add class overrides swap based on local tag markup
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
    console.log(ast.children);

    postProcessUpdateStyles(field, ast, lookup);

    field.current.markdown.htmlAst = cleanHtmlAst(ast) as HastRoot;
    paneFragmentMarkdown.setKey(el1fragmentId, {
      ...field,
      current: field.current,
      history: newHistory,
    });
  }
}

function swapClassNames_All(
  optionsPayload: OptionsPayloadDatum,
  el1TagName: string,
  el1Nth: number,
  el2Nth: number,
  field: FieldWithHistory<MarkdownEditDatum>
) {
  if (optionsPayload.classNames) {
    let allCopy = { ...optionsPayload.classNames.all };
    allCopy = swapObjectValues(
      allCopy[el1TagName],
      el1Nth.toString(10),
      el2Nth.toString(10)
    );
    if (!allCopy) return;

    field.current.payload.optionsPayload.classNames = {
      ...field.current.payload.optionsPayload.classNames,
      all: allCopy,
    };
  }
}

function swapClassNamesPayload_Override(
  optionsPayload: OptionsPayloadDatum,
  el1TagName: string,
  el1Nth: number,
  el2Nth: number,
  field: FieldWithHistory<MarkdownEditDatum>
) {
  if (optionsPayload.classNamesPayload[el1TagName]?.override) {
    const overrideCopy = {
      ...optionsPayload.classNamesPayload[el1TagName].override,
    };

    Object.keys(overrideCopy).forEach(
      key =>
        (overrideCopy[key] = swapObjectValues(
          overrideCopy[key],
          el1Nth.toString(10),
          el2Nth.toString(10)
        ))
    );

    field.current.payload.optionsPayload.classNamesPayload[el1TagName] = {
      ...field.current.payload.optionsPayload.classNamesPayload[el1TagName],
      override: overrideCopy,
    };
  }
}

function swapClassNamesPayload_Classes(
  optionsPayload: OptionsPayloadDatum,
  el1TagName: string,
  el1Nth: number,
  el2Nth: number,
  field: FieldWithHistory<MarkdownEditDatum>
) {
  if (optionsPayload.classNamesPayload[el1TagName]?.classes) {
    const classesCopy = {
      ...optionsPayload.classNamesPayload[el1TagName].classes,
    };

    Object.keys(classesCopy).forEach(key => {
      const swapRes = swapObjectValues(
        // @ts-expect-error TS tuples are read only but JS doesn't recognize tuples hence the error
        classesCopy[key],
        el1Nth.toString(10),
        el2Nth.toString(10)
      );
      if (swapRes) {
        // @ts-expect-error same as above, TS read only, JS fine
        classesCopy[key] = swapRes;
      }
    });

    field.current.payload.optionsPayload.classNamesPayload[el1TagName] = {
      ...field.current.payload.optionsPayload.classNamesPayload[el1TagName],
      classes: classesCopy,
    };
  }
}

function addClassNamesPayloadOverrides(
  el1TagName: string,
  el1Idx: number | null,
  el2Idx: number | null,
  el2TagName: string,
  curField: FieldWithHistory<MarkdownEditDatum>,
  newField: FieldWithHistory<MarkdownEditDatum>,
  markdownLookup: MarkdownLookup
) {
  if (el1Idx === null) return;

  const originalOverrides =
    curField.current.payload.optionsPayload.classNamesPayload[el1TagName]
      ?.override || {};
  if (originalOverrides) {
    const overrideCopy = {
      ...(newField.current.payload.optionsPayload.classNamesPayload[el2TagName]
        .override || {}),
    };

    let tagsAmount = 0;
    let nth = el1Idx;
    // if list element, grab list elements from markdown lookup
    if (el2TagName === "li") {
      tagsAmount = Object.values(markdownLookup?.listItems).length;
    } else {
      tagsAmount = Object.values(markdownLookup?.nthTagLookup?.[el2TagName]).length ?? 0;
      const ast = curField.current.markdown.htmlAst;
      nth = getNthFromAstUsingElement(ast, ast.children[el1Idx]);
    }
    console.log(
      `add class names payload overrides, [${el2TagName}] tags : ${tagsAmount}`
    );
    // set new field payloads, they should be at index 0 as later on they will be swapped
    Object.keys(originalOverrides).forEach(key => {
      // key null or undefined, skip
      if (!originalOverrides[key][nth]) return;
      if (!overrideCopy[key]) {
        overrideCopy[key] = [];
        // add extra tag because we've added this element
        for (let i = 0; i < tagsAmount - 1; ++i) {
          // @ts-expect-error idk why nulls are not allowed but I see them *shrug*
          overrideCopy[key].push(null);
        }
      }
      overrideCopy[key].unshift(originalOverrides[key][nth]);
      // more keys than expected, pop last, likely just a hanging reference that wasn't removed
      if (overrideCopy[key].length > tagsAmount) {
        overrideCopy[key].pop();
      }
    });

    // override new fields payload
    newField.current.payload.optionsPayload.classNamesPayload[el2TagName] = {
      ...newField.current.payload.optionsPayload.classNamesPayload[el2TagName],
      override: overrideCopy,
      count: tagsAmount,
    };
  }
}

function getElementTagAndNth(
  originalParent: any,
  curIdx: number,
  el1OuterIdx: number,
  markdownLookup: MarkdownLookup
) {
  let tagName = "";
  let nth = -1;
  // this is a parent with nested list (i.e. new pane that has a lot of <li> components
  if (
    originalParent.tagName === "ol" &&
    "children" in originalParent &&
    "children" in originalParent.children[curIdx]
  ) {
    tagName = originalParent.children[curIdx].tagName;
    const globalNth = getGlobalNth(
      tagName,
      curIdx,
      el1OuterIdx,
      markdownLookup
    );
    if (globalNth !== null) {
      nth = globalNth;
    }
  }
  // this is a parent block, no nested lists, all regular elements
  else if ("children" in originalParent) {
    tagName = originalParent.children[curIdx].tagName;
    nth = curIdx;
  }
  return { tagName, nth };
}


function swapPayloadClasses(
  originalParent: any,
  curIdx: number,
  nextIdx: number,
  el1OuterIdx: number,
  markdownLookup: MarkdownLookup,
  optionsPayload: OptionsPayloadDatum,
  field: FieldWithHistory<MarkdownEditDatum>
) {
  const el1Info = getElementTagAndNth(
    originalParent,
    curIdx,
    el1OuterIdx,
    markdownLookup
  );
  const el2Info = getElementTagAndNth(
    originalParent,
    nextIdx,
    el1OuterIdx,
    markdownLookup
  );
  swapClassNames_All(
    optionsPayload,
    el1Info.tagName,
    el1Info.nth,
    el2Info.nth,
    field
  );
  swapClassNamesPayload_Override(
    optionsPayload,
    el1Info.tagName,
    el1Info.nth,
    el2Info.nth,
    field
  );
  swapClassNamesPayload_Classes(
    optionsPayload,
    el1Info.tagName,
    el1Info.nth,
    el2Info.nth,
    field
  );
}

function handleListElementMovementWithinTheSamePanel(
  el1OuterIdx: number,
  el1Index: number | null,
  el2Index: number | null,
  field: FieldWithHistory<MarkdownEditDatum>,
  el1fragmentId: string,
  newHistory: HistoryEntry<MarkdownEditDatum>[],
  markdownLookup: MarkdownLookup
) {
  if (el1Index === null || el2Index === null) return;

  const parent = field.current.markdown.htmlAst.children[el1OuterIdx];
  if (!parent || !("children" in parent)) return;

  const optionsPayload = field.current.payload.optionsPayload;

  if (
    parent.children.length >= el1Index &&
    parent.children.length >= el2Index
  ) {
    if (el1Index < el2Index) {
      // swap elements top to bottom
      for (let i = el1Index; i < el2Index; i++) {
        [parent.children[i], parent.children[i + 1]] = [parent.children[i + 1], parent.children[i],];
      }
    } else {
      // swap elements bottom to top
      for (let i = el1Index; i > el2Index; i--) {
        [parent.children[i], parent.children[i - 1]] = [parent.children[i - 1], parent.children[i],];
      }
    }
  }
  //field.current.markdown.body = toMarkdown(mdast);
  //field.current.markdown.htmlAst = cleanHtmlAst(
  //  toHast(mdast) as HastRoot
  //) as HastRoot;

  // todo improve this bit later
  if (el1Index < el2Index) {
    // swap elements top to bottom
    for (let i = el1Index; i < el2Index; i++) {
      swapPayloadClasses(field.current.markdown.htmlAst.children[el1OuterIdx], i, i + 1, el1OuterIdx, markdownLookup, optionsPayload, field);
    }
  } else {
    // swap elements bottom to top
    for (let i = el1Index; i > el2Index; i--) {
      swapPayloadClasses(field.current.markdown.htmlAst.children[el1OuterIdx], i, i - 1, el1OuterIdx, markdownLookup, optionsPayload, field);
    }
  }

  paneFragmentMarkdown.setKey(el1fragmentId, {
    ...field,
    current: field.current,
    history: newHistory,
  });
}

export function moveElements(
  markdownLookup: MarkdownLookup,
  newMarkdownLookup: MarkdownLookup,
  el1fragmentId: string,
  el1OuterIdx: number,
  el1PaneId: string,
  el1Idx: number | null,
  el2FragmentId: string,
  el2OuterIdx: number,
  el2PaneId: string,
  el2Idx: number | null
) {
  const field = cloneDeep(paneFragmentMarkdown.get()[el1fragmentId]);
  const mdast = fromMarkdown(field.current.markdown.body);
  const newHistory = updateHistory(field, Date.now());

  // todo add markdown generation
  if (el1PaneId !== el2PaneId) {
    if (isElementInList(mdast, el1OuterIdx, el1Idx)) {
      handleListElementsMovementBetweenPanels(
        mdast,
        el1OuterIdx,
        el1PaneId,
        el1fragmentId,
        el1Idx,
        markdownLookup,
        newMarkdownLookup,
        el2FragmentId,
        field,
        el2OuterIdx,
        el2Idx,
        newHistory
      );
    } else {
      handleBlockMovementBetweenPanels(
        el1OuterIdx,
        el1PaneId,
        el1fragmentId,
        el1Idx,
        markdownLookup,
        newMarkdownLookup,
        el2FragmentId,
        field,
        el2OuterIdx,
        el2Idx,
        newHistory
      );
    }
  } else {
    if (isElementInList(mdast, el1OuterIdx, el1Idx)) {
      handleListElementMovementWithinTheSamePanel(
        el1OuterIdx,
        el1Idx,
        el2Idx,
        field,
        el1fragmentId,
        newHistory,
        markdownLookup
      );
    } else {
      handleBlockMovementWithinTheSamePanel(
        el1OuterIdx,
        el2OuterIdx,
        field,
        el1fragmentId,
        newHistory,
      );
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
