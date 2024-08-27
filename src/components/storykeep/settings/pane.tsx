import { useStore } from "@nanostores/react";
import { Switch } from "@headlessui/react";
import PaneTitle from "../fields/PaneTitle";
import PaneSlug from "../fields/PaneSlug";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import {
  paneTitle,
  paneSlug,
  paneIsHiddenPane,
  //paneHeightOffsetDesktop,
  //paneHeightOffsetMobile,
  //paneHeightOffsetTablet,
  //paneHeightRatioDesktop,
  //paneHeightRatioMobile,
  //paneHeightRatioTablet,
  //paneHasOverflowHidden,
  //paneHasMaxHScreen,
  //paneCodeHook,
  //paneImpression,
  //paneHeldBeliefs,
  //paneWithheldBeliefs,
} from "../../../store/storykeep";
import { cleanString } from "../../../utils/helpers";
import type { ContentMap, StoreKey } from "../../../types";

export const PaneSettings = (props: {
  id: string;
  contentMap: ContentMap[];
}) => {
  const { id, contentMap } = props;
  const usedSlugs = contentMap
    .filter(item => item.type === "Pane")
    .map(item => item.slug);
  const { updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(id, usedSlugs);
  const $paneTitle = useStore(paneTitle);
  const $paneSlug = useStore(paneSlug);
  const $paneIsHiddenPane = useStore(paneIsHiddenPane);
  //const $paneHeightOffsetDesktop = useStore(paneHeightOffsetDesktop);
  //const $paneHeightOffsetTablet = useStore(paneHeightOffsetTablet);
  //const $paneHeightOffsetMobile = useStore(paneHeightOffsetMobile);
  //const $paneHeightRatioDesktop = useStore(paneHeightRatioDesktop);
  //const $paneHeightRatioTablet = useStore(paneHeightRatioTablet);
  //const $paneHeightRatioMobile = useStore(paneHeightRatioMobile);
  //const $paneHasOverflowHidden = useStore(paneHasOverflowHidden);
  //const $paneHasMaxHScreen = useStore(paneHasMaxHScreen);
  //const $paneCodeHook = useStore(paneCodeHook);
  //const $paneImpression = useStore(paneImpression);
  //const $paneHeldBeliefs = useStore(paneHeldBeliefs);
  //const $paneWithheldBeliefs = useStore(paneWithheldBeliefs);

  const handleUpdateStoreField = (storeKey: StoreKey, newValue: string) => {
    return updateStoreField(storeKey, newValue);
  };

  const handleInterceptEdit = (storeKey: StoreKey, editing: boolean) => {
    if (storeKey === `paneTitle` && $paneSlug[id].current === ``) {
      const clean = cleanString($paneTitle[id].current).substring(0, 50);
      const newVal = !usedSlugs.includes(clean) ? clean : ``;
      updateStoreField(storeKey, newVal);
    }
    return handleEditingChange(storeKey, editing);
  };

  return (
    <div className="rounded-md bg-white px-3.5 py-1.5 shadow-inner mr-6">
      <p className="text-lg my-1 text-black">
        <strong>Please provide a descriptive title and slug.</strong>
      </p>
      <p className="text-md mb-2 text-mydarkgrey">
        Note: used for analytics and may (if enabled) be used as part of the
        "fast travel" map shown to users. Enter a short but meaningful
        title/slug.
      </p>
      <div className="flex flex-wrap gap-x-12">
        <div className="flex-grow max-w-lg w-full">
          <PaneTitle
            id={id}
            handleEditingChange={handleInterceptEdit}
            updateStoreField={handleUpdateStoreField}
            handleUndo={handleUndo}
          />
        </div>
        <div className="flex-grow max-w-xs w-full">
          <PaneSlug
            id={id}
            handleEditingChange={handleEditingChange}
            updateStoreField={handleUpdateStoreField}
            handleUndo={handleUndo}
          />
        </div>
        <div className="flex-grow w-full">
          <div className="flex items-center mt-4">
            <Switch
              checked={$paneIsHiddenPane[id].current}
              onChange={newValue =>
                updateStoreField("paneIsHiddenPane", newValue)
              }
              className={`${
                $paneIsHiddenPane[id].current ? "bg-myorange" : "bg-mydarkgrey"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
            >
              <span
                className={`${
                  $paneIsHiddenPane[id].current
                    ? "translate-x-6"
                    : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
            <div className="ml-3">
              <div className="text-md text-black font-bold">
                {$paneIsHiddenPane[id].current
                  ? `Hidden or decorative pane`
                  : `Monitor engagement`}
              </div>
              <div className="text-md text-mydarkgrey">
                {$paneIsHiddenPane[id].current
                  ? `No pane analytics will be collected`
                  : `Pane analytics will be collected`}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
