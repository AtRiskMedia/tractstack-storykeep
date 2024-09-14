import { useState, useEffect, useCallback } from "react";
import { useStore } from "@nanostores/react";
import { Switch } from "@headlessui/react";
import {
  XMarkIcon,
  PlusIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { envSettings } from "../../../store/storykeep";
import ContentEditableField from "../components/ContentEditableField";
import type { EnvSetting } from "../../../types";

const EnvironmentSettings = () => {
  const $envSettings = useStore(envSettings);

  const [localSettings, setLocalSettings] = useState<EnvSetting[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    setLocalSettings($envSettings.current || []);
    setHasUnsavedChanges($envSettings.history.length > 0);
  }, [$envSettings.current, $envSettings.history]);

  useEffect(() => {
    setLocalSettings($envSettings.current || []);
  }, [$envSettings.current]);

  const handleSettingChange = useCallback(
    (index: number, field: keyof EnvSetting, newValue: string | boolean) => {
      setLocalSettings(prev => {
        const newSettings = [...prev];
        newSettings[index] = { ...newSettings[index], [field]: newValue };
        return newSettings;
      });
      setHasUnsavedChanges(true);
      return true;
    },
    []
  );

  const handleSettingEditingChange = useCallback(
    (editing: boolean) => {
      if (!editing) {
        console.log("must update envSettings", localSettings);
      }
    },
    [localSettings]
  );

  const toggleBooleanSetting = useCallback((index: number) => {
    setLocalSettings(prev => {
      const newSettings = [...prev];
      newSettings[index].value =
        newSettings[index].value === "true" ? "false" : "true";
      return newSettings;
    });
  }, []);

  const addSocialValue = useCallback((index: number) => {
    setLocalSettings(prev => {
      const newSettings = [...prev];
      const currentValues = newSettings[index].value.split("|");
      currentValues.push("");
      newSettings[index].value = currentValues.join("|");
      return newSettings;
    });
  }, []);

  const removeSocialValue = useCallback(
    (settingIndex: number, valueIndex: number) => {
      setLocalSettings(prev => {
        const newSettings = [...prev];
        const currentValues = newSettings[settingIndex].value.split("|");
        currentValues.splice(valueIndex, 1);
        newSettings[settingIndex].value = currentValues.join("|");
        return newSettings;
      });
    },
    []
  );

  const commonInputClass =
    "block w-full rounded-md border-0 px-2.5 py-1.5 pr-12 text-myblack ring-1 ring-inset ring-mygreen placeholder:text-mydarkgrey focus:ring-2 focus:ring-inset focus:ring-mygreen xs:text-sm xs:leading-6";

  const reset = useCallback(() => {
    // Mock publish function
    console.log("Reset changes:", localSettings);
    envSettings.set({
      current: localSettings,
      original: localSettings,
      history: [],
    });
    setHasUnsavedChanges(false);
  }, [localSettings]);

  const handlePublish = useCallback(() => {
    // Mock publish function
    console.log("Publishing changes:", localSettings);
    // Here you would typically make an API call to save the changes
    // After successful save:
    envSettings.set({
      current: localSettings,
      original: localSettings,
      history: [],
    });
    setHasUnsavedChanges(false);
  }, [localSettings]);

  return (
    <div className="space-y-8">
      {localSettings.map((setting, index) => (
        <div key={setting.name} className="space-y-2">
          <div className="flex items-center space-x-2">
            <label
              htmlFor={`setting-${setting.name}`}
              className="block text-sm text-mydarkgrey"
            >
              {setting.description}
            </label>
            <InformationCircleIcon
              className="h-5 w-5 text-myblue"
              title={setting.description}
            />
          </div>
          {setting.type === "boolean" ? (
            <Switch
              checked={setting.value === "true"}
              onChange={() => toggleBooleanSetting(index)}
              className={`${
                setting.value === "true" ? "bg-myorange" : "bg-mydarkgrey"
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-myorange focus:ring-offset-2`}
            >
              <span
                className={`${
                  setting.value === "true" ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          ) : setting.type === "string[]" ? (
            <div className="space-y-2">
              {setting.value.split("|").map((value, valueIndex) => (
                <div key={valueIndex} className="flex items-center space-x-2">
                  <ContentEditableField
                    id={`setting-${setting.name}-${valueIndex}`}
                    value={value}
                    onChange={newValue => {
                      const newValues = setting.value.split("|");
                      newValues[valueIndex] = newValue;
                      return handleSettingChange(
                        index,
                        "value",
                        newValues.join("|")
                      );
                    }}
                    onEditingChange={handleSettingEditingChange}
                    placeholder={`Enter ${setting.name} value`}
                    className={commonInputClass}
                  />
                  <button
                    onClick={() => removeSocialValue(index, valueIndex)}
                    className="text-myorange hover:text-black"
                    title="Remove value"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => addSocialValue(index)}
                className="flex items-center text-myblue hover:text-myorange"
              >
                <PlusIcon className="h-5 w-5 mr-1" />
                Add Value
              </button>
            </div>
          ) : (
            <ContentEditableField
              id={`setting-${setting.name}`}
              value={setting.value}
              onChange={newValue =>
                handleSettingChange(index, "value", newValue)
              }
              onEditingChange={handleSettingEditingChange}
              placeholder={`Enter ${setting.name}`}
              className={commonInputClass}
            />
          )}
        </div>
      ))}
      <div className="flex justify-end space-x-2">
        {hasUnsavedChanges && (
          <>
            <button
              onClick={reset}
              className="flex items-center text-white bg-myblue px-2 py-1 rounded hover:bg-myorange"
            >
              Cancel
            </button>

            <button
              onClick={handlePublish}
              className="flex items-center text-white bg-myblue px-2 py-1 rounded hover:bg-myorange"
            >
              Publish Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EnvironmentSettings;
