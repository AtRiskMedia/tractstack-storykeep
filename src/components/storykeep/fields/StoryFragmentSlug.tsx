import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../ContentEditableField";
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
  handleUndo: (storeKey: StoreKey) => void;
}

const StoryFragmentSlug = ({
  id,
  isEditing,
  handleEditingChange,
  updateStoreField,
  handleUndo,
}: StoryFragmentSlugProps) => {
  const $storyFragmentSlug = useStore(storyFragmentSlug);
  const $uncleanData = useStore(uncleanDataStore);
  const $temporaryErrors = useStore(temporaryErrorsStore);

  return (
    <>
      <div className="flex items-center space-x-4 space-y-2">
        <span
          id="storyFragmentSlug-label"
          className="text-md leading-6 text-mydarkgrey flex-shrink-0"
        >
          Descriptive title{" "}
          <span className="hidden md:inline-block">for this web page</span>
        </span>
        <div className="flex flex-grow items-center">
          <div className="relative flex-grow">
            <ContentEditableField
              id="storyFragmentSlug"
              value={$storyFragmentSlug[id]?.current || ""}
              onChange={newValue =>
                updateStoreField("storyFragmentSlug", newValue)
              }
              onEditingChange={editing =>
                handleEditingChange("storyFragmentSlug", editing)
              }
              placeholder="Enter title here"
              className="block w-full rounded-md border-0 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
              style={{
                border: "1px solid black",
                padding: "5px 30px 5px 5px",
                width: "100%",
              }}
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
            onClick={() => handleUndo("storyFragmentSlug")}
            className="disabled:hidden ml-2"
            disabled={$storyFragmentSlug[id]?.history.length === 0}
          >
            <ChevronDoubleLeftIcon
              className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
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
        </ul>
      )}
    </>
  );
};

export default StoryFragmentSlug;
