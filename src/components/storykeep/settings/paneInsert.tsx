import { useEffect, useState } from "react";
import { useStore } from "@nanostores/react";
import {
  storyFragmentPaneIds,
  paneTitle,
  paneSlug,
  uncleanDataStore,
} from "../../../store/storykeep";
import { cleanString } from "../../../utils/helpers";
import { useStoryKeepUtils } from "../../../utils/storykeep";
import PaneTitle from "../fields/PaneTitle";
import PaneSlug from "../fields/PaneSlug";
import type { StoreKey } from "../../../types";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const PaneInsert = (props: {
  storyFragmentId: string;
  paneId: string;
  payload: any;
  toggleOff: () => void;
}) => {
  const { storyFragmentId, paneId, payload, toggleOff } = props;
  const [isClient, setIsClient] = useState(false);
  const $uncleanData = useStore(uncleanDataStore, { keys: [paneId] });
  const $storyFragmentPaneIds = useStore(storyFragmentPaneIds, {
    keys: [storyFragmentId],
  });
  const $paneTitle = useStore(paneTitle);
  const $paneSlug = useStore(paneSlug);
  const { updateStoreField, handleEditingChange, handleUndo } =
    useStoryKeepUtils(paneId);
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
      uncleanDataStore.setKey(paneId, {
        ...(uncleanDataStore.get()[paneId] || {}),
        [`paneSlug`]: clean.length === 0,
      });
      paneSlug.setKey(paneId, { current: clean, original: clean, history: [] });
    }
    return handleEditingChange(storeKey, editing);
  };
  const handleSave = () => {
    console.log(`insert!`, payload);
    const newPaneIds = [...$storyFragmentPaneIds[storyFragmentId].current];
    newPaneIds.splice(payload.index, 0, paneId);
    console.log(newPaneIds);
    console.log(
      `must ingest new pane into store; then update storyFragmentPaneIds`
    );
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
        <div className="mt-4 flex gap-x-4">
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
        <div className="w-full mt-4">
          <button
            type="button"
            onClick={toggleOff}
            className="my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-myorange/20 hover:text-black hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
