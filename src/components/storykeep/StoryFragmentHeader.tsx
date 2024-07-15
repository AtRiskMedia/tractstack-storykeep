import { useState, useEffect, } from "react";
import { useStore } from "@nanostores/react";
import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import {
  unsavedChangesStore,
  uncleanDataStore,
  temporaryErrorsStore,
  storyFragmentInit,
  storyFragmentTitle,
  storyFragmentSlug,
  // Add other stores here
  //
} from "../../store/storykeep";
import {
  useStoryKeepUtils,
  handleToggleOn,
  handleToggleOff,
} from "../../utils/storykeep";
import { ContentEditableField } from "./ContentEditableField";
import type { StoreKey, StoreMapType, ValidationFunction } from "../../types";

const storeMap: StoreMapType = {
  storyFragmentTitle: storyFragmentTitle,
  storyFragmentSlug: storyFragmentSlug,
  // Add other stores here
};

const validationFunctions: Partial<Record<StoreKey, ValidationFunction>> = {
  // temporaryErrors will catch length === 0
  storyFragmentTitle: (value: string) => value.length <= 80,
  storyFragmentSlug: (value: string) =>
    value.length === 0 ||
    (value.length <= 50 && /^[a-z](?:[a-z0-9-]{0,49})?$/.test(value)),
  // Add more validation functions for other fields
  //
};

