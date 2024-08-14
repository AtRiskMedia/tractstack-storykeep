import { useStore } from "@nanostores/react";
import {
  paneTitle,
  paneSlug,
  paneFragmentIds,
  //paneIsContextPane,
  //paneHeightOffsetDesktop,
  //paneHeightOffsetMobile,
  //paneHeightOffsetTablet,
  //paneHeightRatioDesktop,
  //paneHeightRatioMobile,
  //paneHeightRatioTablet,
  //paneFragmentMarkdown,
  //paneFragmentBgPane,
  //paneFragmentBgColour,
  //paneIsHiddenPane,
  //paneHasOverflowHidden,
  //paneHasMaxHScreen,
  //paneFiles,
  //paneCodeHook,
  //paneImpression,
  //paneHeldBeliefs,
  //paneWithheldBeliefs,
} from "../../../store/storykeep";
import type { PaneAstTargetId } from "../../../types";

export const PaneAstStyles = (props: {
  id: string;
  targetId: PaneAstTargetId;
}) => {
  const { id, targetId } = props;
  console.log(id, targetId);
  const $paneTitle = useStore(paneTitle);
  const $paneSlug = useStore(paneSlug);
  const $paneFragmentIds = useStore(paneFragmentIds, { keys: [id] });
  //const $paneIsContextPane = useStore(paneIsContextPane);
  //const $paneHeightOffsetDesktop = useStore(paneHeightOffsetDesktop);
  //const $paneHeightOffsetTablet = useStore(paneHeightOffsetTablet);
  //const $paneHeightOffsetMobile = useStore(paneHeightOffsetMobile);
  //const $paneHeightRatioDesktop = useStore(paneHeightRatioDesktop);
  //const $paneHeightRatioTablet = useStore(paneHeightRatioTablet);
  //const $paneHeightRatioMobile = useStore(paneHeightRatioMobile);
  //const $paneFragmentMarkdown = useStore(paneFragmentMarkdown);
  //const $paneFragmentBgPane = useStore(paneFragmentBgPane);
  //const $paneFragmentBgColour = useStore(paneFragmentBgColour);
  //const $paneIsHiddenPane = useStore(paneIsHiddenPane);
  //const $paneHasOverflowHidden = useStore(paneHasOverflowHidden);
  //const $paneHasMaxHScreen = useStore(paneHasMaxHScreen);
  //const $paneFiles = useStore(paneFiles);
  //const $paneCodeHook = useStore(paneCodeHook);
  //const $paneImpression = useStore(paneImpression);
  //const $paneHeldBeliefs = useStore(paneHeldBeliefs);
  //const $paneWithheldBeliefs = useStore(paneWithheldBeliefs);

  return (
    <>
      <p>Pane Ast Styles: {id}</p>
      <ul>
        <li>{$paneTitle[id].current}</li>
        <li>{$paneSlug[id].current}</li>
        <li>{$paneFragmentIds[id].current.join(`, `)}</li>
      </ul>
    </>
  );
};
