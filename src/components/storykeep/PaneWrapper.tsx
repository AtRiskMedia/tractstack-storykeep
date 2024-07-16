import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { paneInit, paneTitle, paneCodeHook } from "../../store/storykeep";
import { Pane } from "./Pane";
import { CodeHook } from "./CodeHook";

export const PaneWrapper = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $paneInit = useStore(paneInit);
  const $paneTitle = useStore(paneTitle);
  const $paneCodeHook = useStore(paneCodeHook);
  const isCodeHook = typeof $paneCodeHook[id] === `object`;

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $paneInit]);

  if (!isClient) return <div>Loading...</div>;
console.log($paneTitle[id].current)
  if (isCodeHook) return <CodeHook id={id} />;
  return <Pane id={id} />;
};
