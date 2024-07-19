import { useStore } from "@nanostores/react";
import { debounce } from "./helpers";
import { useCallback, useState, useRef } from "react";
import {
  unsavedChangesStore,
  uncleanDataStore,
  temporaryErrorsStore,
  viewportStore,
  toolModeStore,
  toolAddModeStore,
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTailwindBgColour,
  storyFragmentMenuId,
  storyFragmentSocialImagePath,
} from "../store/storykeep";
import { MAX_HISTORY_LENGTH } from "../constants";
import type {
  StoreKey,
  StoreMapType,
  FieldWithHistory,
  ValidationFunction,
  ToggleEditModalEvent,
  ToolAddMode,
  ToolMode,
  HistoryEntry,
} from "../types";

const storeMap: StoreMapType = {
  storyFragmentTitle: storyFragmentTitle,
  storyFragmentSlug: storyFragmentSlug,
  storyFragmentTailwindBgColour: storyFragmentTailwindBgColour,
  storyFragmentSocialImagePath: storyFragmentSocialImagePath,
  storyFragmentMenuId: storyFragmentMenuId,
  // Add other stores here
};

const preValidationFunctions: Partial<Record<StoreKey, ValidationFunction>> = {
  storyFragmentTailwindBgColour: (value: string) => value.length <= 20,
  storyFragmentTitle: (value: string) => value.length <= 80,
  storyFragmentSlug: (value: string) =>
    value.length === 0 || (value.length <= 50 && /^[a-z0-9-]*$/.test(value)),
  storyFragmentSocialImagePath: (value: string) =>
    value.length <= 80 &&
    /^\/?([\w-.]+(?:\/[\w-.]+)*\/?)?[\w-]*\.?(?:png|jpg)?$/.test(value),
  storyFragmentMenuId: (value: string) => value.length <= 32,
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

export const useStoryKeepUtils = (id: string) => {
  const [isEditing, setIsEditing] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});
  const lastUpdateTimeRef = useRef<Record<StoreKey, number>>(
    initializeLastUpdateTime(storeMap)
  );

  const { value: viewport } = useStore(viewportStore);
  const { value: toolMode } = useStore(toolModeStore);
  const { value: toolAddMode } = useStore(toolAddModeStore);

  const setViewport = (
    newViewport: "auto" | "mobile" | "tablet" | "desktop"
  ) => {
    viewportStore.set({ value: newViewport });
  };

  const setToolMode = (newToolMode: ToolMode) => {
    toolModeStore.set({ value: newToolMode });
  };

  const setToolAddMode = (newToolAddMode: ToolAddMode) => {
    toolAddModeStore.set({ value: newToolAddMode });
  };

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

  const updateStoreField = (storeKey: StoreKey, newValue: string): boolean => {
    const store = storeMap[storeKey];
    if (!store) return false;

    const isValid = isValidValue(storeKey, newValue);
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
    if (currentField && newValue !== currentField.current && isPreValid) {
      const now = Date.now();
      const newHistory = updateHistory(storeKey, currentField, now);
      const newField = createNewField(currentField, newValue, newHistory);

      store.set({
        ...currentStoreValue,
        [id]: newField,
      });

      const isUnsaved = newValue !== newField.original;
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
    if (timeSinceLastUpdate > 4000) {
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
    (storeKey: StoreKey) => {
      const store = storeMap[storeKey];
      if (!store) return;

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      if (currentField && currentField.history.length > 0) {
        const [lastEntry, ...newHistory] = currentField.history;
        store.set({
          ...currentStoreValue,
          [id]: {
            current: lastEntry.value,
            original: currentField.original,
            history: newHistory,
          },
        });
        lastUpdateTimeRef.current[storeKey] = Date.now();
        updateStoreField(storeKey, lastEntry.value);
      }
    },
    [id, storeMap, validationFunctions, setTemporaryError, updateStoreField]
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
    viewport,
    setViewport,
    toolMode,
    setToolMode,
    toolAddMode,
    setToolAddMode,
  };
};

export async function initStoryKeep() {
  interface Breakpoints {
    xs: number;
    md: number;
    xl: number;
  }
  interface EditableElement extends HTMLElement {
    dataset: {
      elementId: string;
    };
  }

  interface EditableElement extends HTMLElement {
    dataset: {
      elementId: string;
    };
  }

  const mainContent = document.getElementById("main-content") as HTMLElement;
  const websiteContent = document.getElementById(
    "website-content"
  ) as HTMLElement;
  const editPane = document.getElementById("edit-pane") as HTMLElement;
  const editModalMobile = document.getElementById(
    "edit-modal-mobile"
  ) as HTMLElement;
  const editableElements = document.querySelectorAll(
    ".editable-element"
  ) as NodeListOf<Element>;
  const editInfo = document.getElementById("edit-info") as HTMLElement;
  const editInfoMobile = document.getElementById(
    "edit-info-mobile"
  ) as HTMLElement;
  const header = document.getElementById("main-header") as HTMLElement;

  const BREAKPOINTS: Breakpoints = {
    xs: 600,
    md: 800,
    xl: 1367,
  };
  const SHORT_SCREEN_THRESHOLD = 600;
  const STICKY_HEADER_THRESHOLD = 1200;

  let isEditMode = false;
  let activeElement: EditableElement | null = null;

  function handleHeaderBehavior(): void {
    const viewportHeight = window.innerHeight;
    if (viewportHeight > STICKY_HEADER_THRESHOLD) {
      header.classList.add("sticky", "top-0");
    } else {
      header.classList.remove("sticky", "top-0");
    }
  }

  function handleEditModeLayout(preventHeaderScroll = false): void {
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    const isShortScreen = window.innerHeight <= SHORT_SCREEN_THRESHOLD;
    const headerHeight = header.offsetHeight;
    const isHeaderSticky = header.classList.contains("sticky");
    const hasVerticalScroll =
      document.documentElement.scrollHeight > window.innerHeight;
    const scrollTop = window.scrollY || document.documentElement.scrollTop;

    mainContent.classList.toggle("xl:pr-1/3", isEditMode && isDesktop);

    if (isDesktop) {
      if (isEditMode) {
        editPane.classList.remove("invisible", "opacity-0");
        editPane.classList.add("visible", "opacity-100", "fixed", "right-0");
        editModalMobile.classList.add("invisible", "opacity-0");
        editModalMobile.classList.remove("visible", "opacity-100");
        websiteContent.classList.add("xl:w-2/3");
        editPane.classList.add("xl:w-1/3");

        // Adjust the position of the edit pane
        editPane.style.marginTop = "0";

        if (
          isHeaderSticky ||
          (!hasVerticalScroll && scrollTop < headerHeight)
        ) {
          editPane.style.top = `${headerHeight}px`;
          editPane.style.height = `calc(100vh - ${headerHeight}px)`;
        } else {
          editPane.style.top = "0";
          editPane.style.height = "100vh";
        }

        if (isShortScreen) {
          websiteContent.classList.remove("hidden");
          if (!preventHeaderScroll) scrollHeaderOutOfView();
        }
      } else {
        editPane.classList.add("invisible", "opacity-0");
        editPane.classList.remove("visible", "opacity-100", "fixed", "right-0");
        websiteContent.classList.remove("xl:w-2/3");
        editPane.classList.remove("xl:w-1/3");
      }
    } else {
      if (isEditMode) {
        editPane.classList.remove("visible", "opacity-100");
        editPane.classList.add("invisible", "opacity-0");
        editModalMobile.classList.remove("invisible", "opacity-0");
        editModalMobile.classList.add("visible", "opacity-100");
        if (isShortScreen) {
          editModalMobile.style.top = "0";
          editModalMobile.style.bottom = "0";
          editModalMobile.style.height = "100%";
          editModalMobile.style.zIndex = "1000";
          websiteContent.classList.add("hidden");
        } else {
          editModalMobile.style.top = "auto";
          editModalMobile.style.bottom = "0";
          editModalMobile.style.height = `${window.innerHeight / 3}px`;
          editModalMobile.style.zIndex = "10";
          websiteContent.classList.remove("hidden");
          websiteContent.style.paddingBottom = `${window.innerHeight / 3}px`;
        }
        if (!isHeaderSticky && !preventHeaderScroll) {
          scrollHeaderOutOfView();
        }
        if (!isShortScreen) {
          scrollElementIntoView();
        }
      } else {
        editPane.classList.remove("visible", "opacity-100");
        editPane.classList.add("invisible", "opacity-0");
        editModalMobile.classList.remove("visible", "opacity-100");
        editModalMobile.classList.add("invisible", "opacity-0");
        websiteContent.style.paddingBottom = "0";
        websiteContent.classList.remove("hidden");
      }
    }
    handleScroll();
  }

  function toggleEditMode(element: HTMLElement): void {
    if (!(element instanceof HTMLElement)) return;

    if (isEditMode && element === activeElement) {
      isEditMode = false;
      activeElement = null;
    } else if (isEditMode) {
      activeElement = element as EditableElement;
    } else {
      isEditMode = true;
      activeElement = element as EditableElement;
    }

    if (isEditMode) {
      const elementIndex = Array.from(editableElements).indexOf(element) + 1;
      const infoText = `Editing element ${elementIndex} of ${editableElements.length}`;
      editInfo.textContent = infoText;
      editInfoMobile.textContent = infoText;
      if (!header.classList.contains("sticky")) {
        scrollHeaderOutOfView();
      }
    } else {
      editInfo.textContent = "";
      editInfoMobile.textContent = "";
    }

    handleEditModeLayout();
  }

  function scrollElementIntoView(): void {
    if (!activeElement) return;

    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    if (isDesktop) return;

    const elementRect = activeElement.getBoundingClientRect();
    const editModalHeight = window.innerHeight / 3;
    const viewportHeight = window.innerHeight;
    const scrollY = window.scrollY;

    if (elementRect.bottom > viewportHeight - editModalHeight) {
      const targetScroll =
        scrollY + elementRect.bottom - (viewportHeight - editModalHeight) + 20;
      window.scrollTo({
        top: targetScroll,
        behavior: "smooth",
      });
    }
  }

  function scrollHeaderOutOfView(): void {
    const headerHeight = header.offsetHeight;
    const currentScrollTop =
      window.scrollY || document.documentElement.scrollTop;

    window.scrollTo({
      top: Math.max(currentScrollTop, headerHeight),
      behavior: "smooth",
    });
  }

  function handleResize(): void {
    handleHeaderBehavior();
    handleEditModeLayout();
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    if (!isEditMode || isDesktop) {
      websiteContent.style.paddingBottom = "0";
    }
  }

  function handleScroll(): void {
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    const isHeaderSticky = header.classList.contains("sticky");
    const headerHeight = header.offsetHeight;
    const currentScrollTop =
      window.scrollY || document.documentElement.scrollTop;

    if (!isHeaderSticky && isEditMode && isDesktop) {
      if (currentScrollTop < headerHeight) {
        editPane.style.top = `${headerHeight - currentScrollTop}px`;
      } else {
        editPane.style.top = "0";
      }
    }
  }

  function toggleOff(element: HTMLElement): void {
    const isShortScreen = window.innerHeight <= SHORT_SCREEN_THRESHOLD;
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    const hide = isDesktop || !isShortScreen;
    if (hide && isEditMode && activeElement === element)
      toggleEditMode(element);
  }

  // helper fns for react
  function toggleOnEditModal(preventHeaderScroll = false): void {
    isEditMode = true;
    handleEditModeLayout(preventHeaderScroll);
  }

  function toggleOffEditModal(preventHeaderScroll = false): void {
    isEditMode = false;
    handleEditModeLayout(preventHeaderScroll);
  }

  document.addEventListener("toggle-on-edit-modal", ((event: Event) => {
    if (event instanceof CustomEvent) {
      const customEvent = event as unknown as ToggleEditModalEvent;
      const preventHeaderScroll =
        customEvent.detail?.preventHeaderScroll || false;
      toggleOnEditModal(preventHeaderScroll);
    }
  }) as EventListener);

  document.addEventListener("toggle-off-edit-modal", ((event: Event) => {
    if (event instanceof CustomEvent) {
      const customEvent = event as unknown as ToggleEditModalEvent;
      const preventHeaderScroll =
        customEvent.detail?.preventHeaderScroll || false;
      toggleOffEditModal(preventHeaderScroll);
    }
  }) as EventListener);

  // add .editable-element and EditMode will auto disable if scrolled out of view
  editableElements.forEach((element: Element) => {
    if (element instanceof HTMLElement) {
      element.addEventListener("click", () =>
        toggleEditMode(element as EditableElement)
      );
    }
  });

  const observer = new IntersectionObserver(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) {
          toggleOff(entry.target as EditableElement);
        }
      });
    }
  );

  editableElements.forEach((el: Element) => {
    if (el instanceof HTMLElement) {
      observer.observe(el);
    }
  });

  window.addEventListener(
    "scroll",
    debounce(() => {
      handleScroll();
    }, 100)
  );

  window.addEventListener("resize", handleResize);

  document.addEventListener("keydown", (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      toggleOffEditModal();
    }
  });

  // Initialize
  handleHeaderBehavior();
}

// global fn to toggle layout
export const handleToggleOn = (preventHeaderScroll = false) => {
  const event = new CustomEvent("toggle-on-edit-modal", {
    detail: { preventHeaderScroll },
  });
  document.dispatchEvent(event);
};

export const handleToggleOff = (preventHeaderScroll = false) => {
  const event = new CustomEvent("toggle-off-edit-modal", {
    detail: { preventHeaderScroll },
  });
  document.dispatchEvent(event);
};
