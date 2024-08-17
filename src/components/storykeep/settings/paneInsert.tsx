import { useStore } from "@nanostores/react";
import { ulid } from "ulid";
import {
  storyFragmentPaneIds,
  //paneTitle,
  //paneSlug,
  //paneFragmentIds,
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

/* eslint-disable @typescript-eslint/no-explicit-any */
export const PaneInsert = (props: { id: string; payload: any }) => {
  const { id, payload } = props;

  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds, { keys: [id] });

  const thisPaneId = ulid();
  const newPaneIds = [...($storyFragmentPaneIds[id]?.current || null)];
  newPaneIds.splice(payload.index, 0, thisPaneId);

  //const $paneTitle = useStore(paneTitle);
  //const $paneSlug = useStore(paneSlug);
  //const $paneFragmentIds = useStore(paneFragmentIds, { keys: [id] });
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
      <p>Insert new Pane into Story Fragment: {id}</p>
    </>
  );
};
