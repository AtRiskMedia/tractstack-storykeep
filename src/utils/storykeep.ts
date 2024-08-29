import { useCallback, useState, useRef } from "react";
import {
  unsavedChangesStore,
  uncleanDataStore,
  temporaryErrorsStore,
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTailwindBgColour,
  storyFragmentMenuId,
  storyFragmentSocialImagePath,
  paneTitle,
  paneSlug,
  paneFragmentMarkdown,
  paneFragmentBgPane,
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
} from "../store/storykeep";
import { debounce, isDeepEqual } from "./helpers";
import {
  MS_BETWEEN_UNDO,
  MAX_HISTORY_LENGTH,
  SHORT_SCREEN_THRESHOLD,
  MIN_SCROLL_THRESHOLD,
} from "../constants";
import type {
  StoreKey,
  StoreMapType,
  FieldWithHistory,
  ValidationFunction,
  HistoryEntry,
} from "../types";

const BREAKPOINTS = {
  xl: 1367,
};

const storeMap: StoreMapType = {
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTailwindBgColour,
  storyFragmentSocialImagePath,
  storyFragmentMenuId,
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
  const updateStoreField = (storeKey: StoreKey, newValue: any): boolean => {
    const store = storeMap[storeKey];
    if (!store) return false;

    const isValid =
      isValidValue(storeKey, newValue) &&
      ([`paneSlug`, `storyFragmentSlug`].includes(storeKey)
        ? usedSlugs && !usedSlugs.includes(newValue)
        : true);
    const isPreValid = isPreValidValue(storeKey, newValue);
    if (!isPreValid) {
      // don't save to undo if preValid fails
      // contentEditable also rejects when return false
      setTemporaryError(storeKey);
      return false;
    }
    if (!isValid || !isPreValidValue) {
      uncleanDataStore.setKey(id, {
        ...(uncleanDataStore.get()[id] || {}),
        [storeKey]: true,
      });
    } else {
      uncleanDataStore.setKey(id, {
        ...(uncleanDataStore.get()[id] || {}),
        [storeKey]: false,
      });
    }

    const currentStoreValue = store.get();
    const currentField = currentStoreValue[id];
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
        [id]: newField,
      });
      const isUnsaved = !isDeepEqual(newValue, newField.original);
      unsavedChangesStore.setKey(id, {
        ...(unsavedChangesStore.get()[id] || {}),
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
      console.log(storeKey, id, currentField);
      console.log(currentStoreValue);
      if (currentField && currentField.history.length > 1) {
        console.log(currentField.history[0].value);
        store.setKey(id, {
          current: currentField.history[0].value,
          original: currentField.original,
          history: currentField.history.slice(1),
        });
      }
      if (currentField && currentField.history.length === 1) {
        console.log(`origin`);
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

export function initStoryKeep() {
  const websiteContent = document.getElementById(
    "website-content"
  ) as HTMLElement;
  const editPane = document.getElementById("edit-pane") as HTMLElement;
  const editModalMobile = document.getElementById(
    "edit-modal-mobile"
  ) as HTMLElement;
  const header = document.getElementById("main-header") as HTMLElement;

  let editMode = ``;
  let activeElement: HTMLElement | null = null;

  function handleHeaderBehavior(): void {
    const scrollPosition = window.scrollY || document.documentElement.scrollTop;
    header.classList.toggle("sticky", scrollPosition > MIN_SCROLL_THRESHOLD);
    header.classList.toggle("top-0", scrollPosition > MIN_SCROLL_THRESHOLD);
    header.style.zIndex = "9000";
  }

  function adjustEditPanePosition(): void {
    const headerHeight = header.offsetHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const isHeaderVisible = scrollTop < headerHeight;
    const isHeaderSticky = header.classList.contains("sticky");

    if (isHeaderVisible || isHeaderSticky) {
      editPane.style.top = `${headerHeight}px`;
    } else {
      editPane.style.top = "0";
    }
  }

  function handleEditModeLayout(): void {
    const fullScreen = [`settings`, `insert`].includes(editMode);
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    const isShortScreen = window.innerHeight <= SHORT_SCREEN_THRESHOLD;

    editPane.style.zIndex = editMode ? "9001" : "8000";
    editModalMobile.style.zIndex = editMode ? "9001" : "8000";

    // toggle full width based on editMode+
    if (!isDesktop && editModalMobile && (fullScreen || isShortScreen))
      editModalMobile.classList.add("w-full");
    else if (!isDesktop && editModalMobile)
      editModalMobile.classList.remove("w-full");
    if (isDesktop && editPane && fullScreen) editPane.classList.add("w-full");
    else if (isDesktop && editPane) editPane.classList.remove("w-full");

    if (isDesktop) {
      editPane.style.transform = editMode
        ? "translateX(0)"
        : "translateX(100%)";
      editModalMobile.style.transform = "translateY(100%)";
      if (editMode) adjustEditPanePosition();
    } else {
      editPane.style.transform = "translateX(100%)";
      if (editMode) {
        if (isShortScreen) {
          editModalMobile.style.top = "0";
          editModalMobile.style.height = "100%";
          websiteContent.classList.add("hidden");
        } else {
          editModalMobile.style.top = "auto";
          editModalMobile.style.height = `${window.innerHeight / 2.5}px`;
          websiteContent.classList.remove("hidden");
          websiteContent.style.paddingBottom = `${window.innerHeight / 2.5}px`;
        }
        editModalMobile.style.transform = "translateY(0)";
      } else {
        editModalMobile.style.transform = "translateY(100%)";
        websiteContent.style.paddingBottom = "0";
        websiteContent.classList.remove("hidden");
      }
    }

    //if (editMode && !preventHeaderScroll) {
    //scrollHeaderOutOfView();
    //}

    if (editMode && activeElement) {
      scrollElementIntoView(activeElement);
    }
  }

  function scrollElementIntoView(element: HTMLElement): void {
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    const header = document.getElementById("main-header");
    const headerHeight = header ? header.offsetHeight : 0;
    const elementRect = element.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    let targetScroll;
    if (isDesktop) {
      // For desktop, center the element in the available space
      const availableSpace = viewportHeight - headerHeight;
      const idealTop = headerHeight + (availableSpace - elementRect.height) / 2;
      targetScroll = window.scrollY + elementRect.top - idealTop;
    } else {
      // Keep the existing mobile logic
      const editModalHeight = window.innerHeight / 3;
      const availableSpace = viewportHeight - headerHeight - editModalHeight;
      if (elementRect.height <= availableSpace) {
        // If the element fits in the available space, center it
        const idealTop =
          headerHeight + (availableSpace - elementRect.height) / 2;
        targetScroll = window.scrollY + elementRect.top - idealTop;
      } else {
        // If the element is taller than available space, align the centers
        const elementCenter = elementRect.top + elementRect.height / 2;
        const availableSpaceCenter = headerHeight + availableSpace / 2;
        targetScroll = window.scrollY + elementCenter - availableSpaceCenter;
      }
    }
    // Ensure we don't scroll past the top of the document
    targetScroll = Math.max(0, targetScroll);
    // Perform the scroll
    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });
  }

  //function scrollHeaderOutOfView(): void {
  //  const headerHeight = header.offsetHeight;
  //  const currentScrollTop =
  //    window.scrollY || document.documentElement.scrollTop;
  //  window.scrollTo({
  //    top: Math.max(currentScrollTop, headerHeight),
  //    behavior: "smooth",
  //  });
  //}

  function handleResize(): void {
    handleHeaderBehavior();
    handleEditModeLayout();
  }

  function handleScroll(): void {
    handleHeaderBehavior();
    if (window.innerWidth >= BREAKPOINTS.xl) {
      adjustEditPanePosition();
    }
  }
  const debouncedHandleScroll = debounce(handleScroll, 50);
  const debouncedHandleResize = debounce(handleResize, 50);

  // Event listeners for React components
  document.addEventListener("toggle-on-edit-modal", ((event: CustomEvent) => {
    const mode = event.detail?.mode || ``;
    const targetElementId = event.detail?.targetElementId;
    editMode = mode;
    if (targetElementId) {
      activeElement = document.getElementById(targetElementId);
    }
    handleEditModeLayout();
  }) as EventListener);

  document.addEventListener("toggle-off-edit-modal", (() => {
    editMode = ``;
    activeElement = null;
    handleEditModeLayout();
  }) as EventListener);

  // Initialize
  handleHeaderBehavior();
  window.addEventListener("resize", debouncedHandleResize);
  window.addEventListener("scroll", debouncedHandleScroll);
}

// Global functions to toggle layout (updated to include targetElementId)
export const handleToggleOn = (mode: string, targetElementId?: string) => {
  const event = new CustomEvent("toggle-on-edit-modal", {
    detail: { mode, targetElementId },
  });
  document.dispatchEvent(event);
};

export const handleToggleOff = () => {
  const event = new CustomEvent("toggle-off-edit-modal", {});
  document.dispatchEvent(event);
};

export const isFullScreenEditModal = (mode: string) => {
  const isShortScreen = window.innerHeight <= SHORT_SCREEN_THRESHOLD;
  const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
  return mode === "settings" && isShortScreen && !isDesktop;
};
