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
import type { DatumPayload } from "../../../types";

export const PaneSettings = (props: { id: string; payload: DatumPayload }) => {
  const { id, payload } = props;
  console.log(payload);
  const $paneTitle = useStore(paneTitle);
  const $paneSlug = useStore(paneSlug);
  const $paneFragmentIds = useStore(paneFragmentIds);
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
      <p>Pane: {id}</p>
      <ul>
        <li>{$paneTitle[id].current}</li>
        <li>{$paneSlug[id].current}</li>
        <li>{$paneFragmentIds[id].current.join(`, `)}</li>
      </ul>
    </>
  );
};
