import { useCallback } from "react";
import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../ContentEditableField";
import { useStore } from "@nanostores/react";
import {
  storyFragmentMenuId,
  uncleanDataStore,
  temporaryErrorsStore,
} from "../../../store/storykeep";
import type { StoreKey } from "../../../types";

interface StoryFragmentMenuProps {
  id: string;
  isEditing: Partial<Record<StoreKey, boolean>>;
  handleEditingChange: (storeKey: StoreKey, editing: boolean) => void;
  updateStoreField: (storeKey: StoreKey, newValue: string) => boolean;
  handleUndo: (storeKey: StoreKey) => void;
}

const StoryFragmentMenu = ({
  id,
  //isEditing,
  handleEditingChange,
  updateStoreField,
  handleUndo,
}: StoryFragmentMenuProps) => {
  const $storyFragmentMenuId = useStore(storyFragmentMenuId);
  const $uncleanData = useStore(uncleanDataStore);
  const $temporaryErrors = useStore(temporaryErrorsStore);

  const handleChange = useCallback(
    (newValue: string) => {
      updateStoreField("storyFragmentMenuId", newValue);
      return true;
    },
    [updateStoreField]
  );

  const handleEditChange = useCallback(
    (editing: boolean) => {
      handleEditingChange("storyFragmentMenuId", editing);
    },
    [handleEditingChange]
  );

  return (
    <>
      <div className="flex items-center space-x-4 space-y-2">
        <span
          id="storyFragmentMenuId-label"
          className="text-md leading-6 text-mydarkgrey flex-shrink-0"
        >
          menu?
        </span>
        <div className="flex flex-grow items-center">
          <div className="relative flex-grow">
            <ContentEditableField
              id="storyFragmentMenuId"
              value={$storyFragmentMenuId[id]?.current || ""}
              onChange={handleChange}
              onEditingChange={editing => handleEditChange(editing)}
              placeholder="Enter title here"
              className="block w-full rounded-md border-0 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
              style={{
                border: "1px solid black",
                padding: "5px 30px 5px 5px",
                width: "100%",
              }}
            />
            {($uncleanData[id]?.storyFragmentMenuId ||
              $temporaryErrors[id]?.storyFragmentMenuId) && (
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <ExclamationCircleIcon
                  aria-hidden="true"
                  className="h-5 w-5 text-red-500"
                />
              </div>
            )}
          </div>
          <button
            onClick={() => handleUndo("storyFragmentMenuId")}
            className="disabled:hidden ml-2"
            disabled={$storyFragmentMenuId[id]?.history.length === 0}
          >
            <ChevronDoubleLeftIcon
              className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
              title="Undo"
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default StoryFragmentMenu;
