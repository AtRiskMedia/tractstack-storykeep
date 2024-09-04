import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../components/ContentEditableField";
import { useStore } from "@nanostores/react";
import {
  storyFragmentSlug,
  uncleanDataStore,
  temporaryErrorsStore,
} from "../../../store/storykeep";
import type { StoreKey } from "../../../types";

interface StoryFragmentSlugProps {
  id: string;
  isEditing: Partial<Record<StoreKey, boolean>>;
  handleEditingChange: (storeKey: StoreKey, editing: boolean) => void;
  updateStoreField: (storeKey: StoreKey, newValue: string) => boolean;
  handleUndo: (storeKey: StoreKey, id: string) => void;
}

const StoryFragmentSlug = ({
  id,
  isEditing,
  handleEditingChange,
  updateStoreField,
  handleUndo,
}: StoryFragmentSlugProps) => {
  const $storyFragmentSlug = useStore(storyFragmentSlug, { keys: [id] });
  const $uncleanData = useStore(uncleanDataStore, { keys: [id] });
  const $temporaryErrors = useStore(temporaryErrorsStore, { keys: [id] });

  return (
    <>
      <div className="flex items-center space-x-4 py-1.5">
        <span
          id="storyFragmentSlug-label"
          className="flex items-center text-md text-mydarkgrey flex-shrink-0"
        >
          Slug <span className="hidden md:inline-block ml-1">(url path)</span>
        </span>
        <div className="flex-grow relative">
          <ContentEditableField
            id="storyFragmentSlug"
            value={$storyFragmentSlug[id]?.current || ""}
            onChange={newValue =>
              updateStoreField("storyFragmentSlug", newValue)
            }
            onEditingChange={editing =>
              handleEditingChange("storyFragmentSlug", editing)
            }
            placeholder="Enter slug here"
            className="block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen xs:text-sm xs:leading-6"
            hyphenate={true}
          />
          {($uncleanData[id]?.storyFragmentSlug ||
            $temporaryErrors[id]?.storyFragmentSlug) && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon
                aria-hidden="true"
                className="h-5 w-5 text-red-500"
              />
            </div>
          )}
        </div>
        <button
          onClick={() => handleUndo("storyFragmentSlug", id)}
          className="disabled:hidden ml-2"
          disabled={$storyFragmentSlug[id]?.history.length === 0}
        >
          <ChevronDoubleLeftIcon
            className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
            title="Undo"
          />
        </button>
      </div>
      {(isEditing.storyFragmentSlug || $uncleanData[id]?.storyFragmentSlug) && (
        <ul className="text-black bg-mygreen/20 rounded mt-2 font-lg flex flex-wrap px-4 py-2">
          <li className="pr-6 py-2">All lowercase. No special characters.</li>
          <li className="pr-6 py-2">use-hyphens-to-separate-words</li>
          <li className="pr-6 py-2">3-5 words max!</li>
          <li className="pr-6 py-2">Be descriptive!</li>
          <li className="pr-6 py-2">Include your most important keyword.</li>
          <li className="pr-6 py-2">
            Avoid numbers and dates unless necessary.
          </li>
          <li className="pr-6 py-2 font-bold">No Duplicates!</li>
        </ul>
      )}
    </>
  );
};

export default StoryFragmentSlug;
