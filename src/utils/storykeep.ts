import { debounce } from "./helpers";

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
