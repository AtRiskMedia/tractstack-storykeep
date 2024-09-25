import { useState, useCallback, useEffect } from "react";
import { Switch } from "@headlessui/react";
import { XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { getResourceSetting, processResourceValue } from "../../../constants";
import type { ResourceDatum, ResourceSetting } from "../../../types";

interface ResourceEditorProps {
  resource: ResourceDatum;
  onCancel: () => void;
  onSave: (updatedResource: ResourceDatum) => void;
}

export default function ResourceEditor({
  resource,
  onCancel,
  onSave,
}: ResourceEditorProps) {
  const [localResource, setLocalResource] = useState<ResourceDatum>(resource);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [resourceSetting, setResourceSetting] = useState<
    ResourceSetting | undefined
  >(undefined);

  useEffect(() => {
    const setting = getResourceSetting(resource.category || "");
    setResourceSetting(setting);
  }, [resource.category]);

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const handleChange = useCallback((field: keyof ResourceDatum, value: any) => {
    setLocalResource(prev => {
      const newResource = { ...prev, [field]: value };
      if (field === "category") {
        const newSetting = getResourceSetting(value);
        setResourceSetting(newSetting);
        if (newSetting) {
          Object.keys(newSetting).forEach(key => {
            if (!(key in newResource.optionsPayload)) {
              newResource.optionsPayload[key] = newSetting[key].defaultValue;
            }
          });
        }
      }
      return newResource;
    });
    setUnsavedChanges(true);
  }, []);

  const handleOptionsPayloadChange = useCallback(
    /* eslint-disable @typescript-eslint/no-explicit-any */
    (key: string, value: any) => {
      setLocalResource(prev => ({
        ...prev,
        optionsPayload: {
          ...prev.optionsPayload,
          [key]: resourceSetting
            ? processResourceValue(key, value, resourceSetting)
            : value,
        },
      }));
      setUnsavedChanges(true);
    },
    [resourceSetting]
  );

  const handleAddOptionPayloadField = useCallback(() => {
    const newKey = `newField${Object.keys(localResource.optionsPayload || {}).length}`;
    handleOptionsPayloadChange(newKey, "");
  }, [localResource.optionsPayload, handleOptionsPayloadChange]);

  const handleRemoveOptionPayloadField = useCallback((key: string) => {
    setLocalResource(prev => {
      const newOptionsPayload = { ...prev.optionsPayload };
      delete newOptionsPayload[key];
      return { ...prev, optionsPayload: newOptionsPayload };
    });
    setUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localResource);
    setUnsavedChanges(false);
  }, [localResource, onSave]);

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

  const renderField = (field: keyof ResourceDatum, label: string) => {
    const value = localResource[field];

    return (
      <div key={field}>
        <label className="block text-sm font-medium text-mydarkgrey">
          {label}
        </label>
        <input
          type="text"
          value={value === null || value === undefined ? "" : String(value)}
          onChange={e => handleChange(field, e.target.value)}
          className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
        />
      </div>
    );
  };

  /* eslint-disable @typescript-eslint/no-explicit-any */
  const renderOptionField = (key: string, value: any) => {
    const setting = resourceSetting && resourceSetting[key];
    const type = setting ? setting.type : typeof value;

    switch (type) {
      case "boolean":
        return (
          <Switch
            checked={value}
            onChange={newValue => handleOptionsPayloadChange(key, newValue)}
            className={`${
              value ? "bg-myorange" : "bg-mydarkgrey"
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
          >
            <span
              className={`${
                value ? "translate-x-6" : "translate-x-1"
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        );
      case "date":
        return (
          <input
            type="datetime-local"
            value={
              value ? new Date(value * 1000).toISOString().slice(0, -8) : ""
            }
            onChange={e => {
              const date = new Date(e.target.value);
              handleOptionsPayloadChange(
                key,
                Math.floor(date.getTime() / 1000)
              );
            }}
            className="w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
          />
        );
      default:
        return (
          <input
            type="text"
            value={value === null || value === undefined ? "" : String(value)}
            onChange={e => handleOptionsPayloadChange(key, e.target.value)}
            className="w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
          />
        );
    }
  };

  return (
    <div className="space-y-6">
      {renderField("title", "Title")}
      {renderField("slug", "Slug")}
      {renderField("category", "Category")}
      {renderField("oneliner", "Oneliner")}
      {renderField("actionLisp", "Action Lisp")}

      <div>
        <h3 className="text-lg font-medium text-mydarkgrey mb-2">
          Options Payload
        </h3>
        {Object.entries(localResource.optionsPayload || {}).map(
          ([key, value]) => (
            <div key={key} className="flex items-center space-x-2 mb-2">
              <input
                type="text"
                value={key}
                onChange={e => {
                  const newOptionsPayload = { ...localResource.optionsPayload };
                  delete newOptionsPayload[key];
                  newOptionsPayload[e.target.value] = value;
                  handleChange("optionsPayload", newOptionsPayload);
                }}
                className="w-1/3 rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
              />
              {renderOptionField(key, value)}
              <button
                onClick={() => handleRemoveOptionPayloadField(key)}
                className="text-myorange hover:text-black"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          )
        )}
        <button
          onClick={handleAddOptionPayloadField}
          className="flex items-center text-myblue hover:text-myorange mt-2"
        >
          <PlusIcon className="h-5 w-5 mr-1" />
          Add Field
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
