import { useStore } from "@nanostores/react";
import { debounce } from "./helpers";
import { useCallback, useState, useRef } from "react";
import {
  unsavedChangesStore,
  uncleanDataStore,
  temporaryErrorsStore,
  viewportStore,
  modeStore,
} from "../store/storykeep";
import type {
  StoreKey,
  StoreMapType,
  FieldWithHistory,
  ValidationFunction,
} from "../types";

// global fn to toggle layout
export const handleToggleOn = () => {
  const event = new CustomEvent("toggle-on-edit-modal");
  document.dispatchEvent(event);
};
export const handleToggleOff = () => {
  const event = new CustomEvent("toggle-off-edit-modal");
  document.dispatchEvent(event);
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

export const useStoryKeepUtils = (
  id: string,
  storeMap: StoreMapType,
  validationFunctions: Partial<Record<StoreKey, ValidationFunction>>
) => {
  const [isEditing, setIsEditing] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});
  const lastUpdateTimeRef = useRef<Record<StoreKey, number>>(
    initializeLastUpdateTime(storeMap)
  );

  const { value: viewport } = useStore(viewportStore);
  const { value: mode } = useStore(modeStore);

  const setViewport = (
    newViewport: "auto" | "mobile" | "tablet" | "desktop"
  ) => {
    viewportStore.set({ value: newViewport });
  };

  const setMode = (newMode: "text" | "styles" | "settings") => {
    modeStore.set({ value: newMode });
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
      }, 2000);
    },
    [id]
  );

  const updateStoreField = useCallback(
    (storeKey: StoreKey, newValue: string): boolean => {
      const store = storeMap[storeKey];
      if (!store) return false;

      const validationFunction = validationFunctions[storeKey];
      if (validationFunction && !validationFunction(newValue)) {
        setTemporaryError(storeKey);
        return false;
      }

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      const now = Date.now();

      if (currentField && newValue !== currentField.current) {
        const timeSinceLastUpdate =
          now - (lastUpdateTimeRef.current[storeKey] || 0);
        const newField: FieldWithHistory<string> = {
          current: newValue,
          original: currentField.original,
          history: currentField.history,
        };

        if (currentField.history.length === 0 || timeSinceLastUpdate > 5000) {
          newField.history = [
            { value: currentField.current, timestamp: now },
            ...currentField.history,
          ].slice(0, 10);
          lastUpdateTimeRef.current[storeKey] = now;
        }

        if (newValue.length === 0) {
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

        store.set({
          ...currentStoreValue,
          [id]: newField,
        });

        const isUnsaved = newValue !== currentField.original;
        unsavedChangesStore.setKey(id, {
          ...(unsavedChangesStore.get()[id] || {}),
          [storeKey]: isUnsaved,
        });

        return true;
      }

      return false;
    },
    [id, storeMap, validationFunctions, setTemporaryError]
  );

  const handleUndo = useCallback(
    (storeKey: StoreKey) => {
      const store = storeMap[storeKey];
      if (!store) return;

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      if (currentField && currentField.history.length > 0) {
        const [lastEntry, ...newHistory] = currentField.history;

        const validationFunction = validationFunctions[storeKey];
        if (validationFunction && !validationFunction(lastEntry.value)) {
          setTemporaryError(storeKey);
          return;
        }

        store.set({
          ...currentStoreValue,
          [id]: {
            current: lastEntry.value,
            original: currentField.original,
            history: newHistory,
          },
        });
        lastUpdateTimeRef.current[storeKey] = Date.now();

        const isUnsaved = lastEntry.value !== currentField.original;
        unsavedChangesStore.setKey(id, {
          ...(unsavedChangesStore.get()[id] || {}),
          [storeKey]: isUnsaved,
        });

        uncleanDataStore.setKey(id, {
          ...(uncleanDataStore.get()[id] || {}),
          [storeKey]: false,
        });

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
    mode,
    setViewport,
    setMode,
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

  //  type Viewport = "auto" | "xs" | "md" | "xl";

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
  //const viewportButtons = document.querySelectorAll(
  //  ".viewport-button"
  //) as NodeListOf<Element>;
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

  // ONLY NEEDED until we pass this to react island!
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //let currentViewport: Viewport = "auto";
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

  function handleEditModeLayout(): void {
    const isDesktop = window.innerWidth >= BREAKPOINTS.xl;
    const isShortScreen = window.innerHeight <= SHORT_SCREEN_THRESHOLD;
    const headerHeight = header.offsetHeight;
    const isHeaderSticky = header.classList.contains("sticky");
    const hasVerticalScroll =
      document.documentElement.scrollHeight > window.innerHeight;
    const isHeaderBlocking =
      window.scrollY < headerHeight && !hasVerticalScroll;

    mainContent.classList.toggle("xl:pr-1/3", isEditMode && isDesktop);

    if (isDesktop) {
      if (isEditMode) {
        editPane.classList.remove("invisible", "opacity-0");
        editPane.classList.add("visible", "opacity-100");
        editModalMobile.classList.add("invisible", "opacity-0");
        editModalMobile.classList.remove("visible", "opacity-100");
        websiteContent.classList.add("xl:w-2/3");
        editPane.classList.add("xl:w-1/3");
        editPane.style.top =
          isHeaderSticky || isHeaderBlocking ? `${headerHeight}px` : "0";
        editPane.style.marginTop = `0`;
        editPane.style.height = isHeaderSticky
          ? `calc(100vh - ${headerHeight}px)`
          : "100vh";
        if (isShortScreen) {
          // may have been hidden when in mobile modal
          websiteContent.classList.remove("hidden");
          scrollHeaderOutOfView();
        }
      } else {
        editPane.classList.add("invisible", "opacity-0");
        editPane.classList.remove("visible", "opacity-100");
        editModalMobile.classList.add("invisible", "opacity-0");
        editModalMobile.classList.remove("visible", "opacity-100");
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
        if (!isHeaderSticky) {
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

  //function setViewport(viewport: Viewport): void {
  //  currentViewport = viewport;
  //  websiteContent.className =
  //    "website-content flex-1 overflow-y-auto p-4 bg-white";

  //  if (viewport === "auto") {
  //    websiteContent.classList.add("w-full", "max-w-[1920px]");
  //  } else if (viewport === "xs") {
  //    websiteContent.classList.add("min-w-[600px]", "max-w-[800px]");
  //  } else if (viewport === "md") {
  //    websiteContent.classList.add("min-w-[1024px]", "max-w-[1366px]");
  //  } else if (viewport === "xl") {
  //    websiteContent.classList.add("min-w-[1500px]", "max-w-[1920px]");
  //  }

  //  viewportButtons.forEach(button => {
  //    if (button instanceof HTMLButtonElement && button.dataset.viewport) {
  //      button.classList.toggle(
  //        "bg-blue-500",
  //        button.dataset.viewport === viewport
  //      );
  //      button.classList.toggle(
  //        "text-white",
  //        button.dataset.viewport === viewport
  //      );
  //      button.classList.toggle(
  //        "bg-gray-200",
  //        button.dataset.viewport !== viewport
  //      );
  //    }
  //  });

  //  handleEditModeLayout();
  //}

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
        scrollY + elementRect.bottom - (viewportHeight - editModalHeight) + 20; // 20px padding
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
    if (
      !isHeaderSticky &&
      isEditMode &&
      isDesktop &&
      currentScrollTop < headerHeight
    ) {
      editPane.style.marginTop = `${headerHeight - currentScrollTop}px`;
    } else {
      editPane.style.marginTop = "0px";
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
  function toggleOnEditModal(): void {
    isEditMode = true;
    handleEditModeLayout();
  }
  function toggleOffEditModal(): void {
    isEditMode = false;
    handleEditModeLayout();
  }
  document.addEventListener("toggle-on-edit-modal", () => {
    toggleOnEditModal();
  });
  document.addEventListener("toggle-off-edit-modal", () => {
    toggleOffEditModal();
  });

  // Event Listeners

  //viewportButtons.forEach((button: Element) => {
  //  if (button instanceof HTMLButtonElement && button.dataset.viewport) {
  //    button.addEventListener("click", () =>
  //      setViewport(button.dataset.viewport as Viewport)
  //    );
  //  }
  //});

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
    if (event.key === "Escape" && isEditMode && activeElement) {
      toggleEditMode(activeElement);
    }
  });

  // Initialize
  handleHeaderBehavior();
  //setViewport("auto");
}
