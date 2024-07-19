import { useStore } from "@nanostores/react";
import { paneCodeHook } from "../../../store/storykeep";
import type { DatumPayload } from "../../../types";

export const CodeHookSettings = (props: {
  id: string;
  payload: DatumPayload;
}) => {
  const { id, payload } = props;
  const $paneCodeHook = useStore(paneCodeHook);
  console.log($paneCodeHook[id].current, payload);

  return <p>Code Hook: {id}</p>;
};