export const StoryFragmentHeader = (props: { id: string }) => {
  const { id } = props;

  // helpers
  const { isEditing, updateStoreField, handleUndo, handleEditingChange } =
    useStoryKeepUtils(id, storeMap, validationFunctions);

  // required stores
  const $unsavedChanges = useStore(unsavedChangesStore);
  const $uncleanData = useStore(uncleanDataStore);
  const $temporaryErrors = useStore(temporaryErrorsStore);
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $storyFragmentTitle = useStore(storyFragmentTitle);
  const $storyFragmentSlug = useStore(storyFragmentSlug);
  // Add other useStore hooks as needed
  //

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    if ($storyFragmentInit[id]?.init) {
      setIsClient(true);

      // Initialize unsavedChanges and uncleanData
      const initialUnsavedChanges: Record<StoreKey, boolean> = {
        storyFragmentTitle: false,
        storyFragmentSlug: false,
      };
      const initialUncleanData: Record<StoreKey, boolean> = {
        storyFragmentTitle: false,
        storyFragmentSlug: false,
      };
      (Object.keys(storeMap) as StoreKey[]).forEach(storeKey => {
        const store = storeMap[storeKey];
        if (store) {
          const field = store.get()[id];
          const validationFunction = validationFunctions[storeKey];
          if (
            field.current.length === 0 ||
            (validationFunction && !validationFunction(field.current))
          )
            initialUncleanData[storeKey] = true;
          else initialUncleanData[storeKey] = false;
          initialUnsavedChanges[storeKey] = field
            ? field.current !== field.original
            : false;
        }
      });
      unsavedChangesStore.setKey(id, initialUnsavedChanges);
      uncleanDataStore.setKey(id, initialUncleanData);
      temporaryErrorsStore.setKey(id, {
        storyFragmentTitle: false,
        storyFragmentSlug: false,
      });
    }
  }, [id, $storyFragmentInit]);

  if (!isClient) return <div>Loading...</div>;

  return (
    <div className="w-full">
      <div className="w-full my-2">
        <div className="flex flex-wrap items-center justify-end">
          <object
            type="image/svg+xml"
            data="/custom/logo.svg"
            className="h-5 w-auto pointer-events-none mr-2"
            aria-label="Logo"
          >
            Logo
          </object>
          <h1 className="font-2xl font-bold font-action mr-auto">
            <span className="xs:hidden md:inline-block">Welcome to your</span>{" "}
            Story Keep
          </h1>
          <button
            type="button"
            className="my-1 rounded bg-myblue px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
          >
            Settings
          </button>

          {Object.values($unsavedChanges[id] || {}).some(Boolean) ? (
            <a
              data-astro-reload
              href={`/${$storyFragmentSlug[id]?.original}/edit`}
              className="my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
            >
              Cancel
            </a>
          ) : (
            <a
              href={`/${$storyFragmentSlug[id]?.original}`}
              className="my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
            >
              Close
            </a>
          )}

          <button
            type="button"
            className="my-1 rounded bg-myorange px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack ml-2 disabled:hidden"
            disabled={
              !Object.values($unsavedChanges[id] || {}).some(Boolean) ||
              Object.values($uncleanData[id] || {}).some(Boolean)
            }
          >
            Save
          </button>
        </div>
      </div>

      <div className="md:flex md:items-center">
        <label
          htmlFor="storyFragmentTitle"
          className="block text-md leading-6 text-mydarkgrey md:mr-4 md:flex-shrink-0"
        >
          Descriptive title for this web page
        </label>
        <div className="inline-flex flex-nowrap w-full">
          <div className="relative mt-2 md:mt-0 md:flex-grow">
            <ContentEditableField
              value={$storyFragmentTitle[id]?.current || ""}
              onChange={newValue =>
                updateStoreField("storyFragmentTitle", newValue)
              }
              onEditingChange={editing =>
                handleEditingChange("storyFragmentTitle", editing)
              }
              placeholder="Enter title here"
              className="block w-full rounded-md border-0 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
              style={{
                border: "1px solid black",
                padding: "5px 30px 5px 5px",
                marginBottom: "10px",
                width: "100%",
              }}
            />
            {($uncleanData[id]?.storyFragmentTitle ||
              $temporaryErrors[id]?.storyFragmentTitle) && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-2">
                <ExclamationCircleIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-red-500"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => handleUndo("storyFragmentTitle")}
            className="disabled:hidden"
            disabled={$storyFragmentTitle[id]?.history.length === 0}
          >
            <ChevronDoubleLeftIcon
              className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 mb-2.5 ml-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
      </div>

      {(isEditing.storyFragmentTitle ||
        $uncleanData[id]?.storyFragmentTitle) && (
        <ul className="text-black bg-mygreen/20 rounded mb-2 font-lg flex flex-wrap px-4 py-2">
          <li className="pr-6 py-2">Short and sweet: max 50-60 characters.</li>
          <li className="pr-6 py-2">Be descriptive and make it unique.</li>
          <li className="pr-6 py-2">Include your most important keyword.</li>
          <li className="pr-6 py-2">Include your brand name.</li>
        </ul>
      )}

      <div className="md:flex md:items-center">
        <label
          htmlFor="storyFragmentSlug"
          className="block text-md leading-6 text-mydarkgrey md:mr-4 md:flex-shrink-0"
        >
          Slug (path) for this page
        </label>
        <div className="inline-flex flex-nowrap w-full">
          <div className="relative mt-2 md:mt-0 md:flex-grow">
            <ContentEditableField
              value={$storyFragmentSlug[id]?.current || ""}
              onChange={newValue =>
                updateStoreField("storyFragmentSlug", newValue)
              }
              onEditingChange={editing =>
                handleEditingChange("storyFragmentSlug", editing)
              }
              placeholder="Enter slug here"
              className="block w-full rounded-md border-0 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
              style={{
                border: "1px solid black",
                padding: "5px 30px 5px 5px",
                marginBottom: "10px",
                width: "100%",
              }}
            />
            {($uncleanData[id]?.storyFragmentSlug ||
              $temporaryErrors[id]?.storyFragmentSlug) && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-2">
                <ExclamationCircleIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-red-500"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => handleUndo("storyFragmentSlug")}
            className="disabled:hidden"
            disabled={$storyFragmentSlug[id]?.history.length === 0}
          >
            <ChevronDoubleLeftIcon
              className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 mb-2.5 ml-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
      </div>
      {(isEditing.storyFragmentSlug || $uncleanData[id]?.storyFragmentSlug) && (
        <ul className="text-black bg-mygreen/20 rounded mb-2 font-lg flex flex-wrap px-4 py-2">
          <li className="pr-6 py-2">All lowercase. No special characters.</li>
          <li className="pr-6 py-2">use-hyphens-to-separate-words</li>
          <li className="pr-6 py-2">3-5 words max!</li>
          <li className="pr-6 py-2">Be descriptive!</li>
          <li className="pr-6 py-2">Include your most important keyword.</li>
          <li className="pr-6 py-2">
            Avoid numbers and dates unless necessary.
          </li>
        </ul>
      )}

      <br />
      <button className="mx-2" onClick={handleToggleOn}>
        Edit Pane On
      </button>
      <button className="mx-2" onClick={handleToggleOff}>
        Edit Pane Off
      </button>
      <a className="mx-2" href="/hello/edit">
        hello
      </a>
      <a className="mx-2" href="/next-chapter-in-analytics/edit">
        next
      </a>
    </div>
  );
};
