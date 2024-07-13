import { useState, useEffect, useCallback, useRef } from "react";
import { useStore } from "@nanostores/react";
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
  slug: (value: string) => /^[a-z0-9-]+$/.test(value) && value.length <= 50,
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

  const handleChange = useCallback(
    (storeKey: StoreKey, newValue: string) => {
      const store = storeMap[storeKey];
      if (!store) return;

      const validationFunction = validationFunctions[storeKey];
      if (validationFunction && !validationFunction(newValue)) {
        setErrorMessages(prev => ({
          ...prev,
          [storeKey]: getErrorMessage(storeKey, newValue),
        }));
        return;
      }

      setErrorMessages(prev => ({ ...prev, [storeKey]: undefined }));

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

  const handleRevert = useCallback(
    (storeKey: StoreKey) => {
      const store = storeMap[storeKey];
      if (!store) return;

      const currentStoreValue = store.get();
      const currentField = currentStoreValue[id];
      if (currentField && currentField.history.length > 0) {
        const originalValue =
          currentField.history[currentField.history.length - 1].value;
        store.set({
          ...currentStoreValue,
          [id]: {
            current: originalValue,
            history: [],
          },
        });
        setErrorMessages(prev => ({ ...prev, [storeKey]: undefined }));
      }
    },
    [id]
  );

  if (!isClient || Object.values(initialValues).some(v => v === null)) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full">
      <div className="w-full">
        {errorMessages.title && (
          <div className="text-red-500 mb-2">{errorMessages.title}</div>
        )}
        <ContentEditableField
          value={$storyFragmentTitle[id]?.current || ""}
          onChange={newValue => handleChange("title", newValue)}
          onRevert={() => handleRevert("title")}
          placeholder="Enter title here"
          style={{
            border: "1px solid black",
            padding: "5px",
            marginBottom: "10px",
          }}
        />
        <button
          onClick={() => handleUndo("title")}
          disabled={$storyFragmentTitle[id]?.history.length === 0}
        >
          Undo Title
        </button>
      </div>
      <div className="w-full">
        {errorMessages.slug && (
          <div className="text-red-500 mb-2">{errorMessages.slug}</div>
        )}
        <ContentEditableField
          value={$storyFragmentSlug[id]?.current || ""}
          onChange={newValue => handleChange("slug", newValue)}
          onRevert={() => handleRevert("slug")}
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
