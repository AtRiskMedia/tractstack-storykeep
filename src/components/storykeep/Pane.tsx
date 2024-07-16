import { useState, useEffect } from "react";
import { useStore } from "@nanostores/react";
import { paneInit } from "../../store/storykeep";

export const Pane = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const $paneInit = useStore(paneInit);

  useEffect(() => {
    if ($paneInit[id]?.init) {
      setIsClient(true);
    }
  }, [id, $paneInit]);

  if (!isClient) return <div>Loading...</div>;

  return <p>Pane: {id}</p>;
};
