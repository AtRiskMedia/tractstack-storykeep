import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import {
  storyFragmentInit,
  storyFragmentTitle,
  storyFragmentSlug,
  // Add other stores here
  //
} from "../../store/storykeep";
import { ContentEditableField } from "./ContentEditableField";
import type { FieldWithHistory, ValidationFunction } from "../../types";
import type { MapStore } from "nanostores";

type StoreKey = "storyFragmentTitle" | "storyFragmentSlug";
// Add other stores here
//

type StoreMapType = {
  [K in StoreKey]?: MapStore<Record<string, FieldWithHistory<string>>>;
};

const storeMap: StoreMapType = {
  storyFragmentTitle: storyFragmentTitle,
  storyFragmentSlug: storyFragmentSlug,
  // Add other stores here
};

const validationFunctions: Partial<Record<StoreKey, ValidationFunction>> = {
  storyFragmentTitle: (value: string) => value.length <= 80,
  storyFragmentSlug: (value: string) =>
    value.length <= 50 && /^[a-z0-9-]*$/.test(value),
  // Add more validation functions for other fields
  //
};

export const StoryFragmentHeader = (props: { id: string }) => {
  const $storyFragmentInit = useStore(storyFragmentInit);
  const $storyFragmentTitle = useStore(storyFragmentTitle);
  const $storyFragmentSlug = useStore(storyFragmentSlug);
  // Add other useStore hooks as needed
  //

  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [isEditing, setIsEditing] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});
  const lastUpdateTimeRef = useRef<Record<StoreKey, number>>({
    storyFragmentTitle: 0,
    storyFragmentSlug: 0,
  });
  const [temporaryErrors, setTemporaryErrors] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});
  const [unsavedChanges, setUnsavedChanges] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});
  const [uncleanData, setUncleanData] = useState<
    Partial<Record<StoreKey, boolean>>
  >({});

  // global fn to toggle layout
  const handleToggleOn = () => {
    const event = new CustomEvent("toggle-on-edit-modal");
    document.dispatchEvent(event);
  };
  const handleToggleOff = () => {
    const event = new CustomEvent("toggle-off-edit-modal");
    document.dispatchEvent(event);
  };

  useEffect(() => {
    if ($storyFragmentInit[id]?.init) {
      setIsClient(true);

      // Initialize UncleanData
      // Initialize unsavedChanges
      const initialUnsavedChanges: Partial<Record<StoreKey, boolean>> = {};
      const initialUncleanData: Partial<Record<StoreKey, boolean>> = {};
      (Object.keys(storeMap) as StoreKey[]).forEach(storeKey => {
        const store = storeMap[storeKey];
        if (store) {
          const field = store.get()[id];
          const validationFunction = validationFunctions[storeKey];
          if (validationFunction && !validationFunction(field.current))
            initialUncleanData[storeKey] = true;
          else initialUncleanData[storeKey] = false;
          initialUnsavedChanges[storeKey] = field
            ? field.current !== field.original
            : false;
        }
      });
      setUnsavedChanges(initialUnsavedChanges);
      setUncleanData(initialUncleanData);
    }
  }, [id, $storyFragmentInit]);

  const setTemporaryError = useCallback((storeKey: StoreKey) => {
    setTemporaryErrors(prev => ({ ...prev, [storeKey]: true }));
    setTimeout(() => {
      setTemporaryErrors(prev => ({ ...prev, [storeKey]: false }));
    }, 2000);
  }, []);

  const updateStoreField = useCallback(
    (storeKey: StoreKey, newValue: string): boolean => {
      const store = storeMap[storeKey];
      if (!store) return false;

      const validationFunction = validationFunctions[storeKey];
      if (validationFunction && !validationFunction(newValue)) {
        setTemporaryError(storeKey);
        //setUncleanData(prev => ({
        //  ...prev,
        //  [storeKey]: true,
        //}));
        return false;
      }

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      const now = Date.now();

      if (currentField && newValue !== currentField.current) {
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current[storeKey];
        const newField: FieldWithHistory<string> = {
          current: newValue,
          original: currentField.original,
          history: currentField.history,
        };

        // Update history if necessary
        if (currentField.history.length === 0 || timeSinceLastUpdate > 5000) {
          newField.history = [
            { value: currentField.current, timestamp: now },
            ...currentField.history,
          ].slice(0, 10);
          lastUpdateTimeRef.current[storeKey] = now;
        }

        // Set unclean data on empty field, but allow the update
        if (newValue.length === 0) {
          setUncleanData(prev => ({
            ...prev,
            [storeKey]: true,
          }));
        } else {
          // validation already passed, so we can set true
          setUncleanData(prev => ({
            ...prev,
            [storeKey]: false,
          }));
        }

        // Update the store once
        store.set({
          ...currentStoreValue,
          [id]: newField,
        });

        // Update unsaved changes
        const isUnsaved = newValue !== currentField.original;
        setUnsavedChanges(prev => ({
          ...prev,
          [storeKey]: isUnsaved,
        }));

        return true;
      }

      return false;
    },
    [id]
  );

  const handleUndo = useCallback(
    (storeKey: StoreKey) => {
      const store = storeMap[storeKey];
      if (!store) return;

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      if (currentField && currentField.history.length > 0) {
        const [lastEntry, ...newHistory] = currentField.history;

        // Validate the value from history
        const validationFunction = validationFunctions[storeKey];
        if (validationFunction && !validationFunction(lastEntry.value)) {
          // If validation fails, set temporary error
          setTemporaryError(storeKey);
          return; // Exit without updating the store
        }

        // If validation passes, update the store
        store.set({
          ...currentStoreValue,
          [id]: {
            current: lastEntry.value,
            original: currentField.original,
            history: newHistory,
          },
        });
        lastUpdateTimeRef.current[storeKey] = Date.now();

        // Update unsaved changes
        const isUnsaved = lastEntry.value !== currentField.original;
        setUnsavedChanges(prev => ({
          ...prev,
          [storeKey]: isUnsaved,
        }));

        // Clear unclean data flag if it was set
        setUncleanData(prev => ({
          ...prev,
          [storeKey]: false,
        }));

        // Trigger the onChange function to ensure all side effects are handled
        updateStoreField(storeKey, lastEntry.value);
      }
    },
    [id, setTemporaryError, updateStoreField]
  );

  const handleEditingChange = useCallback(
    (storeKey: StoreKey, editing: boolean) => {
      setIsEditing(prev => ({ ...prev, [storeKey]: editing }));
    },
    []
  );

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
            className="my-1 rounded bg-myblack px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
          >
            Settings
          </button>
          <button
            type="button"
            className="my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
          >
            Cancel
          </button>
          <button
            type="button"
            className="my-1 rounded bg-myorange px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack ml-2 disabled:hidden"
            disabled={
              !Object.values(unsavedChanges).some(Boolean) ||
              Object.values(uncleanData).some(Boolean) ||
              Object.values(temporaryErrors).some(Boolean)
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
            {(uncleanData[`storyFragmentTitle`] ||
              temporaryErrors[`storyFragmentTitle`]) && (
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
              className="h-8 w-8 text-myorange rounded bg-slate-200 px-1 mb-2.5 ml-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
      </div>
      {(isEditing.storyFragmentTitle || uncleanData[`storyFragmentTitle`]) && (
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
            {(uncleanData[`storyFragmentSlug`] ||
              temporaryErrors[`storyFragmentSlug`]) && (
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
              className="h-8 w-8 text-myorange rounded bg-slate-200 px-1 mb-2.5 ml-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
      </div>
      {(isEditing.storyFragmentSlug || uncleanData[`storyFragmentSlug`]) && (
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
