import { useState, useCallback } from "react";
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import RebuildProgressModal from "../components/RebuildProgressModal";
import type { ChangeEvent } from "react";

const TursoConnectionForm = () => {
  const [showRebuildModal, setShowRebuildModal] = useState(false);
  const [formData, setFormData] = useState({
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateUrl = (url: string) => {
    if (!url.startsWith("libsql://")) {
      return "Database URL must start with libsql://";
    }
    return "";
  };

  const validateToken = (token: string) => {
    if (!token.startsWith("ey")) {
      return 'Auth token must start with "ey"';
    }
    return "";
  };

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    newErrors.TURSO_DATABASE_URL = validateUrl(formData.TURSO_DATABASE_URL);
    newErrors.TURSO_AUTH_TOKEN = validateToken(formData.TURSO_AUTH_TOKEN);
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error);
  };

  const handleSave = async () => {
    console.log(`save`, formData);
    if (!validate() || isSaving) return;
    try {
      setIsSaving(true);
      console.log("Making fetch request to env endpoint");
      const response = await fetch("/api/concierge/storykeep/env", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to save Turso settings");
      }
      setSaveSuccess(true);
      setShowRebuildModal(true);
    } catch (error) {
      console.error("Error saving Turso settings:", error);
      setErrors(prev => ({
        ...prev,
        submit: "Failed to save settings. Please try again.",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const commonInputClass =
    "block w-full rounded-md border-0 px-2.5 py-1.5 text-myblack ring-1 ring-inset ring-myorange/20 placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-myorange xs:text-md xs:leading-6";

  return (
    <div className="space-y-6">
      <RebuildProgressModal
        isOpen={showRebuildModal}
        onClose={() => setShowRebuildModal(false)}
      />
      {saveSuccess && (
        <div className="bg-mygreen/10 p-4 rounded-md">
          <p className="text-black font-bold">
            <CheckCircleIcon className="inline-block h-5 w-5 mr-2" />
            Connection settings saved successfully
          </p>
        </div>
      )}

      {errors.submit && (
        <div className="bg-myorange/10 p-4 rounded-md">
          <p className="text-black font-bold">
            <ExclamationTriangleIcon className="inline-block h-5 w-5 mr-2" />
            {errors.submit}
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label
            htmlFor="TURSO_DATABASE_URL"
            className="block text-sm font-bold text-mydarkgrey mb-1"
          >
            Turso Database URL
          </label>
          <div className="relative">
            <input
              id="TURSO_DATABASE_URL"
              name="TURSO_DATABASE_URL"
              type="text"
              value={formData.TURSO_DATABASE_URL}
              onChange={handleChange}
              placeholder="libsql://your-database-url"
              className={commonInputClass}
              autoComplete="off"
              autoComplete="new-password"
            />
            {errors.TURSO_DATABASE_URL && (
              <p className="text-sm text-myorange mt-1">
                {errors.TURSO_DATABASE_URL}
              </p>
            )}
          </div>
        </div>

        <div>
          <label
            htmlFor="TURSO_AUTH_TOKEN"
            className="block text-sm font-bold text-mydarkgrey mb-1"
          >
            Turso Auth Token
          </label>
          <div className="relative">
            <input
              id="TURSO_AUTH_TOKEN"
              name="TURSO_AUTH_TOKEN"
              type="password"
              value={formData.TURSO_AUTH_TOKEN}
              onChange={handleChange}
              placeholder="eyJhb...your-token"
              className={commonInputClass}
              autoComplete="off"
              autoComplete="new-password"
            />
            {errors.TURSO_AUTH_TOKEN && (
              <p className="text-sm text-myorange mt-1">
                {errors.TURSO_AUTH_TOKEN}
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-4">
          <button
            onClick={handleSave}
            disabled={
              isSaving ||
              !formData.TURSO_DATABASE_URL ||
              !formData.TURSO_AUTH_TOKEN
            }
            className="px-4 py-2 text-black bg-myorange rounded hover:bg-myblue hover:text-white disabled:bg-mydarkgrey disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Connection Settings"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TursoConnectionForm;
