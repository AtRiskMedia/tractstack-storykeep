import { useEffect, useState } from "react";
import { ulid } from "ulid";
import preparePreviewPane from "../../../utils/compositor/preparePreviewPane";
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
  paneImpression,
  paneCodeHook,
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
  reuse: boolean;
  contentMap: ContentMap[];
  toggleOff: () => void;
  doInsert: (newPaneIds: string[]) => void | null;
}) => {
  const {
    reuse,
    doInsert,
    contentMap,
    storyFragmentId,
    paneId,
    payload,
    toggleOff,
  } = props;
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
    // Initialize (or re-use) the new pane's title and slug
    if (!$paneTitle[paneId]) {
      $paneTitle[paneId] = {
        current: reuse ? payload.selectedDesign.name : ``,
        original: "",
        history: [],
      };
      uncleanDataStore.setKey(paneId, {
        ...(uncleanDataStore.get()[paneId] || {}),
        [`paneTitle`]: !reuse,
      });
    }
    if (!$paneSlug[paneId]) {
      $paneSlug[paneId] = {
        current: reuse ? payload.selectedDesign.slug : ``,
        original: "",
        history: [],
      };
      uncleanDataStore.setKey(paneId, {
        ...(uncleanDataStore.get()[paneId] || {}),
        [`paneSlug`]: !reuse,
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
    const paneData = preparePreviewPane(payload.selectedDesign);
    const newPaneIds = [...$storyFragmentPaneIds[storyFragmentId].current];
    newPaneIds.splice(payload.index, 0, paneId);
    const paneStores = [
      { store: paneIsContextPane, value: paneData.isContextPane },
      {
        store: paneHeightOffsetDesktop,
        value: paneData.heightOffsetDesktop,
      },
      {
        store: paneHeightOffsetMobile,
        value: paneData.heightOffsetMobile,
      },
      {
        store: paneFiles,
        value: paneData.files,
      },
      {
        store: paneHeightOffsetTablet,
        value: paneData.heightOffsetTablet,
      },
      {
        store: paneHeightRatioDesktop,
        value: paneData.heightRatioDesktop,
      },
      {
        store: paneHeightRatioMobile,
        value: paneData.heightRatioMobile,
      },
      {
        store: paneHeightRatioTablet,
        value: paneData.heightRatioTablet,
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
        store: paneCodeHook,
        value: false,
      },
      {
        store: paneImpression,
        value: null,
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
      if (typeof store.get()[paneId] === `undefined`)
        store.set({
          ...store.get(),
          /* eslint-disable @typescript-eslint/no-explicit-any */
          [paneId]: createFieldWithHistory(value as any),
          /* eslint-disable @typescript-eslint/no-explicit-any */
        } as any);
    });

    // Process PaneFragments
    const thisPaneFragmentIds = paneData?.optionsPayload?.paneFragmentsPayload
      ?.map((paneFragment: BgPaneDatum | BgColourDatum | MarkdownPaneDatum) => {
        const paneFragmentId = ulid();
        switch (paneFragment.type) {
          case `bgColour`:
            paneFragmentBgColour.set({
              ...paneFragmentBgColour.get(),
              [paneFragmentId]: createFieldWithHistory(paneFragment),
            });
            return paneFragmentId;
          case `bgPane`:
            paneFragmentBgPane.set({
              ...paneFragmentBgPane.get(),
              [paneFragmentId]: createFieldWithHistory(paneFragment),
            });
            return paneFragmentId;
          case `markdown`:
            if (paneData.markdown) {
              paneFragmentMarkdown.set({
                ...paneFragmentMarkdown.get(),
                [paneFragmentId]: createFieldWithHistory({
                  markdown: paneData.markdown,
                  payload: paneFragment,
                  type: `markdown`,
                }),
              });
              paneMarkdownFragmentId.set({
                ...paneMarkdownFragmentId.get(),
                [paneId]: createFieldWithHistory(paneFragmentId),
              });
            } else console.log(`ERROR constructing markdown`, paneData);
            return paneFragmentId;
          default:
            console.log(
              `ERROR: Unknown paneFragment ${JSON.stringify(paneFragment)}`
            );
            return null;
        }
      })
      .filter((item): item is string => item !== null);
    // link pane fragments to pane
    if (thisPaneFragmentIds)
      paneFragmentIds.set({
        ...paneFragmentIds.get(),
        [paneId]: createFieldWithHistory(thisPaneFragmentIds),
      });
    else console.log(`ERROR constructing markdown`, paneData);
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
