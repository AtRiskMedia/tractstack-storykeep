import { useState, useCallback } from "react";
import type { FileDatum } from "../../../types";

interface ImageEditorProps {
  image: FileDatum;
  onCancel: () => void;
  onSave: (updatedImage: FileDatum) => void;
}

export default function ImageEditor({
  image,
  onCancel,
  onSave,
}: ImageEditorProps) {
  const [localImage, setLocalImage] = useState<FileDatum>(image);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const handleChange = useCallback((field: keyof FileDatum, value: string) => {
    setLocalImage(prev => ({ ...prev, [field]: value }));
    setUnsavedChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localImage);
    setUnsavedChanges(false);
  }, [localImage, onSave]);

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
        <img
          src={localImage.src}
          alt={localImage.altDescription}
          className="max-w-full h-auto mb-4"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mydarkgrey">
          Filename
        </label>
        <input
          type="text"
          value={localImage.filename}
          onChange={e => handleChange("filename", e.target.value)}
          className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-mydarkgrey">
          Alt Description
        </label>
        <input
          type="text"
          value={localImage.altDescription}
          onChange={e => handleChange("altDescription", e.target.value)}
          className="mt-1 block w-full rounded-md border-mydarkgrey shadow-sm focus:border-myblue focus:ring-myblue sm:text-sm"
        />
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
