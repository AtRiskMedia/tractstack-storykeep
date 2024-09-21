import { useState, useCallback } from "react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import type { MenuDatum, MenuLink } from "../../../types";

interface MenuEditorProps {
  menu: MenuDatum;
  onCancel: () => void;
  onSave: (updatedMenu: MenuDatum) => void;
}

export default function MenuEditor({
  menu,
  onCancel,
  onSave,
}: MenuEditorProps) {
  const [localMenu, setLocalMenu] = useState<MenuDatum>(menu);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleChange = useCallback((field: keyof MenuDatum, value: any) => {
    setLocalMenu(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  }, []);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleLinkChange = useCallback(
    (index: number, field: keyof MenuLink, value: any) => {
      setLocalMenu(prev => {
        const newLinks = [...prev.optionsPayload];
        newLinks[index] = { ...newLinks[index], [field]: value };
        return { ...prev, optionsPayload: newLinks };
      });
      setUnsavedChanges(true);
    },
    []
  );

  const handleAddLink = useCallback(() => {
    setLocalMenu(prev => ({
      ...prev,
      optionsPayload: [
        ...prev.optionsPayload,
        {
          name: "",
          description: "",
          featured: false,
          actionLisp: "",
          to: "",
          internal: true,
        },
      ],
    }));
    setUnsavedChanges(true);
  }, []);

  const handleRemoveLink = useCallback((index: number) => {
    setLocalMenu(prev => ({
      ...prev,
      optionsPayload: prev.optionsPayload.filter((_, i) => i !== index),
    }));
    setUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localMenu);
    setUnsavedChanges(false);
  }, [localMenu, onSave]);

  const handleCancel = useCallback(() => {
    if (unsavedChanges) {
      if (
        window.confirm(
          "You have unsaved changes. Are you sure you want to cancel?"
        )
      ) {
        onCancel();
      }
    } else {
      onCancel();
    }
  }, [unsavedChanges, onCancel]);

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-mydarkgrey">
          Title
        </label>
        <input
          type="text"
          value={localMenu.title}
          onChange={e => handleChange("title", e.target.value)}
          className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-mydarkgrey">
          Theme
        </label>
        <input
          type="text"
          value={localMenu.theme}
          onChange={e => handleChange("theme", e.target.value)}
          className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
        />
      </div>

      <div>
        <h3 className="text-lg font-medium text-mydarkgrey mb-2">Menu Links</h3>
        {localMenu.optionsPayload.map((link, index) => (
          <div key={index} className="border-b border-mylightgrey/20 pb-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-md font-medium text-mydarkgrey">
                Link {index + 1}
              </h4>
              <button
                onClick={() => handleRemoveLink(index)}
                className="text-myorange hover:text-black"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            {Object.entries(link).map(([key, value]) => (
              <div key={key} className="mb-2">
                <label className="block text-sm font-medium text-mydarkgrey">
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                </label>
                {typeof value === "boolean" ? (
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={e =>
                      handleLinkChange(
                        index,
                        key as keyof MenuLink,
                        e.target.checked
                      )
                    }
                    className="mt-1 rounded"
                  />
                ) : (
                  <input
                    type="text"
                    value={value}
                    onChange={e =>
                      handleLinkChange(
                        index,
                        key as keyof MenuLink,
                        e.target.value
                      )
                    }
                    className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        ))}
        <button
          onClick={handleAddLink}
          className="flex items-center text-myblue hover:text-myorange mt-2"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Link
        </button>
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={handleCancel}
          className="px-4 py-2 bg-mydarkgrey text-white rounded hover:bg-mydarkgrey/80"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-myblue text-white rounded hover:bg-myblue/80"
          disabled={!unsavedChanges}
        >
          Save
        </button>
      </div>
    </div>
  );
}
