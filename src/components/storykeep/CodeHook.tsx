import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { paneInit, paneCodeHook } from "../../store/storykeep";

export const CodeHook = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $paneInit = useStore(paneInit);
  const $paneCodeHook = useStore(paneCodeHook);

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $paneInit]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <p>
      Code Hook: {id} {JSON.stringify($paneCodeHook)}
    </p>
  );
};
