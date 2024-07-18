import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { editModeStore, paneInit } from "../../store/storykeep";
import { handleToggleOn, handleToggleOff } from "../../utils/storykeep";

export const CodeHook = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $paneInit = useStore(paneInit);
  //const $paneCodeHook = useStore(paneCodeHook);
  const $editMode = useStore(editModeStore);

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $paneInit]);

  const handleEditModeToggle = () => {
    if ($editMode?.mode === `codehook` && $editMode.id === id) {
      editModeStore.set(null);
      handleToggleOff();
    } else {
      editModeStore.set({
        id,
        mode: `codehook`,
        type: `pane`,
      });
      handleToggleOn();
    }
  };

  if (!isClient) return <div>Loading...</div>;

  return (
    <p>
      Code Hook: {id}
      <button
        type="button"
        className="my-1 rounded bg-myblue px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
        onClick={handleEditModeToggle}
      >
        Settings
      </button>
    </p>
  );
};
