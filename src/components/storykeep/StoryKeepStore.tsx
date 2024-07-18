import { useEffect } from "react";
import { ulid } from "ulid";
import {
  storyFragmentInit,
  storyFragmentTitle,
  storyFragmentSlug,
  storyFragmentTractStackId,
  storyFragmentMenuId,
  storyFragmentMenu,
  storyFragmentPaneIds,
  storyFragmentSocialImagePath,
  storyFragmentTailwindBgColour,
  paneInit,
  paneTitle,
  paneSlug,
  paneMarkdownBody,
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
  paneCodeHook,
  paneImpression,
  paneHeldBeliefs,
  paneWithheldBeliefs,
  unsavedChangesStore,
  uncleanDataStore,
  temporaryErrorsStore,
} from "../../store/storykeep";
import { storeMap, validationFunctions } from "../../utils/storykeep";
import type {
  StoreKey,
  StoryFragmentDatum,
  PaneDatum,
  FieldWithHistory,
  BgPaneDatum,
  BgColourDatum,
  MarkdownPaneDatum,
  ImpressionDatum,
} from "../../types";

function createFieldWithHistory<T>(value: T): FieldWithHistory<T> {
  return {
    current: value,
    original: value,
    history: [],
  };
}

export const StoryKeepStore = (props: {
  storyfragment: StoryFragmentDatum;
}) => {
  const { storyfragment } = props;

  useEffect(() => {
    const populateStores = (fragment: StoryFragmentDatum) => {
      if (!storyFragmentInit.get()[fragment.id]?.init) {
        storyFragmentInit.set({
          ...storyFragmentInit.get(),
          [fragment.id]: { init: true },
        });
        storyFragmentTitle.set({
          ...storyFragmentTitle.get(),
          [fragment.id]: createFieldWithHistory(fragment.title),
        });
        storyFragmentSlug.set({
          ...storyFragmentSlug.get(),
          [fragment.id]: createFieldWithHistory(fragment.slug),
        });
        storyFragmentTractStackId.set({
          ...storyFragmentTractStackId.get(),
          [fragment.id]: createFieldWithHistory(fragment.tractStackId),
        });
        storyFragmentMenuId.set({
          ...storyFragmentMenuId.get(),
          [fragment.id]: createFieldWithHistory(fragment.menuId || ``),
        });
        if (fragment?.menuPayload)
          storyFragmentMenu.set({
            ...storyFragmentMenu.get(),
            [fragment.id]: createFieldWithHistory(fragment.menuPayload),
          });
        storyFragmentPaneIds.set({
          ...storyFragmentPaneIds.get(),
          [fragment.id]: createFieldWithHistory(
            fragment.panesPayload.map((payload: PaneDatum) => payload.id)
          ),
        });
        storyFragmentSocialImagePath.set({
          ...storyFragmentSocialImagePath.get(),
          [fragment.id]: createFieldWithHistory(fragment.socialImagePath || ``),
        });
        storyFragmentTailwindBgColour.set({
          ...storyFragmentTailwindBgColour.get(),
          [fragment.id]: createFieldWithHistory(
            fragment.tailwindBgColour || ``
          ),
        });

        // Initialize unsavedChanges and uncleanData for this storyFragment
        const emptyStoryFragment = {
          storyFragmentTitle: false,
          storyFragmentSlug: false,
          storyFragmentTailwindBgColour: false,
          storyFragmentSocialImagePath: false,
          storyFragmentMenuId: false,
        };
        const initialUnsavedChanges: Record<StoreKey, boolean> =
          emptyStoryFragment;
        const initialUncleanData: Record<StoreKey, boolean> =
          emptyStoryFragment;
        (Object.keys(storeMap) as StoreKey[]).forEach(storeKey => {
          const store = storeMap[storeKey];
          if (store) {
            const field = store.get()[storyfragment.id];
            const validationFunction = validationFunctions[storeKey];
            if (
              (field && field.current.length === 0) ||
              (field &&
                validationFunction &&
                !validationFunction(field.current))
            )
              initialUncleanData[storeKey] = true;
            else initialUncleanData[storeKey] = false;
            initialUnsavedChanges[storeKey] = field
              ? field.current !== field.original
              : false;
          }
        });
        unsavedChangesStore.setKey(storyfragment.id, initialUnsavedChanges);
        uncleanDataStore.setKey(storyfragment.id, initialUncleanData);
        temporaryErrorsStore.setKey(storyfragment.id, emptyStoryFragment);

        fragment.panesPayload.forEach((payload: PaneDatum) => {
          if (!paneInit.get()[payload.id]?.init) {
            paneInit.set({
              ...paneInit.get(),
              [payload.id]: { init: true },
            });
            const thisPaneFragmentIds =
              payload.optionsPayload?.paneFragmentsPayload?.map(
                (
                  paneFragment: BgPaneDatum | BgColourDatum | MarkdownPaneDatum
                ) => {
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
                        [paneFragmentId]: createFieldWithHistory(paneFragment),
                      });
                      break;
                    default:
                      console.log(
                        `ERROR: Unknown paneFragment ${JSON.stringify(paneFragment)}`
                      );
                  }
                  return paneFragmentId;
                }
              ) || [];

            paneTitle.set({
              ...paneTitle.get(),
              [payload.id]: createFieldWithHistory(payload.title),
            });
            paneSlug.set({
              ...paneSlug.get(),
              [payload.id]: createFieldWithHistory(payload.slug),
            });
            paneMarkdownBody.set({
              ...paneMarkdownBody.get(),
              [payload.id]: createFieldWithHistory(payload.markdown.body || ``),
            });
            paneIsContextPane.set({
              ...paneIsContextPane.get(),
              [payload.id]: createFieldWithHistory(payload.isContextPane),
            });
            paneFragmentIds.set({
              ...paneFragmentIds.get(),
              [payload.id]: createFieldWithHistory(thisPaneFragmentIds),
            });
            paneHeightOffsetDesktop.set({
              ...paneHeightOffsetDesktop.get(),
              [payload.id]: createFieldWithHistory(payload.heightOffsetDesktop),
            });
            paneHeightOffsetMobile.set({
              ...paneHeightOffsetMobile.get(),
              [payload.id]: createFieldWithHistory(payload.heightOffsetTablet),
            });
            paneHeightOffsetTablet.set({
              ...paneHeightOffsetTablet.get(),
              [payload.id]: createFieldWithHistory(payload.heightOffsetMobile),
            });
            paneHeightRatioDesktop.set({
              ...paneHeightRatioDesktop.get(),
              [payload.id]: createFieldWithHistory(payload.heightRatioDesktop),
            });
            paneHeightRatioMobile.set({
              ...paneHeightRatioMobile.get(),
              [payload.id]: createFieldWithHistory(payload.heightRatioTablet),
            });
            paneHeightRatioTablet.set({
              ...paneHeightRatioTablet.get(),
              [payload.id]: createFieldWithHistory(payload.heightRatioMobile),
            });
            paneIsHiddenPane.set({
              ...paneIsHiddenPane.get(),
              [payload.id]: createFieldWithHistory(
                payload.optionsPayload.hiddenPane || false
              ),
            });
            paneHasOverflowHidden.set({
              ...paneHasOverflowHidden.get(),
              [payload.id]: createFieldWithHistory(
                payload.optionsPayload.overflowHidden || false
              ),
            });
            paneHasMaxHScreen.set({
              ...paneHasMaxHScreen.get(),
              [payload.id]: createFieldWithHistory(
                payload.optionsPayload.maxHScreen || false
              ),
            });
            if (payload?.optionsPayload?.codeHook)
              paneCodeHook.set({
                ...paneCodeHook.get(),
                [payload.id]: createFieldWithHistory(
                  payload.optionsPayload.codeHook
                ),
              });
            if (
              typeof payload?.optionsPayload?.impressions?.at(0) !== `undefined`
            )
              paneImpression.set({
                ...paneImpression.get(),
                [payload.id]: createFieldWithHistory(
                  payload.optionsPayload.impressions.at(0) as ImpressionDatum
                ),
              });
            if (payload?.optionsPayload?.heldBeliefs?.length)
              paneHeldBeliefs.set({
                ...paneHeldBeliefs.get(),
                [payload.id]: createFieldWithHistory(
                  payload.optionsPayload.heldBeliefs
                ),
              });
            if (payload?.optionsPayload?.withheldBeliefs?.length)
              paneWithheldBeliefs.set({
                ...paneWithheldBeliefs.get(),
                [payload.id]: createFieldWithHistory(
                  payload.optionsPayload.withheldBeliefs
                ),
              });
            if (payload?.files)
              paneFiles.set({
                ...paneFiles.get(),
                [payload.id]: createFieldWithHistory(payload.files),
              });
          }
        });
      }
    };

    populateStores(storyfragment);
  }, [storyfragment]);

  return null;
};
