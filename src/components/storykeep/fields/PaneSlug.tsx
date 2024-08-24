import {
  ExclamationCircleIcon,
  ChevronDoubleLeftIcon,
} from "@heroicons/react/24/outline";
import ContentEditableField from "../components/ContentEditableField";
import { useStore } from "@nanostores/react";
import {
  paneSlug,
  uncleanDataStore,
  temporaryErrorsStore,
} from "../../../store/storykeep";
import type { StoreKey } from "../../../types";

interface PaneSlugProps {
  id: string;
  handleEditingChange: (storeKey: StoreKey, editing: boolean) => void;
  updateStoreField: (storeKey: StoreKey, newValue: string) => boolean;
  handleUndo: (storeKey: StoreKey, id: string) => void;
}

const PaneSlug = ({
  id,
  handleEditingChange,
  updateStoreField,
  handleUndo,
}: PaneSlugProps) => {
  const $paneSlug = useStore(paneSlug, { keys: [id] });
  const $uncleanData = useStore(uncleanDataStore, { keys: [id] });
  const $temporaryErrors = useStore(temporaryErrorsStore, { keys: [id] });

  return (
    <div className="flex items-center space-x-4 py-1.5">
      <span
        id="paneSlug-label"
        className="flex items-center text-md text-mydarkgrey flex-shrink-0"
      >
        Pane Slug
      </span>
      <div className="flex-grow relative">
        <ContentEditableField
          id="paneSlug"
          value={$paneSlug[id]?.current || ""}
          onChange={newValue => updateStoreField("paneSlug", newValue)}
          onEditingChange={editing => handleEditingChange("paneSlug", editing)}
          placeholder="Enter pane slug"
          className="block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen sm:text-sm sm:leading-6"
          hyphenate={true}
        />
        {($uncleanData[id]?.paneSlug || $temporaryErrors[id]?.paneSlug) && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            <ExclamationCircleIcon
              aria-hidden="true"
              className="h-5 w-5 text-red-500"
            />
          </div>
        )}
      </div>
      <button
        onClick={() => handleUndo("paneSlug", id)}
        className="disabled:hidden ml-2"
        disabled={$paneSlug[id]?.history.length === 0}
      >
        <ChevronDoubleLeftIcon
          className="h-8 w-8 text-myblack rounded bg-mygreen/50 px-1 hover:bg-myorange hover:text-white"
          title="Undo"
        />
      </button>
    </div>
  );
};

export default PaneSlug;
