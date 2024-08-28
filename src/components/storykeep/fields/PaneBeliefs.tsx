import { useStore } from "@nanostores/react";
import {
 paneHeldBeliefs,
  paneWithheldBeliefs
} from "../../../store/storykeep";

interface PaneBeliefsProps {
  id: string;
}

/*
 There is no validation for Beliefs ...
 eventually will add UI and turso tables with look-up scale
 */
const PaneBeliefs = ({ id }: PaneBeliefsProps) => {
  const $paneHeldBeliefs = useStore(paneHeldBeliefs, { keys: [id] });
  const $paneWithheldBeliefs = useStore(paneWithheldBeliefs, { keys: [id] });
  console.log($paneHeldBeliefs[id]?.current)
  console.log($paneWithheldBeliefs[id]?.current)
  return <div>Beliefs on Pane {id}</div>;
};

export default PaneBeliefs;
