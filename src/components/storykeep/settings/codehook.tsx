import { useStore } from "@nanostores/react";
import { paneCodeHook } from "../../../store/storykeep";

export const CodeHookSettings = (props: { id: string }) => {
  const { id } = props;
  const $paneCodeHook = useStore(paneCodeHook, { keys: [id] });
  console.log($paneCodeHook[id].current);

  return <p>Code Hook: {id}</p>;
};
