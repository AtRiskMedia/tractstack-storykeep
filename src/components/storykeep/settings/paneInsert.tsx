import { useEffect, useState } from "react";
import { ulid } from "ulid";
import { useStore } from "@nanostores/react";
import {
  toolModeStore,
  storyFragmentPaneIds,
  paneInit,
  paneTitle,
  paneSlug,
  uncleanDataStore,
  paneMarkdownFragmentId,
  paneIsContextPane,
  paneHeightOffsetDesktop,
  paneHeightOffsetMobile,
  paneHeightOffsetTablet,
  paneHeightRatioDesktop,
  paneHeightRatioMobile,
  paneHeightRatioTablet,
  paneFragmentIds,
  paneFragmentMarkdown,
  paneFragmentBgPane,
  paneFragmentBgColour,
  paneIsHiddenPane,
  paneHasOverflowHidden,
  paneHasMaxHScreen,
  paneFiles,
  paneHeldBeliefs,
  paneWithheldBeliefs,
} from "../../../store/storykeep";
import { cleanString } from "../../../utils/helpers";
import {
  createFieldWithHistory,
  useStoryKeepUtils,
} from "../../../utils/storykeep";
import PaneTitle from "../fields/PaneTitle";
import PaneSlug from "../fields/PaneSlug";
import type {
  BgPaneDatum,
  BgColourDatum,
  MarkdownPaneDatum,
  ContentMap,
  StoreKey,
  BeliefDatum,
} from "../../../types";

