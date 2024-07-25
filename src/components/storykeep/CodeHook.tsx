import { memo } from "react";
import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import {
  toolModeStore,
  editModeStore,
  paneInit,
  paneCodeHook,
} from "../../store/storykeep";
import { handleToggleOn, handleToggleOff } from "../../utils/storykeep";

const CodeHook = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const $paneInit = useStore(paneInit);
  const $toolMode = useStore(toolModeStore);
  const toolMode = $toolMode.value || ``;
  const $paneCodeHook = useStore(paneCodeHook);
  const slug = $paneCodeHook[id].current?.target || id;
  const $editMode = useStore(editModeStore);

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
      handleToggleOn();
    }
  };

  if (!isClient) return <div>Loading...</div>;

  return (
    <div
      style={{ position: "relative" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="w-full text-center text-xl font-myblue font-bold bg-mygreen/20">
        Code Hook: {slug}
      </div>
      {toolMode === `settings` ? (
        <div
          onClick={handleEditModeToggle}
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
                <span>
                  Edit <button onClick={handleEditModeToggle}>settings</button>{" "}
                  on code hook
                </span>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 w-full h-full z-50" />
      )}
    </div>
  );
};

export default memo(CodeHook);
