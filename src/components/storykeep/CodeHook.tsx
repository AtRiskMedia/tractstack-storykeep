import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { paneInit, paneCodeHook, toolModeStore } from "../../store/storykeep";

const CodeHook = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $paneInit = useStore(paneInit);
  const $paneCodeHook = useStore(paneCodeHook);
  const slug = $paneCodeHook[id].current?.target || id;
  const $toolMode = useStore(toolModeStore);
  const toolMode = $toolMode.value || ``;

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $paneInit]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div style={{ position: "relative" }}>
      <div className="w-full text-center text-xl font-myblue font-bold bg-mygreen/20">
        Code Hook: {slug}
      </div>
      {toolMode !== "text" && (
        <div className="absolute inset-0 w-full h-full z-50" />
      )}
    </div>
  );
};

export default CodeHook;
