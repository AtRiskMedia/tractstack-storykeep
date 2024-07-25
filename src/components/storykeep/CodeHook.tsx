import { memo } from "react";
import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { editModeStore, paneInit } from "../../store/storykeep";
import { handleToggleOn, handleToggleOff } from "../../utils/storykeep";

const CodeHook = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const $paneInit = useStore(paneInit);
  //const $paneCodeHook = useStore(paneCodeHook);
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
      <div>
        {/* Placeholder content */}
        Code Hook: {id}
      </div>
      <div
        onClick={handleEditModeToggle}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          cursor: "pointer",
          backgroundColor: isHovered ? "rgba(0, 0, 0, 0.1)" : "transparent",
          transition: "background-color 0.3s ease",
        }}
      >
        {isHovered && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "white",
              padding: "10px",
              borderRadius: "5px",
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
            }}
          >
            Edit{" "}
            <button
              onClick={handleEditModeToggle}
              style={{ fontWeight: "bold" }}
            >
              settings
            </button>{" "}
            on this code hook
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(CodeHook);
