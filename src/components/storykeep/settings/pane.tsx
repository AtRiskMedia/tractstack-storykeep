import { useState } from "react";
import { useStore } from "@nanostores/react";
import { Switch } from "@headlessui/react";
import PaneTitle from "../fields/PaneTitle";
import PaneSlug from "../fields/PaneSlug";
import PaneHeightOffset from "../fields/PaneHeightOffset";
import PaneHeightRatio from "../fields/PaneHeightRatio";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import {
  paneTitle,
  paneSlug,
  paneIsHiddenPane,
  paneHasOverflowHidden,
  paneHasMaxHScreen,
  paneCodeHook,
  //paneImpression,
  //paneHeldBeliefs,
  //paneWithheldBeliefs,
} from "../../../store/storykeep";
import { cleanString, classNames } from "../../../utils/helpers";
import type { ContentMap, StoreKey } from "../../../types";

export const PaneSettings = (props: {
  id: string;
  contentMap: ContentMap[];
}) => {
  const { id, contentMap } = props;
  const [activeTab, setActiveTab] = useState(0);
  const usedSlugs = contentMap
    .filter(item => item.type === "Pane")
    .map(item => item.slug);
  const { updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(id, usedSlugs);
  const $paneTitle = useStore(paneTitle);
  const $paneSlug = useStore(paneSlug);
  const $paneIsHiddenPane = useStore(paneIsHiddenPane);
  const $paneHasOverflowHidden = useStore(paneHasOverflowHidden);
  const $paneHasMaxHScreen = useStore(paneHasMaxHScreen);
  const $paneCodeHook = useStore(paneCodeHook);
  const hasCodeHook = typeof $paneCodeHook[id] !== `undefined`;
  const tabs = !hasCodeHook
    ? [`settings`, `advanced`, `beliefs`]
    : [`settings`, `advanced`, `beliefs`, `codeHook`];
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
      <div className="flex justify-between items-center">
        <nav aria-label="Tabs" className="flex space-x-4 mt-4 mb-1 mr-6">
          {tabs.map((tab: string, idx: number) => (
            <button
              key={idx}
              aria-current={idx === activeTab ? "page" : undefined}
              onClick={() => {
                setActiveTab(idx);
              }}
              className={classNames(
                idx === activeTab
                  ? "text-black font-bold"
                  : "text-mydarkgrey hover:text-black underline",
                "text-md"
              )}
            >
              {tab === `settings`
                ? `Pane Settings`
                : tab === `advanced`
                  ? `Advanced Settings`
                  : tab === `beliefs`
                    ? `Add Story Paths`
                    : tab === `codeHook`
                      ? `Manage Code Hook`
                      : ``}
            </button>
          ))}
        </nav>
      </div>
      <hr className="w-full" />
      {activeTab === 0 ? (
        <div className="my-4">
          <p className="text-md mb-2 text-mydarkgrey italic">
            Note: title + slug used for analytics and may (if enabled) be used
            as part of the "fast travel" map shown to users.{" "}
          </p>
          <div className="flex flex-wrap gap-x-16">
            <div className="flex-grow w-96">
              <PaneTitle
                id={id}
                handleEditingChange={handleInterceptEdit}
                updateStoreField={handleUpdateStoreField}
                handleUndo={handleUndo}
              />
            </div>
            <div className="flex-grow w-64">
              <PaneSlug
                id={id}
                handleEditingChange={handleEditingChange}
                updateStoreField={handleUpdateStoreField}
                handleUndo={handleUndo}
              />
            </div>

            <div className="flex-grow">
              <div className="flex items-center">
                <Switch
                  checked={$paneIsHiddenPane[id].current}
                  onChange={newValue =>
                    updateStoreField("paneIsHiddenPane", newValue)
                  }
                  className={`${
                    $paneIsHiddenPane[id].current
                      ? "bg-myorange"
                      : "bg-mydarkgrey"
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
      ) : activeTab === 1 ? (
        <div className="flex flex-wrap gap-x-16 gap-y-6 my-4">
          <div className="flex-grow">
            <PaneHeightOffset id={id} />
          </div>
          <div className="flex-grow">
            <PaneHeightRatio id={id} />
          </div>
          <div className="w-fit-contents flex gap-x-16 gap-y-6">
            <div className="flex items-center">
              <Switch
                checked={$paneHasOverflowHidden[id].current}
                onChange={newValue =>
                  updateStoreField("paneHasOverflowHidden", newValue)
                }
                className={`${
                  $paneHasOverflowHidden[id].current
                    ? "bg-myorange"
                    : "bg-mydarkgrey"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
              >
                <span
                  className={`${
                    $paneHasOverflowHidden[id].current
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <div className="ml-3">
                <div className="text-md text-black font-bold">
                  {$paneHasOverflowHidden[id].current
                    ? `Apply overflow hidden`
                    : `No overflow hidden applied`}
                </div>
              </div>
            </div>

            <div className="flex items-center">
              <Switch
                checked={$paneHasMaxHScreen[id].current}
                onChange={newValue =>
                  updateStoreField("paneHasMaxHScreen", newValue)
                }
                className={`${
                  $paneHasMaxHScreen[id].current
                    ? "bg-myorange"
                    : "bg-mydarkgrey"
                } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
              >
                <span
                  className={`${
                    $paneHasMaxHScreen[id].current
                      ? "translate-x-6"
                      : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
              <div className="ml-3">
                <div className="text-md text-black font-bold">
                  {$paneHasMaxHScreen[id].current
                    ? `Apply Max height screen`
                    : `No max height applied`}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === 2 ? (
        <></>
      ) : activeTab === 3 ? (
        <></>
      ) : null}
    </div>
  );
};