export const PaneInsert = (props: {
  storyFragmentId: string;
  paneId: string;
  /* eslint-disable @typescript-eslint/no-explicit-any */
  payload: any;
  contentMap: ContentMap[];
  toggleOff: () => void;
  doInsert: (newPaneIds: string[]) => void | null;
}) => {
  const { doInsert, contentMap, storyFragmentId, paneId, payload, toggleOff } =
    props;
  const [isClient, setIsClient] = useState(false);
  const $uncleanData = useStore(uncleanDataStore, { keys: [paneId] });
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds, {
    keys: [storyFragmentId],
  });
  const $paneTitle = useStore(paneTitle);
  const $paneSlug = useStore(paneSlug);
  const usedSlugs = contentMap
    .filter(item => item.type === "Pane")
    .map(item => item.slug);
  const { updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(paneId, usedSlugs);
  const newPaneIds = [
    ...($storyFragmentPaneIds[storyFragmentId]?.current || []),
  ];
  newPaneIds.splice(payload.index, 0, paneId);

  useEffect(() => {
    // Initialize the new pane's title and slug
    if (!$paneTitle[paneId]) {
      $paneTitle[paneId] = { current: "", original: "", history: [] };
      uncleanDataStore.setKey(paneId, {
        ...(uncleanDataStore.get()[paneId] || {}),
        [`paneTitle`]: true,
      });
    }
    if (!$paneSlug[paneId]) {
      $paneSlug[paneId] = { current: "", original: "", history: [] };
      uncleanDataStore.setKey(paneId, {
        ...(uncleanDataStore.get()[paneId] || {}),
        [`paneSlug`]: true,
      });
    }
    setIsClient(true);
  }, [paneId, $paneTitle, $paneSlug]);

  const handleUpdateStoreField = (storeKey: StoreKey, newValue: string) => {
    return updateStoreField(storeKey, newValue);
  };

  const handleInterceptEdit = (storeKey: StoreKey, editing: boolean) => {
    if (storeKey === `paneTitle` && $paneSlug[paneId].current === ``) {
      const clean = cleanString($paneTitle[paneId].current).substring(0, 50);
      const newVal = !usedSlugs.includes(clean) ? clean : ``;
      uncleanDataStore.setKey(paneId, {
        ...(uncleanDataStore.get()[paneId] || {}),
        [`paneSlug`]: newVal.length === 0,
      });
      paneSlug.setKey(paneId, {
        current: newVal,
        original: newVal,
        history: [],
      });
    }
    return handleEditingChange(storeKey, editing);
  };
  const handleSave = () => {
    console.log(`insert new pane: ${paneId}`, payload);
    const newPaneIds = [...$storyFragmentPaneIds[storyFragmentId].current];
    newPaneIds.splice(payload.index, 0, paneId);
    const paneStores = [
      { store: paneIsContextPane, value: false },
      {
        store: paneHeightOffsetDesktop,
        value: payload.selectedDesign.panePayload.heightOffsetDesktop,
      },
      {
        store: paneHeightOffsetMobile,
        value: payload.selectedDesign.panePayload.heightOffsetMobile,
      },
      {
        store: paneFiles,
        value: [],
      },
      {
        store: paneHeightOffsetTablet,
        value: payload.selectedDesign.panePayload.heightOffsetTablet,
      },
      {
        store: paneHeightRatioDesktop,
        value: payload.selectedDesign.panePayload.heightRatioDesktop,
      },
      {
        store: paneHeightRatioMobile,
        value: payload.selectedDesign.panePayload.heightRatioMobile,
      },
      {
        store: paneHeightRatioTablet,
        value: payload.selectedDesign.panePayload.heightRatioTablet,
      },
      {
        store: paneIsHiddenPane,
        value: false,
      },
      {
        store: paneHasOverflowHidden,
        value: false,
      },
      {
        store: paneHasMaxHScreen,
        value: false,
      },
      {
        store: paneHeldBeliefs,
        value: [] as BeliefDatum[],
      },
      {
        store: paneWithheldBeliefs,
        value: [] as BeliefDatum[],
      },
    ];
    paneStores.forEach(({ store, value }) => {
      store.set({
        ...store.get(),
        /* eslint-disable @typescript-eslint/no-explicit-any */
        [paneId]: createFieldWithHistory(value as any),
        /* eslint-disable @typescript-eslint/no-explicit-any */
      } as any);
    });

    // Process PaneFragments
    const thisPaneFragmentIds =
      payload.selectedDesign.fragments.forEach(
        (paneFragment: BgPaneDatum | BgColourDatum | MarkdownPaneDatum) => {
          const paneFragmentId = ulid();
          switch (paneFragment.type) {
            case `bgColour`:
              paneFragmentBgColour.set({
                ...paneFragmentBgColour.get(),
                [paneFragmentId]: createFieldWithHistory(paneFragment),
              });
              break;
            case `bgPane`:
              paneFragmentBgPane.set({
                ...paneFragmentBgPane.get(),
                [paneFragmentId]: createFieldWithHistory(paneFragment),
              });
              break;
            case `markdown`:
              paneFragmentMarkdown.set({
                ...paneFragmentMarkdown.get(),
                [paneFragmentId]: createFieldWithHistory({
                  markdown: payload.markdown,
                  payload: paneFragment,
                  type: `markdown`,
                }),
              });
              paneMarkdownFragmentId.set({
                ...paneMarkdownFragmentId.get(),
                [payload.id]: createFieldWithHistory(paneFragmentId),
              });
              break;
            default:
              console.log(
                `ERROR: Unknown paneFragment ${JSON.stringify(paneFragment)}`
              );
          }
          // this needs to be done differently...
          //const paneFragmentKeys: StoreKey[] = [
          //  "paneFragmentBgColour",
          //  "paneFragmentBgPane",
          //  "paneFragmentMarkdown",
          //];
          //const emptyPaneFragment = paneFragmentKeys.reduce(
          //  (acc, key) => ({ ...acc, [key]: false }),
          //  {} as Record<StoreKey, boolean>
          //);
          //unsavedChangesStore.setKey(paneFragmentId, emptyPaneFragment);
          //uncleanDataStore.setKey(paneFragmentId, emptyPaneFragment);
          //temporaryErrorsStore.setKey(
          //  paneFragmentId,
          //  emptyPaneFragment
          //);
          return paneFragmentId;
        }
      ) || [];

    // link pane fragments to pane
    paneFragmentIds.set({
      ...paneFragmentIds.get(),
      [paneId]: createFieldWithHistory(thisPaneFragmentIds),
    });
    // init pane
    paneInit.set({
      ...paneInit.get(),
      [paneId]: { init: true },
    });
    // finally update storyfragment paneIds
    storyFragmentPaneIds.set({
      ...storyFragmentPaneIds.get(),
      [storyFragmentId]: createFieldWithHistory(newPaneIds),
    });
    // and close edit mode
    toolModeStore.set({ value: `text` });
    if (doInsert) doInsert(newPaneIds);
    toggleOff();
  };

  if (!isClient) return <div>Loading...</div>;

  return (
    <div>
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
            id={paneId}
            handleEditingChange={handleInterceptEdit}
            updateStoreField={handleUpdateStoreField}
            handleUndo={handleUndo}
          />
        </div>
        <div className="flex-grow max-w-xs w-full">
          <PaneSlug
            id={paneId}
            handleEditingChange={handleEditingChange}
            updateStoreField={handleUpdateStoreField}
            handleUndo={handleUndo}
          />
        </div>
        <div className="w-full mt-4 flex gap-x-6">
          <button
            type="button"
            onClick={toggleOff}
            className="my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack"
          >
            Cancel
          </button>
          {!$uncleanData[paneId].paneSlug && !$uncleanData[paneId].paneTitle ? (
            <button
              type="button"
              onClick={handleSave}
              className="my-1 rounded bg-myorange px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack"
            >
              Insert this Pane
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};
