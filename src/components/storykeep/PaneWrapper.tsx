import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import {
  paneInit,
  paneCodeHook,
  toolModeStore,
  editModeStore,
} from "../../store/storykeep";
import Pane from "./Pane";
import CodeHook from "./CodeHook";
import {
  isFullScreenEditModal,
  handleToggleOn,
  handleToggleOff,
} from "../../utils/storykeep";
import type { ReactNode } from "react";

const InsertTopBottomWrapper = ({
  children,
  onInsertClick,
}: {
  children: ReactNode;
  onInsertClick: (position: "top" | "bottom") => void;
}) => {
  return (
    <div className="relative group">
      {children}
      <div className="absolute inset-x-0 top-0 h-1/2 z-10 cursor-pointer group/top">
        <div
          onClick={() => onInsertClick("top")}
          title="Insert new Pane above this one"
          className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-b hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion
                     before:content-[''] before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5
                     before:bg-mylightgrey hover:before:bg-mylightgrey"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/2 z-10 cursor-pointer group/bottom">
        <div
          onClick={() => onInsertClick("bottom")}
          title="Insert new Pane below this one"
          className="absolute inset-0 w-full h-full
                     hover:bg-gradient-to-t hover:from-mylightgrey/85 hover:via-mylightgrey/85 hover:to-transparent
                     mix-blend-exclusion
                     after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5
                     after:bg-mylightgrey hover:after:bg-mylightgrey"
        />
      </div>
    </div>
  );
};

const PaneWrapper = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const $paneInit = useStore(paneInit);
  const $paneCodeHook = useStore(paneCodeHook);
  const $toolMode = useStore(toolModeStore);
  const $editMode = useStore(editModeStore);
  const toolMode = $toolMode.value || ``;
  const isCodeHook = typeof $paneCodeHook[id] === `object`;
  const [paneElement, setPaneElement] = useState<HTMLDivElement | null>(null);

  const paneRef = useCallback(
    (node: HTMLDivElement) => {
      if (node !== null) {
        setPaneElement(node);
      }
    },
    [id]
  );

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $paneInit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        $editMode?.type === "pane" &&
        $editMode?.mode === "settings" &&
        $editMode.id === id
      ) {
        toggleOffEditModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [$editMode, id]);

  const toggleOffEditModal = () => {
    editModeStore.set(null);
    handleToggleOff();
  };

  const handleEditModeToggle = () => {
    if (
      $editMode?.type === "pane" &&
      $editMode?.mode === "settings" &&
      $editMode.id === id
    ) {
      toggleOffEditModal();
    } else {
      editModeStore.set({
        id,
        mode: "settings",
        type: "pane",
      });
      handleToggleOn(false, `pane-inner-${id}`);
    }
  };

  const handleClick = () => {
    if ([`styles`, `settings`, `pane`].includes(toolMode))
      handleEditModeToggle();
  };

  const handleInsertClick = (position: "top" | "bottom") => {
    if (toolMode === "pane") {
      console.log(`Insert pane ${position}`);
    }
  };

  useEffect(() => {
    if (!paneElement || isFullScreenEditModal($editMode?.mode || ``)) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          const currentEditMode = editModeStore.get();
          if (
            currentEditMode?.type === "pane" &&
            currentEditMode.mode === "settings" &&
            currentEditMode.id === id
          ) {
            toggleOffEditModal();
          }
        }
      },
      { threshold: 0 }
    );

    observer.observe(paneElement);

    return () => {
      observer.disconnect();
    };
  }, [paneElement, id, $editMode]);

  if (!isClient) return <div>Loading...</div>;

  const Content = isCodeHook ? <CodeHook id={id} /> : <Pane id={id} />;

  return ![`pane`, `settings`].includes(toolMode) ? (
    Content
  ) : (
    <div
      ref={paneRef}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative"
    >
      {toolMode === `pane` ? (
        <InsertTopBottomWrapper onInsertClick={handleInsertClick}>
          {Content}
        </InsertTopBottomWrapper>
      ) : (
        Content
      )}
      {toolMode === `settings` && (
        <div
          className={`absolute inset-0 cursor-pointer transition-colors duration-300 ease-in-out ${
            isHovered ? "bg-[rgba(167,177,183,0.85)]" : "bg-transparent"
          }`}
        >
          {isHovered && (
            <div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
               bg-white p-2.5 rounded-md shadow-md
               text-xl md:text-3xl font-action mx-6"
            >
              {$editMode?.id === id ? (
                <span>Close settings pane</span>
              ) : (
                <span>Edit settings on this pane</span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PaneWrapper;
