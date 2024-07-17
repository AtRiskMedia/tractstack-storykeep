import { useState, useRef, useEffect } from "react";
import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import { useStore } from "@nanostores/react";
import {
  storyFragmentTailwindBgColour,
  uncleanDataStore,
  temporaryErrorsStore,
} from "../../../store/storykeep";
import { debounce } from "../../../utils/helpers";
import type { StoreKey } from "../../../types";

interface StoryFragmentTailwindBgColourProps {
  id: string;
  isEditing: Partial<Record<StoreKey, boolean>>;
  handleEditingChange: (storeKey: StoreKey, editing: boolean) => void;
  updateStoreField: (storeKey: StoreKey, newValue: string) => boolean;
  handleUndo: (storeKey: StoreKey) => void;
}

const StoryFragmentTailwindBgColour = ({
  id,
  isEditing,
  handleEditingChange,
  updateStoreField,
  handleUndo,
}: StoryFragmentTailwindBgColourProps) => {
  const $storyFragmentTailwindBgColour = useStore(
    storyFragmentTailwindBgColour
  );
  const $uncleanData = useStore(uncleanDataStore);
  const $temporaryErrors = useStore(temporaryErrorsStore);

  const [localValue, setLocalValue] = useState(
    $storyFragmentTailwindBgColour[id]?.current || ""
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedUpdateField = useRef(
    debounce((newValue: string) => {
      updateStoreField("storyFragmentTailwindBgColour", newValue);
    }, 300)
  ).current;

  useEffect(() => {
    setLocalValue($storyFragmentTailwindBgColour[id]?.current || "");
  }, [$storyFragmentTailwindBgColour[id]?.current]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedUpdateField(newValue);
  };

  const handleFocus = () =>
    handleEditingChange("storyFragmentTailwindBgColour", true);
  const handleBlur = () =>
    handleEditingChange("storyFragmentTailwindBgColour", false);

  const handleUndoCallback = () => {
    handleUndo("storyFragmentTailwindBgColour");
  };

  return (
    <>
      <div className="flex items-center space-x-4 space-y-2">
        <label
          htmlFor="storyFragmentTailwindBgColour"
          className="text-md leading-6 text-mydarkgrey flex-shrink-0"
        >
          Tailwind Background Color
        </label>
        <div className="flex flex-grow items-center">
          <div className="relative flex-grow">
            <input
              ref={inputRef}
              type="text"
              value={localValue}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder="Enter Tailwind color class"
              className="block w-full rounded-md border-0 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
              style={{
                border: "1px solid black",
                padding: "5px 30px 5px 5px",
                width: "100%",
              }}
            />
            {($uncleanData[id]?.storyFragmentTailwindBgColour ||
              $temporaryErrors[id]?.storyFragmentTailwindBgColour) && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-red-500"
                />
              </div>
            )}
          </div>
          <button
            onClick={handleUndoCallback}
            className="disabled:hidden ml-2"
            disabled={$storyFragmentTailwindBgColour[id]?.history.length === 0}
          >
            <ChevronDoubleLeftIcon
              className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
      </div>
      {(isEditing.storyFragmentTailwindBgColour ||
        $uncleanData[id]?.storyFragmentTailwindBgColour) && (
        <ul className="text-black bg-mygreen/20 rounded mt-2 font-lg flex flex-wrap px-4 py-2">
          <li className="pr-6 py-2">Use valid Tailwind color classes.</li>
          <li className="pr-6 py-2">Example: bg-blue-500</li>
          <li className="pr-6 py-2">
            Ensure the class exists in your Tailwind configuration.
          </li>
        </ul>
      )}
    </>
  );
};

export default StoryFragmentTailwindBgColour;
