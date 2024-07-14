import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
import { ExclamationCircleIcon,ChevronDoubleLeftIcon } from "@heroicons/react/24/outline";
import {
  storyFragmentTitle,
  storyFragmentSlug /* other stores */,
} from "../../store/storykeep";
import { ContentEditableField } from "./ContentEditableField";
import type { FieldWithHistory, ValidationFunction } from "../../types";
import type { MapStore } from "nanostores";

type ErrorMessages = Partial<Record<StoreKey, string>>;
type StoreKey = "title" | "slug" /* add other store keys as needed */;

type StoreMapType = {
  [K in StoreKey]?: MapStore<Record<string, FieldWithHistory<string>>>;
};

const storeMap: StoreMapType = {
  title: storyFragmentTitle,
  slug: storyFragmentSlug,
  // Add other stores here
};

const validationFunctions: Partial<Record<StoreKey, ValidationFunction>> = {
  title: (value: string) => value.length <= 80,
  slug: (value: string) => value.length <= 50 && /^[a-z0-9-]*$/.test(value),
  // Add more validation functions for other fields
};

const getErrorMessage = (storeKey: StoreKey, value: string): string => {
  switch (storeKey) {
    case "title":
      return "Title must be 80 characters or less.";
    case "slug":
      return "Slug should be descriptive and 15-20 letters if possible. Must be 50 characters or less and contain only lowercase letters, numbers, and hyphens.";
    // Add more cases for other fields
    default:
      console.log(`Invalid input: ${value}`);
      return "Invalid input.";
  }
};

export const StoryFragmentHeader = (props: { id: string }) => {
  const { id } = props;
  const [isClient, setIsClient] = useState(false);
  const [initialValues, setInitialValues] = useState<
    Record<StoreKey, string | null>
  >({
    title: null,
    slug: null,
    // Initialize other fields here
  });
  const lastUpdateTimeRef = useRef<Record<StoreKey, number>>({
    title: 0,
    slug: 0,
  });
  const [errorMessages, setErrorMessages] = useState<ErrorMessages>({});

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
    setIsClient(true);
  }, []);

  const $storyFragmentTitle = useStore(storyFragmentTitle);
  const $storyFragmentSlug = useStore(storyFragmentSlug);
  // Add other useStore hooks as needed

  useEffect(() => {
    // Check if the values are already set in the stores
    setInitialValues({
      title: $storyFragmentTitle[id]?.current ?? "Enter title here",
      slug: $storyFragmentSlug[id]?.current ?? "enter-slug-here",
      // Set initial values for other fields
    });

    // Initialize stores if needed
    Object.entries(storeMap).forEach(([key, store]) => {
      if (store && store.get()[id] === undefined) {
        store.set({
          ...store.get(),
          [id]: {
            current: initialValues[key as StoreKey] ?? "",
            history: [],
          },
        });
      }
    });
  }, [
    id,
    $storyFragmentTitle,
    $storyFragmentSlug /* add other store variables */,
  ]);

  const updateStoreField = useCallback(
    (storeKey: StoreKey, newValue: string): boolean => {
      const store = storeMap[storeKey];
      if (!store) return false;

      const validationFunction = validationFunctions[storeKey];
      if (validationFunction && !validationFunction(newValue)) {
        setErrorMessages(prev => ({
          ...prev,
          [storeKey]: getErrorMessage(storeKey, newValue),
        }));
        return false;
      }

      setErrorMessages(prev => ({ ...prev, [storeKey]: undefined }));

      // Set error message if the field is empty, but allow the update
      if (newValue.length === 0) {
        setErrorMessages(prev => ({
          ...prev,
          [storeKey]: `${storeKey.charAt(0).toUpperCase() + storeKey.slice(1)} cannot be empty.`,
        }));
      } else {
        setErrorMessages(prev => ({ ...prev, [storeKey]: undefined }));
      }

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      const now = Date.now();

      if (currentField && newValue !== currentField.current) {
        const timeSinceLastUpdate = now - lastUpdateTimeRef.current[storeKey];
        const newField: FieldWithHistory<string> = {
          current: newValue,
          history: currentField.history,
        };

        store.set({
          ...currentStoreValue,
          [id]: {
            ...newField,
            current: newValue,
          },
        });

        if (currentField.history.length === 0 || timeSinceLastUpdate > 5000) {
          newField.history = [
            { value: currentField.current, timestamp: now },
            ...currentField.history,
          ].slice(0, 10);
          lastUpdateTimeRef.current[storeKey] = now;

          store.set({
            ...currentStoreValue,
            [id]: newField,
          });
        }
      }
      return true;
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
        store.set({
          ...currentStoreValue,
          [id]: {
            current: lastEntry.value,
            history: newHistory,
          },
        });
        lastUpdateTimeRef.current[storeKey] = Date.now();
      }
    },
    [id]
  );

  if (!isClient || Object.values(initialValues).some(v => v === null)) {
    return <div>Loading...</div>;
  }

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
            className="my-1 rounded bg-myblack px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
          >
            Settings
          </button>
          <button
            type="button"
            className="my-1 rounded bg-mydarkgrey px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myorange ml-2"
          >
            Cancel
          </button>
          <button
            type="button"
            className="my-1 rounded bg-myorange px-2 py-1 text-lg text-white shadow-sm hover:bg-mywhite hover:text-myorange focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-myblack ml-2 disabled:hidden"
            disabled={
              Object.values(errorMessages).filter(value => value !== undefined)
                .length > 0
            }
          >
            Save
          </button>
        </div>
      </div>

      <div className="md:flex md:items-center">
        <label
          htmlFor="title"
          className="block text-md leading-6 text-mydarkgrey md:mr-4 md:flex-shrink-0"
        >
          Descriptive title for this web page
        </label>
        <div className="inline-flex flex-nowrap w-full">
        <div className="relative mt-2 md:mt-0 md:flex-grow">
          <ContentEditableField
            value={$storyFragmentTitle[id]?.current || ""}
            onChange={newValue => updateStoreField("title", newValue)}
            placeholder="Enter title here"
            className="block w-full rounded-md border-0 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
            style={{
              border: "1px solid black",
              padding: "5px 30px 5px 5px",
              marginBottom: "10px",
              width: "100%",
            }}
          />
          {errorMessages.title && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 pb-2">
              <ExclamationCircleIcon
                aria-hidden="true"
                className="h-5 w-5 text-red-500"
              />
            </div>
          )}
        </div>
        <button
          onClick={() => handleUndo("title")}
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
      <div id="title-error" className="mt-2 text-sm text-red-600">
        {errorMessages.title && (
          <div className="text-red-500 mb-2">{errorMessages.title}</div>
        )}
      </div>

      <div className="w-full">
        {errorMessages.slug && (
          <div className="text-red-500 mb-2">{errorMessages.slug}</div>
        )}
        <ContentEditableField
          value={$storyFragmentSlug[id]?.current || ""}
          onChange={newValue => updateStoreField("slug", newValue)}
          placeholder="enter-slug-here"
          style={{
            border: "1px solid black",
            padding: "5px",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={() => handleUndo("slug")}
          disabled={$storyFragmentSlug[id]?.history.length === 0}
        >
          Undo Slug
        </button>
      </div>
      {/* Add more editable fields as needed */}
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
